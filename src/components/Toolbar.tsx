import { useStore } from '../store';

export function Toolbar({
  mobileTab,
  onMobileTab,
}: {
  mobileTab: 'edit' | 'preview';
  onMobileTab: (t: 'edit' | 'preview') => void;
}) {
  const { resetBlank, loadSample, saveCurrent } = useStore();

  const confirmReset = () => {
    if (confirm('Start a blank invoice? Current edits will be cleared.')) resetBlank();
  };

  return (
    <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-white text-sm font-bold">
            I
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">Invoicer</div>
            <div className="text-[10px] text-ink-muted">Free invoice maker</div>
          </div>
        </div>

        <div className="mx-auto hidden sm:flex items-center gap-1 rounded-full bg-slate-100 p-1">
          <TabBtn active={mobileTab === 'edit'} onClick={() => onMobileTab('edit')}>
            Edit
          </TabBtn>
          <TabBtn active={mobileTab === 'preview'} onClick={() => onMobileTab('preview')}>
            Preview
          </TabBtn>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button className="btn-ghost hidden sm:inline-flex" onClick={loadSample} title="Load sample">
            Sample
          </button>
          <button className="btn-ghost hidden sm:inline-flex" onClick={confirmReset}>
            New
          </button>
          <button className="btn-ghost" onClick={saveCurrent}>
            Save
          </button>
          <button className="btn-primary" onClick={() => window.print()}>
            Print / PDF
          </button>
        </div>
      </div>

      <div className="sm:hidden flex items-center justify-center gap-1 pb-2">
        <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
          <TabBtn active={mobileTab === 'edit'} onClick={() => onMobileTab('edit')}>
            Edit
          </TabBtn>
          <TabBtn active={mobileTab === 'preview'} onClick={() => onMobileTab('preview')}>
            Preview
          </TabBtn>
        </div>
      </div>
    </header>
  );
}

function TabBtn({
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
        active ? 'bg-white text-ink shadow' : 'text-ink-soft hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
