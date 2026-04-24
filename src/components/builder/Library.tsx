import { useStore } from '../../store';
import { formatDate } from '../../utils/format';
import { Section } from '../ui/Section';

export function Library() {
  const library = useStore((s) => s.library);
  const currentId = useStore((s) => s.invoice.id);
  const { loadFromLibrary, duplicateInLibrary, deleteFromLibrary, saveCurrent } = useStore();

  return (
    <Section
      title="Saved invoices"
      subtitle={`${library.length} in library`}
      action={
        <button className="btn-primary" onClick={saveCurrent}>
          Save current
        </button>
      }
      defaultOpen={false}
    >
      {library.length === 0 ? (
        <div className="text-xs text-ink-muted">
          Save the current invoice to keep a copy here. Everything stays in your browser.
        </div>
      ) : (
        <ul className="divide-y divide-slate-200">
          {library.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {inv.meta.number || 'INVOICE'} — {inv.client.name || 'Untitled client'}
                </div>
                <div className="text-xs text-ink-muted">
                  {formatDate(inv.meta.date)} · {inv.style.templateId}
                  {inv.id === currentId && <span className="ml-2 chip bg-emerald-100 text-emerald-700">current</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="btn-ghost text-xs"
                  onClick={() => loadFromLibrary(inv.id)}
                  disabled={inv.id === currentId}
                >
                  Load
                </button>
                <button
                  className="btn-ghost text-xs"
                  onClick={() => duplicateInLibrary(inv.id)}
                >
                  Duplicate
                </button>
                <button
                  className="btn-danger text-xs"
                  onClick={() => deleteFromLibrary(inv.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
