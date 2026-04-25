import { useEffect, useState } from 'react';
import {
  isIosNeedingManualInstall,
  isStandalone,
  type BeforeInstallPromptEvent,
} from '../utils/install';

/**
 * Toolbar affordance for installing the PWA.
 *
 * - Chrome / Edge / Android: captures `beforeinstallprompt` and surfaces a
 *   button that triggers the native install dialog when clicked.
 * - iOS Safari: shows a small button that opens a hint popover explaining
 *   the manual Share → Add to Home Screen flow (Apple does not provide an
 *   automatic prompt).
 * - Already-installed (standalone): renders nothing.
 * - No support at all: renders nothing.
 */
export function InstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [iosUser] = useState<boolean>(() => isIosNeedingManualInstall());

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  // Chromium path — native install dialog
  if (prompt) {
    return (
      <button
        type="button"
        className="btn-ghost hidden sm:inline-flex"
        onClick={async () => {
          try {
            await prompt.prompt();
            const choice = await prompt.userChoice;
            if (choice.outcome === 'accepted') setInstalled(true);
            setPrompt(null);
          } catch {
            // user dismissed or browser threw — nothing to do
          }
        }}
        title="Install Invoicer to your device"
      >
        Install app
      </button>
    );
  }

  // iOS Safari path — manual hint
  if (iosUser) {
    return (
      <div className="relative">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setShowIosHint((v) => !v)}
          title="Install on iPhone / iPad"
        >
          Install
        </button>
        {showIosHint && (
          <>
            <button
              type="button"
              aria-label="Close install hint"
              className="fixed inset-0 z-30 cursor-default"
              onClick={() => setShowIosHint(false)}
            />
            <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xl">
              <div className="font-semibold text-ink">Install on iPhone / iPad</div>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-ink-soft">
                <li>
                  Tap the <strong>Share</strong> button{' '}
                  <span aria-hidden>⬆️</span> at the bottom of Safari.
                </li>
                <li>
                  Choose <strong>Add to Home Screen</strong>.
                </li>
                <li>Tap <strong>Add</strong> in the top-right.</li>
              </ol>
              <p className="mt-2 text-ink-muted">
                The app then launches full-screen and works offline.
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  // No install signal — render nothing.
  return null;
}
