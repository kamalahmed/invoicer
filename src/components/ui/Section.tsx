import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useStore, type SectionKey } from '../../store';

export function Section({
  title,
  children,
  defaultOpen = true,
  subtitle,
  action,
  sectionId,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  action?: ReactNode;
  /** Optional focus target — when the preview requests focus on this key,
   *  the section opens, scrolls to the top of the editor column, and pulses. */
  sectionId?: SectionKey;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLElement>(null);
  const focus = useStore((s) => s.focus);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!sectionId) return;
    if (focus.key !== sectionId || focus.token === 0) return;
    setOpen(true);
    // Wait a frame so the expansion is laid out before scrolling, otherwise
    // the target height is wrong and the section lands under the fold.
    requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus.token]);

  return (
    <section
      ref={ref}
      data-section-id={sectionId}
      className={`scroll-mt-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${
        pulse ? 'focus-pulse' : ''
      }`}
    >
      <header className="flex items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full transition ${
              open ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
          <span className="font-semibold text-ink dark:text-slate-100">{title}</span>
          {subtitle && (
            <span className="text-xs text-ink-muted dark:text-slate-400">— {subtitle}</span>
          )}
          <span className="ml-auto text-ink-muted text-xs dark:text-slate-400">
            {open ? 'Hide' : 'Show'}
          </span>
        </button>
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
      </header>
      {open && (
        <div className="border-t border-slate-200 p-4 space-y-3 dark:border-slate-800">
          {children}
        </div>
      )}
    </section>
  );
}
