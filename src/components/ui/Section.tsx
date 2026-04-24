import { useState, type ReactNode } from 'react';

export function Section({
  title,
  children,
  defaultOpen = true,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  action?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full transition ${
              open ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          />
          <span className="font-semibold text-ink">{title}</span>
          {subtitle && (
            <span className="text-xs text-ink-muted">— {subtitle}</span>
          )}
          <span className="ml-auto text-ink-muted text-xs">
            {open ? 'Hide' : 'Show'}
          </span>
        </button>
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
      </header>
      {open && <div className="border-t border-slate-200 p-4 space-y-3">{children}</div>}
    </section>
  );
}
