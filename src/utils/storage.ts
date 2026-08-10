import { del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

/**
 * Zustand `persist` storage adapter backed by IndexedDB (via idb-keyval).
 *
 * IndexedDB allows larger quotas than localStorage (~5 MB cap) — important
 * once a user accumulates many invoices with logo + signature data URLs.
 *
 * On first read, if IndexedDB is empty but localStorage has the key
 * (data from previous releases), it migrates the value over and removes
 * the localStorage entry.
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
 * Ask the browser to mark storage as persistent so it isn't evicted
 * under storage pressure. Harmless and idempotent.
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
