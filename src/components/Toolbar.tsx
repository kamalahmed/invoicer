import { useRef } from 'react';
import { useStore } from '../store';
import type { Invoice } from '../types';
import { PdfDownloadButton } from './dashboard/PdfDownloadButton';
import { InstallButton } from './InstallButton';
import { ThemeToggle } from './ThemeToggle';

export function Toolbar() {
  const { resetBlank, loadSample, saveCurrent, replaceInvoice } = useStore();
  const invoice = useStore((s) => s.invoice);
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const mobileTab = useStore((s) => s.mobileTab);
  const setMobileTab = useStore((s) => s.setMobileTab);
  const importRef = useRef<HTMLInputElement>(null);

  const confirmReset = () => {
    if (confirm('Start a blank invoice? Current edits will be cleared.')) resetBlank();
  };

  const exportJSON = () => {
    const safeName = (invoice.meta.number || invoice.client.name || 'invoice')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const blob = new Blob([JSON.stringify(invoice, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName || 'invoice'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Invoice;
        if (!parsed || typeof parsed !== 'object' || !parsed.style || !parsed.items) {
          throw new Error('Invalid invoice JSON');
        }
        replaceInvoice(parsed);
        setView('editor');
      } catch (err) {
        alert('Could not import file: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.readAsText(file);
  };

  const inEditor = view === 'editor';

  return (
    <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {/* Top row: logo + Dashboard/Editor switcher (desktop) + primary actions */}
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={() => setView('dashboard')}
          className="flex shrink-0 items-center gap-2"
          title="Go to dashboard"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-white text-sm font-bold">
            I
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold leading-none">Invoicer</div>
            {/* Hide subtitle on small screens to free up width. */}
            <div className="hidden text-[10px] text-ink-muted sm:block">
              Free invoice maker
            </div>
          </div>
        </button>

        {/* Desktop view switcher — sits in the centre. On mobile it lives
            in its own dedicated row below so it doesn't crowd the actions. */}
        <div className="mx-auto hidden sm:flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
          <PillBtn active={view === 'dashboard'} onClick={() => setView('dashboard')}>
            Dashboard
          </PillBtn>
          <PillBtn active={view === 'editor'} onClick={() => setView('editor')}>
            Editor
          </PillBtn>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {/* Theme toggle and Install button on tablet/desktop only — on
              mobile they live in the secondary row to stop the top row
              from overflowing. */}
          <div className="hidden sm:inline-flex">
            <ThemeToggle />
          </div>
          <div className="hidden sm:inline-flex">
            <InstallButton />
          </div>
          {inEditor && (
            <>
              <button className="btn-ghost hidden md:inline-flex" onClick={loadSample} title="Load sample">
                Sample
              </button>
              <button className="btn-ghost hidden md:inline-flex" onClick={confirmReset}>
                New
              </button>
              <button
                className="btn-ghost hidden md:inline-flex"
                onClick={() => importRef.current?.click()}
                title="Import invoice JSON"
              >
                Import
              </button>
              <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importJSON(f);
                  e.currentTarget.value = '';
                }}
              />
              <button
                className="btn-ghost hidden md:inline-flex"
                onClick={exportJSON}
                title="Export invoice JSON"
              >
                Export
              </button>
              <button className="btn-ghost" onClick={saveCurrent}>
                Save
              </button>
              <PdfDownloadButton
                invoice={invoice}
                label="Download PDF"
                shortLabel="PDF"
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile-only secondary row.
          - Dashboard / Editor pill — top-level navigation between the two
            top-level views.
          - Form / Preview pill (only when in editor) — switches the *panel*
            on this single screen between the input form and the live
            preview. Renamed from "Edit" → "Form" so it isn't confused with
            the "Editor" view label above.
          - Install button — moved here from the top row to keep that row
            from overflowing on narrow phones. */}
      <div className="flex flex-wrap items-center justify-center gap-2 px-3 pb-2 sm:hidden">
        <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
          <PillBtn active={view === 'dashboard'} onClick={() => setView('dashboard')}>
            Dashboard
          </PillBtn>
          <PillBtn active={view === 'editor'} onClick={() => setView('editor')}>
            Editor
          </PillBtn>
        </div>
        {inEditor && (
          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
            <PillBtn active={mobileTab === 'edit'} onClick={() => setMobileTab('edit')}>
              Form
            </PillBtn>
            <PillBtn active={mobileTab === 'preview'} onClick={() => setMobileTab('preview')}>
              Preview
            </PillBtn>
          </div>
        )}
        <ThemeToggle />
        <InstallButton />
      </div>
    </header>
  );
}

function PillBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium transition ${
        active
          ? 'bg-white text-ink shadow dark:bg-slate-700 dark:text-slate-100'
          : 'text-ink-soft hover:text-ink dark:text-slate-400 dark:hover:text-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
