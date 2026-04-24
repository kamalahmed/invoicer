import { useStore } from '../store';
import { StatCards } from '../components/dashboard/StatCards';
import { InvoiceList } from '../components/dashboard/InvoiceList';
import { ClientsList } from '../components/dashboard/ClientsList';

export function Dashboard() {
  const library = useStore((s) => s.library);
  const clients = useStore((s) => s.clients);
  const resetBlank = useStore((s) => s.resetBlank);
  const loadSample = useStore((s) => s.loadSample);
  const setView = useStore((s) => s.setView);
  const currentNumber = useStore((s) => s.invoice.meta.number);

  const hasStuff = library.length > 0 || clients.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Your invoices and clients, all in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn-ghost"
            onClick={() => setView('editor')}
            title="Continue editing the current invoice"
          >
            Open editor{currentNumber ? ` — ${currentNumber}` : ''}
          </button>
          <button className="btn-primary" onClick={resetBlank}>
            + New invoice
          </button>
        </div>
      </header>

      <StatCards />

      {!hasStuff && (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <h2 className="text-lg font-semibold">Welcome — let's get you an invoice.</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Start with a blank invoice, try the sample, or add a client to reuse later.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button className="btn-primary" onClick={resetBlank}>
              Start a blank invoice
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                loadSample();
                setView('editor');
              }}
            >
              Load sample
            </button>
          </div>
        </section>
      )}

      <InvoiceList />
      <ClientsList />
    </div>
  );
}
