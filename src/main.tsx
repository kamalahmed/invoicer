import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { requestPersistentStorage } from './utils/storage';
import { applyTheme, watchSystemTheme } from './utils/theme';
import './index.css';

// Re-apply the theme on boot and subscribe to OS-level scheme changes.
applyTheme();
watchSystemTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register the service worker in production only (SW caches modules in dev and breaks HMR).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}

// Ask the browser to mark storage as persistent so invoices aren't evicted.
window.addEventListener('load', () => {
  requestPersistentStorage().catch(() => undefined);
});
