import { useEffect, useState } from 'react';
import { getStoredTheme, setTheme, type Theme } from '../utils/theme';

const ORDER: Theme[] = ['light', 'dark', 'system'];

const ICON: Record<Theme, JSX.Element> = {
  light: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  system: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
};

const LABEL: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

/**
 * 3-state theme toggle. Cycles Light → Dark → System on click. Persists to
 * localStorage and applies the `dark` class on `<html>` synchronously.
 */
export function ThemeToggle() {
  const [theme, setLocalTheme] = useState<Theme>('system');

  useEffect(() => {
    setLocalTheme(getStoredTheme());
  }, []);

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(next);
        setLocalTheme(next);
      }}
      className="btn-ghost text-xs"
      title={`Theme: ${LABEL[theme]} — click for ${LABEL[next]}`}
      aria-label={`Theme: ${LABEL[theme]}. Click to switch to ${LABEL[next]}.`}
    >
      <span className="inline-flex">{ICON[theme]}</span>
      <span className="hidden sm:inline">{LABEL[theme]}</span>
    </button>
  );
}
