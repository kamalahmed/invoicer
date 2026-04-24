import type { CustomField, Invoice } from '../types';
import { newId } from './id';
import { DEFAULT_TAX } from './tax';

export interface IndustryPreset {
  id: string;
  name: string;
  tagline: string;
  /** A short blurb shown in the card tooltip. */
  description: string;
  /** A soft background gradient used on the dashboard card. */
  preview: string;
  /** An emoji badge for the card. */
  icon: string;
  apply: (base: Invoice) => Invoice;
}

const cf = (label: string, value = ''): CustomField => ({
  id: newId(),
  label,
  value,
});

/**
 * Each preset takes a blank/current invoice and layers on defaults that
 * match the industry's usual billing shape. Visual template stays whatever
 * the user had picked — these are data presets, not designs.
 */
export const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: 'freelancer',
    name: 'Freelancer',
    tagline: 'Hourly services',
    description:
      'Designers, developers, writers. Hours × rate, compact columns, simple terms.',
    preview: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)',
    icon: '🧑‍💻',
    apply: (base) => ({
      ...base,
      title: 'INVOICE',
      calcMode: 'quantity',
      columnLabels: {
        ...base.columnLabels,
        quantity: 'Hours',
        rate: 'Rate / hr',
      },
      columnVisibility: { ...base.columnVisibility, serial: false },
      wideColumn: 'description',
      tax: { ...DEFAULT_TAX },
      items: [
        { id: newId(), description: 'Design & development — project work', quantity: 10, rate: 75 },
      ],
      customFields: [cf('Project')],
      totals: {
        ...base.totals,
        notes: 'Thank you for your business.',
        terms: 'Payment due within 14 days.',
      },
    }),
  },
  {
    id: 'agency',
    name: 'Agency / Studio',
    tagline: 'Creative projects',
    description:
      'Studios and agencies. Multiple deliverables per invoice, VAT presets enabled.',
    preview: 'linear-gradient(135deg,#0f172a 0%,#334155 100%)',
    icon: '🏢',
    apply: (base) => ({
      ...base,
      title: 'INVOICE',
      calcMode: 'quantity',
      columnLabels: { ...base.columnLabels, quantity: 'Qty' },
      columnVisibility: { ...base.columnVisibility, serial: false },
      wideColumn: 'description',
      tax: { enabled: true, label: 'VAT', rate: 20, mode: 'subtotal', inclusive: false },
      items: [
        { id: newId(), description: 'Brand identity — logo suite', quantity: 1, rate: 3500 },
        { id: newId(), description: 'Website design — key screens', quantity: 1, rate: 4500 },
        { id: newId(), description: 'Project management', quantity: 8, rate: 120 },
      ],
      customFields: [cf('Project code'), cf('PO #')],
      totals: {
        ...base.totals,
        notes: 'Phase 1 deliverables. Remaining phases billed separately.',
        terms: 'Net 30. A late fee of 1.5% applies after due date.',
      },
    }),
  },
  {
    id: 'retail',
    name: 'Retail / Products',
    tagline: 'SKUs, quantities, sales tax',
    description:
      'Storefronts and resellers. Leading SKU column, sales-tax preset, product-oriented.',
    preview: 'linear-gradient(135deg,#10b981 0%,#34d399 100%)',
    icon: '🛍️',
    apply: (base) => ({
      ...base,
      title: 'INVOICE',
      calcMode: 'quantity',
      columnLabels: { ...base.columnLabels, serial: 'SKU', quantity: 'Qty', rate: 'Price' },
      columnVisibility: { ...base.columnVisibility, serial: true },
      wideColumn: 'description',
      tax: { enabled: true, label: 'Sales Tax', rate: 7, mode: 'subtotal', inclusive: false },
      items: [
        { id: newId(), ref: 'SKU-001', description: 'Product name', quantity: 1, rate: 0 },
      ],
      customFields: [cf('Order #'), cf('Shipping method')],
      totals: {
        ...base.totals,
        notes: 'Items remain property of the seller until payment is received in full.',
        terms: 'Returns accepted within 14 days of delivery.',
      },
    }),
  },
  {
    id: 'contractor-days',
    name: 'Contractor — day rate',
    tagline: 'Calendar days + days worked',
    description:
      'Independent contractors billing by the day. Matches the classic HR-style timesheet invoice.',
    preview: 'linear-gradient(135deg,#f59e0b 0%,#fbbf24 100%)',
    icon: '📆',
    apply: (base) => ({
      ...base,
      title: 'INVOICE',
      calcMode: 'days',
      columnLabels: {
        ...base.columnLabels,
        description: 'Activity / Description',
        calendarDays: 'Calendar Days',
        daysWorked: 'Days Worked',
        rate: 'Rate / Day',
      },
      columnVisibility: { ...base.columnVisibility, serial: false, calendarDays: true },
      wideColumn: 'description',
      tax: { ...DEFAULT_TAX },
      items: [
        {
          id: newId(),
          description: 'No. of days worked',
          calendarDays: 30,
          daysWorked: 22,
          rate: 300,
        },
      ],
      customFields: [cf('Period'), cf('Department')],
      style: {
        ...base.style,
        showBank: true,
        showSignatures: true,
      },
      totals: {
        ...base.totals,
        notes: '',
        terms: 'Timesheet approval required before payment.',
      },
    }),
  },
  {
    id: 'legal',
    name: 'Legal / Consulting',
    tagline: 'Matters, billable hours',
    description:
      'Solicitors and consultants. Matter reference, retainer-friendly terms, hours × rate.',
    preview: 'linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%)',
    icon: '⚖️',
    apply: (base) => ({
      ...base,
      title: 'INVOICE',
      calcMode: 'quantity',
      columnLabels: { ...base.columnLabels, quantity: 'Hours', rate: 'Rate / hr' },
      columnVisibility: { ...base.columnVisibility, serial: false },
      wideColumn: 'description',
      tax: { ...DEFAULT_TAX },
      items: [
        { id: newId(), description: 'Legal research & drafting', quantity: 4, rate: 250 },
        { id: newId(), description: 'Client consultation', quantity: 2, rate: 250 },
      ],
      customFields: [cf('Matter #'), cf('Client reference')],
      totals: {
        ...base.totals,
        notes: 'Confidential. Work conducted under client-engagement letter.',
        terms: 'Retainer applies. Payment due within 30 days.',
      },
    }),
  },
  {
    id: 'medical',
    name: 'Medical / Healthcare',
    tagline: 'Service codes, patient info',
    description:
      'Clinics and practitioners. CPT/service code column, patient ID custom field.',
    preview: 'linear-gradient(135deg,#0ea5e9 0%,#14b8a6 100%)',
    icon: '🩺',
    apply: (base) => ({
      ...base,
      title: 'STATEMENT',
      calcMode: 'quantity',
      columnLabels: { ...base.columnLabels, serial: 'Code', quantity: 'Units', rate: 'Fee' },
      columnVisibility: { ...base.columnVisibility, serial: true },
      wideColumn: 'description',
      tax: { ...DEFAULT_TAX },
      items: [
        { id: newId(), ref: '99213', description: 'Office visit — established patient', quantity: 1, rate: 150 },
      ],
      customFields: [cf('Patient ID'), cf('Date of service'), cf('Insurance')],
      totals: {
        ...base.totals,
        notes: 'This is a statement; not a demand for immediate payment if covered by insurance.',
        terms: 'Please remit any patient-responsibility balance within 30 days.',
      },
    }),
  },
];

export function findIndustryPreset(id: string): IndustryPreset | undefined {
  return INDUSTRY_PRESETS.find((p) => p.id === id);
}
