import { useState } from 'react';
import { useStore } from '../../store';
import { formatDate, money } from '../../utils/format';
import { invoiceStatus, type InvoiceStatus } from '../../utils/invoiceStats';
import { balanceDue, grandTotal } from '../../utils/format';
import { PdfDownloadButton } from './PdfDownloadButton';

function StatusPill({ status }: { status: InvoiceStatus }) {
  const styles: Record<InvoiceStatus, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-800',
    open: 'bg-slate-100 text-slate-700',
  };
  const labels: Record<InvoiceStatus, string> = {
    paid: 'Paid',
    partial: 'Partial',
    open: 'Open',
  };
  return (
    <span className={`chip ${styles[status]}`}>
      <span
        className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70"
        aria-hidden
      />
      {labels[status]}
    </span>
  );
}

export function InvoiceList() {
  const library = useStore((s) => s.library);
  const loadFromLibrary = useStore((s) => s.loadFromLibrary);
  const duplicateInLibrary = useStore((s) => s.duplicateInLibrary);
  const deleteFromLibrary = useStore((s) => s.deleteFromLibrary);
  const resetBlank = useStore((s) => s.resetBlank);
  const setView = useStore((s) => s.setView);
  const currentId = useStore((s) => s.invoice.id);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const empty = library.length === 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Invoices</h2>
          <p className="text-xs text-ink-muted">
            Saved invoices you can re-open, duplicate or export.
          </p>
        </div>
        <button className="btn-primary" onClick={resetBlank}>
          + New invoice
        </button>
      </header>

      {empty ? (
        <div className="p-8 text-center text-sm text-ink-muted">
          No invoices saved yet. Create one and hit <strong>Save</strong> in the editor
          to see it here.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-5 py-2">#</th>
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Balance</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {library.map((inv) => {
                const status = invoiceStatus(inv);
                const isCurrent = inv.id === currentId;
                return (
                  <tr
                    key={inv.id}
                    className="border-t border-slate-100 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3 font-medium">
                      {inv.meta.number || '—'}
                      {isCurrent && (
                        <span className="ml-2 chip bg-emerald-100 text-emerald-700">
                          current
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="truncate">{inv.client.name || 'Untitled client'}</div>
                      {inv.client.email && (
                        <div className="truncate text-xs text-ink-muted">{inv.client.email}</div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{formatDate(inv.meta.date)}</td>
                    <td className="px-3 py-3 text-right font-medium">
                      {money(grandTotal(inv), inv.currencySymbol)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {money(balanceDue(inv), inv.currencySymbol)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill status={status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <button
                          className="btn-ghost text-xs"
                          onClick={() => {
                            loadFromLibrary(inv.id);
                            setView('editor');
                          }}
                        >
                          Open
                        </button>
                        <button
                          className="btn-ghost text-xs"
                          onClick={() => duplicateInLibrary(inv.id)}
                          title="Duplicate"
                        >
                          Duplicate
                        </button>
                        <PdfDownloadButton invoice={inv} variant="ghost" label="PDF" />
                        {confirmId === inv.id ? (
                          <>
                            <button
                              className="btn-danger text-xs"
                              onClick={() => {
                                deleteFromLibrary(inv.id);
                                setConfirmId(null);
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              className="btn-ghost text-xs"
                              onClick={() => setConfirmId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn-danger text-xs"
                            onClick={() => setConfirmId(inv.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
