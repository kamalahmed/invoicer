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
  label?: string; // e.g. "Contractor Name"
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
  /** Short identifier used by the optional Serial/Ref column (SKU, date, #). */
  ref?: string;
  description: string;
  calendarDays?: number | '';
  daysWorked?: number | '';
  rate: number | '';
  quantity?: number | '';
  taxRate?: number | ''; // percent
  discount?: number | ''; // percent
  /**
   * Manual line total override. When set (a number), this value is used as
   * the line total and the usual qty × rate (plus tax / discount) math is
   * ignored. Editing Rate clears the override; editing Qty with an override
   * in place rederives Rate = override / qty.
   */
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

/**
 * Visibility flags for each line-item table column. Some columns
 * (description, total) are always shown. Tax and discount visibility are
 * driven elsewhere (tax mode and `style.showDiscountColumn` respectively).
 */
export interface ColumnVisibility {
  serial?: boolean; // default false
  calendarDays?: boolean; // default true (only applies in days mode)
  qty?: boolean; // default true
  rate?: boolean; // default true
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

/**
 * Which column should absorb the extra horizontal space. Other columns get
 * compact fixed widths via colgroup. Default is 'description' — matches the
 * original contractor-sample layout.
 */
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
  label: string; // e.g. "ICA Signature"
  name?: string;
  title?: string;
  signatureDataUrl?: string; // PNG data url
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
  /** Display label, e.g. "VAT", "GST", "Sales Tax". */
  label: string;
  /** Overall rate in percent. For split tax this is the combined rate. */
  rate: number | '';
  /** Whether tax is applied per line item or once on the subtotal. */
  mode: TaxMode;
  /** True if line prices already include this tax. */
  inclusive: boolean;
  /**
   * Optional split into two components (e.g. India CGST + SGST at half the
   * combined rate each). When enabled, the invoice shows two separate tax
   * rows; totals are identical.
   */
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
