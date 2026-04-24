/**
 * BeforeInstallPromptEvent — proposed but not yet in lib.dom.d.ts.
 * Exposed by Chromium-based browsers when the PWA install criteria are met.
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: readonly string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

/** True when the page is already running as an installed PWA. */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  // iOS Safari sets `navigator.standalone`; everyone else exposes the
  // display-mode media query.
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const dmStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  return iosStandalone || dmStandalone;
}

/** Heuristic: is this an iOS Safari (or iOS embedded browser) that needs the
 *  manual Add-to-Home-Screen flow? Apple does not expose
 *  `beforeinstallprompt` so we have to detect by platform. */
export function isIosNeedingManualInstall(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
  if (!isIos) return false;
  if (isStandalone()) return false;
  return true;
}
