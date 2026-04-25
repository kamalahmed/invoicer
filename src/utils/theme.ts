/**
 * Light / dark / system theme management.
 *
 * Storage key: `invoicer:theme` (separate from the zustand-persisted store
 * so it can be applied synchronously before React boots, eliminating the
 * flash-of-light-theme on dark-mode users.)
 *
 * The same logic is duplicated as an inline `<script>` in `index.html` to
 * apply the class before any CSS loads — that script writes the class onto
 * `<html>` and this module then takes over for runtime toggling.
 */

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'invoicer:theme';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getStoredTheme(): Theme {
  if (!isBrowser()) return 'system';
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    // localStorage may throw in private mode
  }
  return 'system';
}

export function systemPrefersDark(): boolean {
  if (!isBrowser() || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveDark(theme: Theme = getStoredTheme()): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return systemPrefersDark();
}

export function applyTheme(theme: Theme = getStoredTheme()): void {
  if (!isBrowser()) return;
  document.documentElement.classList.toggle('dark', resolveDark(theme));
}

export function setTheme(theme: Theme): void {
  if (!isBrowser()) return;
  try {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore — applying still works for this session
  }
  applyTheme(theme);
}

/** Subscribe to OS-level scheme changes so 'system' theme follows them. */
export function watchSystemTheme(): () => void {
  if (!isBrowser() || !window.matchMedia) return () => undefined;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    if (getStoredTheme() === 'system') applyTheme('system');
  };
  mq.addEventListener?.('change', handler);
  return () => mq.removeEventListener?.('change', handler);
}
