export type TemplateId =
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'corporate'
  | 'creative'
  | 'elegant'
  | 'dark'
  | 'gradient'
  | 'bold'
  | 'playful';

export interface Party {
  name: string;
  label?: string;
  contractType?: string;
  address?: string;
  contact?: string;
  email?: string;
  website?: string;
  taxId?: string;
}

export interface Client {
  name: string;
  address?: string;
  contact?: string;
  email?: string;
  taxId?: string;
}

/** A reusable address-book entry. Stored separately from any single invoice. */
export interface SavedClient extends Client {
  id: string;
  createdAt: number;
}

export interface LineItem {
  id: string;
  ref?: string; // optional Serial/Ref column (SKU, date, #)
  description: string;
  calendarDays?: number | '';
  daysWorked?: number | '';
  rate: number | '';
  quantity?: number | '';
  taxRate?: number | ''; // percent
  discount?: number | ''; // percent
  // When set, bypasses qty × rate math. Editing Rate clears the override.
  totalOverride?: number | '';
}

export type CalcMode = 'days' | 'quantity';

export interface ColumnLabels {
  serial?: string; // default "#"
  description?: string;
  calendarDays?: string;
  quantity?: string; // used when calcMode === 'quantity'
  daysWorked?: string; // used when calcMode === 'days'
  rate?: string;
  tax?: string;
  total?: string;
}

export interface ColumnVisibility {
  serial?: boolean;
  calendarDays?: boolean; // only applies in days mode
  qty?: boolean;
  rate?: boolean;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

/** Which column absorbs extra horizontal space via colgroup. */
export type WideColumn = 'description' | 'serial';

export interface BankDetails {
  accountNumber?: string;
  bankName?: string;
  accountTitle?: string;
  iban?: string;
  swift?: string;
  notes?: string;
}

export interface Signatory {
  id: string;
  label: string;
  name?: string;
  title?: string;
  signatureDataUrl?: string;
}

export interface InvoiceMeta {
  number?: string;
  date: string; // ISO date
  dueDate?: string;
  period?: string;
  department?: string;
  poNumber?: string;
  reference?: string;
}

export interface InvoiceTotals {
  paid?: number | '';
  adjustment?: number | ''; // + or -
  adjustmentLabel?: string;
  notes?: string;
  terms?: string;
}

export interface InvoiceStyle {
  templateId: TemplateId;
  accent: string; // hex
  fontFamily: 'sans' | 'serif' | 'mono';
  logoDataUrl?: string;
  showBank: boolean;
  showSignatures: boolean;
  /**
   * Shows the Discount % column on the items table. Tax column visibility
   * is now driven by `Invoice.tax` (mode === 'per_line').
   * `showTaxColumn` is kept for backwards compatibility with older saved
   * invoices — on load it's migrated into `tax.enabled` + per-line mode.
   */
  showDiscountColumn?: boolean;
  /** @deprecated — use `Invoice.tax` instead. Read only for migration. */
  showTaxColumn?: boolean;
}

export type TaxMode = 'subtotal' | 'per_line';

export interface InvoiceTax {
  enabled: boolean;
  label: string;
  rate: number | '';
  mode: TaxMode;
  /** True if line prices already include this tax. */
  inclusive: boolean;
  /** Optional split into two components (e.g. India CGST + SGST at half rate each). */
  split?: {
    enabled: boolean;
    primaryLabel: string;
    secondaryLabel: string;
  };
}

export interface Invoice {
  id: string;
  savedAt: number;
  title: string; // document title, usually "INVOICE"
  currency: string; // e.g. "USD", "AED"
  currencySymbol: string; // e.g. "$", "AED"
  calcMode: CalcMode;
  sender: Party;
  client: Client;
  meta: InvoiceMeta;
  items: LineItem[];
  columnLabels?: ColumnLabels;
  columnVisibility?: ColumnVisibility;
  wideColumn?: WideColumn;
  /** User-defined label/value rows shown in the invoice meta area. */
  customFields?: CustomField[];
  tax?: InvoiceTax;
  totals: InvoiceTotals;
  bank: BankDetails;
  signatories: Signatory[];
  style: InvoiceStyle;
}
