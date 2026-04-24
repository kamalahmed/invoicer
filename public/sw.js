/* Invoicer service worker.
 *
 * Strategy:
 * - App shell ('/') is precached on install so the app launches offline.
 * - Navigations: network-first with a cache fallback (so users get fresh
 *   HTML when online, but still see a usable app when offline).
 * - Hashed assets under /assets/ are cache-first (immutable filenames mean
 *   we can serve them from cache forever without staleness concerns).
 * - Other GETs fall through to the network.
 *
 * Bump CACHE_VERSION whenever the offline behaviour needs to change so old
 * caches get cleared on activate.
 */
const CACHE_VERSION = 'invoicer-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put('/index.html', copy)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match('/index.html').then((m) => m || Response.error()))
    );
    return;
  }

  // Hashed assets: cache-first, populate on miss.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy)).catch(() => undefined);
          }
          return res;
        });
      })
    );
    return;
  }
});
