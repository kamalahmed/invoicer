import { useStore } from '../../store';
import { INDUSTRY_PRESETS } from '../../utils/industries';

export function IndustryStarters({ title = 'Start from a template' }: { title?: string }) {
  const startFromIndustry = useStore((s) => s.startFromIndustry);
  return (
    <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-ink dark:text-slate-100">{title}</h2>
          <p className="text-xs text-ink-muted dark:text-slate-400">
            Pick the one closest to your work — we'll set up columns, tax, fields and sample lines.
          </p>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {INDUSTRY_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => startFromIndustry(p.id)}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ink/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            title={p.description}
          >
            <div
              className="flex h-16 items-center justify-between px-4 text-white"
              style={{ background: p.preview }}
            >
              <span className="text-xs font-semibold uppercase tracking-widest opacity-90">
                {p.tagline}
              </span>
              <span aria-hidden className="text-2xl drop-shadow-sm">
                {p.icon}
              </span>
            </div>
            <div className="px-4 py-3">
              <div className="text-sm font-semibold text-ink dark:text-slate-100">{p.name}</div>
              <div className="mt-1 text-xs text-ink-muted line-clamp-2 dark:text-slate-400">
                {p.description}
              </div>
              <div className="mt-2 text-xs font-medium text-ink-soft group-hover:text-ink dark:text-slate-300 dark:group-hover:text-slate-100">
                Start →
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
