import type { Invoice, LineItem } from '../types';

const num = (v: number | '' | undefined): number =>
  typeof v === 'number' && !isNaN(v) ? v : 0;

export function lineBase(item: LineItem, calcMode: Invoice['calcMode']): number {
  if (calcMode === 'days') {
    return num(item.daysWorked) * num(item.rate);
  }
  return num(item.quantity) * num(item.rate);
}

export function lineTotal(item: LineItem, calcMode: Invoice['calcMode']): number {
  const base = lineBase(item, calcMode);
  const afterDiscount = base * (1 - num(item.discount) / 100);
  const afterTax = afterDiscount * (1 + num(item.taxRate) / 100);
  return afterTax;
}

export function subtotal(inv: Invoice): number {
  return inv.items.reduce((s, i) => s + lineBase(i, inv.calcMode), 0);
}

export function taxTotal(inv: Invoice): number {
  return inv.items.reduce((s, i) => {
    const base = lineBase(i, inv.calcMode) * (1 - num(i.discount) / 100);
    return s + base * (num(i.taxRate) / 100);
  }, 0);
}

export function discountTotal(inv: Invoice): number {
  return inv.items.reduce(
    (s, i) => s + lineBase(i, inv.calcMode) * (num(i.discount) / 100),
    0
  );
}

export function grandTotal(inv: Invoice): number {
  return inv.items.reduce((s, i) => s + lineTotal(i, inv.calcMode), 0);
}

export function balanceDue(inv: Invoice): number {
  return grandTotal(inv) + num(inv.totals.adjustment) - num(inv.totals.paid);
}

export function money(amount: number, symbol = '$'): string {
  const safe = isFinite(amount) ? amount : 0;
  const abs = Math.abs(safe).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return safe < 0 ? `-${symbol}${abs}` : `${symbol}${abs}`;
}

export function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export const CURRENCIES: Array<{ code: string; symbol: string; name: string }> = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SAR ', name: 'Saudi Riyal' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'PKR', symbol: '₨ ', name: 'Pakistani Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];
