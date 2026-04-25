import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { requestPersistentStorage } from './utils/storage';
import { applyTheme, watchSystemTheme } from './utils/theme';
import './index.css';

// Re-apply the theme on boot (covers cases where the inline script in
// index.html didn't run) and subscribe to OS-level scheme changes so
// 'system' theme tracks the device.
applyTheme();
watchSystemTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register the service worker only in production builds. During `vite dev`
// the SW would aggressively cache modules and break HMR.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}

// Best-effort: ask the browser to mark our storage as persistent so user
// invoices aren't auto-evicted under storage pressure. Some browsers grant
// this automatically once the user installs the PWA or visits frequently;
// others gate it behind a permission. Either way the call is harmless.
window.addEventListener('load', () => {
  requestPersistentStorage().catch(() => undefined);
});
