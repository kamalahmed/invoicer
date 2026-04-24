import type { Invoice } from '../types';
import { DEFAULT_TAX } from './tax';

/**
 * Normalize an invoice that may have been persisted under an older schema.
 *
 * Over the project's lifetime the Invoice shape has grown (added `tax`,
 * `columnVisibility`, `wideColumn`, `columnLabels`, new style flags). Rather
 * than rely on scattered runtime `resolve*()` fallbacks forever, this helper
 * produces an invoice that matches the current shape — with sensible
 * defaults for anything missing.
 *
 * It is intentionally permissive: it accepts `any`, only reads the fields
 * it knows about, and never throws. Unknown fields are preserved so a
 * downgrade doesn't destroy data.
 */
export function migrateInvoice(raw: unknown): Invoice {
  const src = (raw ?? {}) as Partial<Invoice> & {
    style?: Partial<Invoice['style']> & {
      /** Pre-v2 flag that drove the per-line Tax column. Dropped in v2. */
      showTaxColumn?: boolean;
    };
  };

  const style = { ...(src.style ?? {}) } as Invoice['style'] & {
    showTaxColumn?: boolean;
  };

  // Pre-v2: if the user had the per-line tax column turned on and no `tax`
  // config yet, initialize tax as enabled in per-line mode so their
  // invoices keep rendering the same way.
  let tax = src.tax;
  if (!tax) {
    tax = style.showTaxColumn
      ? { ...DEFAULT_TAX, enabled: true, mode: 'per_line' }
      : { ...DEFAULT_TAX };
  }

  // Drop the legacy flag — its job is done.
  if ('showTaxColumn' in style) {
    delete style.showTaxColumn;
  }

  return {
    // Start with the source so unknown fields survive, then fill in
    // defaults for every field we care about.
    ...(src as Invoice),
    title: src.title ?? 'INVOICE',
    currency: src.currency ?? 'USD',
    currencySymbol: src.currencySymbol ?? '$',
    calcMode: src.calcMode ?? 'quantity',
    sender: src.sender ?? { name: '', label: 'From' },
    client: src.client ?? { name: '' },
    meta: src.meta ?? { date: new Date().toISOString().slice(0, 10) },
    items: Array.isArray(src.items) ? src.items : [],
    columnLabels: src.columnLabels ?? {},
    columnVisibility: src.columnVisibility ?? {},
    wideColumn: src.wideColumn ?? 'description',
    customFields: Array.isArray(src.customFields) ? src.customFields : [],
    tax,
    totals: src.totals ?? {},
    bank: src.bank ?? {},
    signatories: Array.isArray(src.signatories) ? src.signatories : [],
    style: {
      templateId: style.templateId ?? 'classic',
      accent: style.accent ?? '#0f172a',
      fontFamily: style.fontFamily ?? 'sans',
      logoDataUrl: style.logoDataUrl,
      showBank: !!style.showBank,
      showSignatures: style.showSignatures ?? true,
      showDiscountColumn: !!style.showDiscountColumn,
    },
    id: src.id ?? '',
    savedAt: src.savedAt ?? Date.now(),
  };
}

/**
 * Migrate a persisted store blob (invoice + library + clients). Safe to
 * call on any unknown shape — returns `null` if the input isn't plausibly
 * our state.
 */
export function migratePersisted(raw: unknown): {
  invoice: Invoice;
  library: Invoice[];
  clients: unknown[];
} | null {
  if (!raw || typeof raw !== 'object') return null;
  const src = raw as { invoice?: unknown; library?: unknown; clients?: unknown };
  if (!src.invoice) return null;
  const library = Array.isArray(src.library) ? src.library.map(migrateInvoice) : [];
  // Clients are new in v2. Default to empty for older persisted states.
  const clients = Array.isArray(src.clients) ? src.clients : [];
  return {
    invoice: migrateInvoice(src.invoice),
    library,
    clients,
  };
}
