import { useState } from 'react';
import { useStore } from './store';
import { Toolbar } from './components/Toolbar';
import InvoicePreview from './components/InvoicePreview';
import { SenderForm } from './components/builder/SenderForm';
import { ClientForm } from './components/builder/ClientForm';
import { MetaForm } from './components/builder/MetaForm';
import { ItemsEditor } from './components/builder/ItemsEditor';
import { TotalsForm } from './components/builder/TotalsForm';
import { BankForm } from './components/builder/BankForm';
import { SignaturesForm } from './components/builder/SignaturesForm';
import { StyleForm } from './components/builder/StyleForm';
import { Library } from './components/builder/Library';

export default function App() {
  const invoice = useStore((s) => s.invoice);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="min-h-screen flex flex-col">
      <Toolbar mobileTab={mobileTab} onMobileTab={setMobileTab} />

      <main className="print-root mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 p-3 sm:flex-row sm:p-4">
        {/* Builder panel */}
        <section
          className={`no-print w-full sm:w-[440px] md:w-[480px] lg:w-[520px] shrink-0 space-y-3 ${
            mobileTab === 'preview' ? 'hidden' : ''
          }`}
        >
          <StyleForm />
          <SenderForm />
          <ClientForm />
          <MetaForm />
          <ItemsEditor />
          <TotalsForm />
          <BankForm />
          <SignaturesForm />
          <Library />
          <p className="text-center text-[11px] text-ink-muted py-4">
            Stored privately in your browser. Use Print / PDF to export.
          </p>
        </section>

        {/* Preview panel */}
        <section
          className={`flex-1 ${
            mobileTab === 'edit' ? 'hidden sm:flex' : 'flex'
          } items-start justify-center`}
        >
          <div className="preview-scroll w-full overflow-x-auto py-2">
            <div className="mx-auto w-fit">
              <InvoicePreview invoice={invoice} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
