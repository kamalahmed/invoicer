import { del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

/**
 * Zustand `persist` storage adapter backed by IndexedDB (via idb-keyval).
 *
 * Why IndexedDB instead of localStorage?
 * - Larger quota (browsers typically allow 50%+ of available disk vs the
 *   ~5 MB cap on localStorage). Important once a user accumulates many
 *   invoices with logo + signature data URLs.
 * - Better candidate for `navigator.storage.persist()`, which asks the
 *   browser not to auto-evict under storage pressure.
 *
 * Important: clearing "cache" in browsers does NOT touch either localStorage
 * or IndexedDB — that's the HTTP cache only. Both stores are wiped only by
 * an explicit "Clear site data / cookies and site data" action. So the
 * benefit is durability under storage pressure, not protection from manual
 * clearing.
 *
 * One-time legacy migration: on first read of a key, if IndexedDB is empty
 * but localStorage has the same key (data from previous releases), copy it
 * over and remove the localStorage entry to avoid two sources of truth.
 */
export const idbStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const val = await get<string>(name);
      if (val !== undefined && val !== null) return val;
    } catch {
      // IDB can fail in private browsing / disabled storage. Fall through
      // to the localStorage check below.
    }

    // Legacy localStorage migration — runs at most once per key.
    try {
      const legacy = localStorage.getItem(name);
      if (legacy != null) {
        try {
          await set(name, legacy);
          localStorage.removeItem(name);
        } catch {
          // Couldn't write to IDB — leave the legacy value in localStorage
          // and serve it; we'll try again next session.
        }
        return legacy;
      }
    } catch {
      // localStorage may be unavailable — nothing to migrate.
    }

    return null;
  },

  setItem: async (name, value) => {
    try {
      await set(name, value);
    } catch {
      // Last-resort fallback so the user doesn't lose this write entirely.
      try {
        localStorage.setItem(name, value);
      } catch {
        // Both stores failed — nothing more we can do client-side.
      }
    }
  },

  removeItem: async (name) => {
    try {
      await del(name);
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

/**
 * Best-effort request that the browser mark our storage as persistent so
 * it isn't evicted under storage pressure. Some browsers grant this
 * automatically based on engagement signals (PWA installation, frequent
 * visits); others gate it behind a permission. Either way the call is
 * harmless and idempotent.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  if (!('storage' in navigator) || !navigator.storage?.persist) return false;
  try {
    const already = await navigator.storage.persisted?.();
    if (already) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
