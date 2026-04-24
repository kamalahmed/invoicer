import type { Invoice, InvoiceTax, LineItem } from '../../types';
import { DEFAULT_TAX } from '../tax';

let counter = 0;
const testId = () => `t-${++counter}`;

export function makeItem(p: Partial<LineItem> = {}): LineItem {
  return {
    id: testId(),
    description: 'Item',
    quantity: 1,
    rate: 100,
    ...p,
  };
}

export function makeInvoice(p: Partial<Invoice> = {}): Invoice {
  return {
    id: testId(),
    savedAt: 0,
    title: 'INVOICE',
    currency: 'USD',
    currencySymbol: '$',
    calcMode: 'quantity',
    sender: { name: 'Test Co', label: 'From' },
    client: { name: 'Client Co' },
    meta: { date: '2026-04-24' },
    items: [],
    totals: {},
    bank: {},
    signatories: [],
    style: {
      templateId: 'classic',
      accent: '#0f172a',
      fontFamily: 'sans',
      showBank: false,
      showSignatures: false,
      showDiscountColumn: false,
    },
    tax: { ...DEFAULT_TAX } as InvoiceTax,
    ...p,
  };
}
