import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import InvoicePreview from '../InvoicePreview';
import type { Invoice } from '../../types';
import { downloadInvoicePdf, pdfFilename } from '../../utils/pdf';

/**
 * Renders the invoice into an off-screen React root, captures it with
 * html2canvas, and triggers a PDF download. Works for any invoice (library
 * row, current, duplicated) without depending on what's visible.
 */
async function renderAndDownload(invoice: Invoice): Promise<void> {
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;left:-99999px;top:0;pointer-events:none;z-index:-1;';
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<InvoicePreview invoice={invoice} />);
  try {
    // Wait one paint so the templates and any web fonts lay out.
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => setTimeout(resolve, 120));
    const paper = container.querySelector('.invoice-paper') as HTMLElement | null;
    if (!paper) throw new Error('Invoice paper not found');
    await downloadInvoicePdf(paper, pdfFilename(invoice));
  } finally {
    root.unmount();
    container.remove();
  }
}

export function PdfDownloadButton({
  invoice,
  variant = 'primary',
  label = 'Download PDF',
  shortLabel,
}: {
  invoice: Invoice;
  variant?: 'primary' | 'ghost';
  label?: string;
  /** Optional short text shown below the `sm` breakpoint. Useful in the
   *  toolbar where horizontal space is scarce on phones. */
  shortLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const cls = variant === 'primary' ? 'btn-primary' : 'btn-ghost text-xs';
  return (
    <button
      type="button"
      className={cls}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await renderAndDownload(invoice);
        } catch (err) {
          alert(
            'Could not generate PDF: ' +
              (err instanceof Error ? err.message : String(err))
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? (
        'Generating…'
      ) : shortLabel ? (
        <>
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
