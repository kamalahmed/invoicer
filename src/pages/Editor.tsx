import { useStore } from '../store';
import InvoicePreview from '../components/InvoicePreview';
import { SenderForm } from '../components/builder/SenderForm';
import { ClientForm } from '../components/builder/ClientForm';
import { MetaForm } from '../components/builder/MetaForm';
import { ItemsEditor } from '../components/builder/ItemsEditor';
import { TotalsForm } from '../components/builder/TotalsForm';
import { BankForm } from '../components/builder/BankForm';
import { SignaturesForm } from '../components/builder/SignaturesForm';
import { StyleForm } from '../components/builder/StyleForm';
import { TaxForm } from '../components/builder/TaxForm';

export function Editor() {
  const invoice = useStore((s) => s.invoice);
  const mobileTab = useStore((s) => s.mobileTab);

  return (
    <main className="print-root mx-auto flex w-full max-w-[1400px] flex-1 min-h-0 flex-col gap-4 p-3 sm:flex-row sm:p-4">
      {/* Builder panel — scrolls independently on desktop so clicking a
          preview zone can focus the right section without the preview
          jumping around. */}
      <section
        className={`scroll-column no-print w-full sm:w-[440px] md:w-[480px] lg:w-[520px] shrink-0 space-y-3 sm:h-full sm:overflow-y-auto sm:pr-2 ${
          mobileTab === 'preview' ? 'hidden' : ''
        }`}
      >
        <StyleForm />
        <SenderForm />
        <ClientForm />
        <MetaForm />
        <ItemsEditor />
        <TaxForm />
        <TotalsForm />
        <BankForm />
        <SignaturesForm />
        <p className="text-center text-[11px] text-ink-muted py-4">
          Click any part of the invoice on the right to jump straight to its editor.
        </p>
      </section>

      {/* Preview panel — also scrolls independently so tall invoices
          stay fully visible. */}
      <section
        className={`scroll-column flex-1 ${
          mobileTab === 'edit' ? 'hidden sm:flex' : 'flex'
        } items-start justify-center sm:h-full sm:overflow-y-auto`}
      >
        <div className="preview-scroll w-full overflow-x-auto py-2">
          <div className="mx-auto w-fit">
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </section>
    </main>
  );
}
