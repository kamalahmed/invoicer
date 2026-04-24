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

export interface LineItem {
  id: string;
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
  description?: string;
  calendarDays?: string;
  quantity?: string; // used when calcMode === 'quantity'
  daysWorked?: string; // used when calcMode === 'days'
  rate?: string;
  tax?: string;
  total?: string;
}

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
  showTaxColumn: boolean;
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
  totals: InvoiceTotals;
  bank: BankDetails;
  signatories: Signatory[];
  style: InvoiceStyle;
}
