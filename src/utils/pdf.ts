import type { Invoice } from '../types';

/** Slugify for filenames. */
function safeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function pdfFilename(inv: Invoice): string {
  const parts = [inv.meta.number, inv.client.name, 'invoice']
    .filter((p): p is string => typeof p === 'string' && p.trim() !== '')
    .map(safeName);
  return `${parts.join('-') || 'invoice'}.pdf`;
}

/**
 * Render a DOM node (the invoice paper) to a downloadable PDF.
 *
 * Uses html2canvas for the render and jsPDF for pagination. The node is
 * captured at 2× scale for crisp print output, compressed as JPEG (keeps
 * file size tiny — typical one-page invoice is 80-200 KB), and laid out
 * across multiple Letter-size pages if the content is tall.
 */
export async function downloadInvoicePdf(
  node: HTMLElement,
  filename: string
): Promise<void> {
  // Lazy-load the heavy deps so they're not in the main bundle.
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
  });
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  // Fit canvas width to the page width; height scales proportionally.
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  if (imgH <= pageH) {
    pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH);
  } else {
    // Paginate: on each page, draw the same full-height image offset
    // upward so only the current page's slice appears within the
    // viewport. jsPDF clips whatever's outside the page.
    let y = 0;
    while (y < imgH) {
      pdf.addImage(imgData, 'JPEG', 0, -y, imgW, imgH);
      y += pageH;
      if (y < imgH) pdf.addPage();
    }
  }

  pdf.save(filename);
}
