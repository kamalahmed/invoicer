import { useStore } from '../../store';
import { money } from '../../utils/format';
import { libraryStats } from '../../utils/invoiceStats';

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: accent }}
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-slate-400">
          {label}
        </span>
      </div>
      <div className="mt-2 text-3xl font-semibold text-ink dark:text-slate-100">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-muted dark:text-slate-400">{hint}</div>}
    </div>
  );
}

export function StatCards() {
  const library = useStore((s) => s.library);
  const clients = useStore((s) => s.clients);
  const sym = useStore((s) => s.invoice.currencySymbol);
  const stats = libraryStats(library);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat
        label="Invoices"
        value={String(stats.count)}
        hint="saved in your library"
        accent="#0ea5e9"
      />
      <Stat
        label="Billed"
        value={money(stats.total, sym)}
        hint="grand total across all invoices"
        accent="#6366f1"
      />
      <Stat
        label="Paid"
        value={money(stats.paid, sym)}
        hint="from the Paid field on each invoice"
        accent="#16a34a"
      />
      <Stat
        label="Outstanding"
        value={money(stats.outstanding, sym)}
        hint={`across ${clients.length} saved client${clients.length === 1 ? '' : 's'}`}
        accent="#f59e0b"
      />
    </div>
  );
}
