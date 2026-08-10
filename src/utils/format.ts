import type { Invoice, LineItem } from '../types';
import { resolveTax } from './tax';

const num = (v: number | '' | undefined): number =>
  typeof v === 'number' && !isNaN(v) ? v : 0;

export function hasOverride(item: LineItem): boolean {
  return typeof item.totalOverride === 'number' && !isNaN(item.totalOverride);
}

/** Raw qty × rate before discount/tax. Overridden items use their override. */
export function lineBase(item: LineItem, calcMode: Invoice['calcMode']): number {
  if (hasOverride(item)) return num(item.totalOverride);
  if (calcMode === 'days') {
    return num(item.daysWorked) * num(item.rate);
  }
  return num(item.quantity) * num(item.rate);
}

/** Per-line total, including per-line tax/discount when applicable. */
export function lineTotal(item: LineItem, calcMode: Invoice['calcMode']): number {
  if (hasOverride(item)) return num(item.totalOverride);
  const base = lineBase(item, calcMode);
  const afterDiscount = base * (1 - num(item.discount) / 100);
  const afterTax = afterDiscount * (1 + num(item.taxRate) / 100);
  return afterTax;
}

export function subtotal(inv: Invoice): number {
  return inv.items.reduce((s, i) => s + lineBase(i, inv.calcMode), 0);
}

export function discountTotal(inv: Invoice): number {
  return inv.items.reduce((s, i) => {
    if (hasOverride(i)) return s;
    return s + lineBase(i, inv.calcMode) * (num(i.discount) / 100);
  }, 0);
}

/**
 * Total tax across the invoice. Handles disabled, per-line, and
 * subtotal mode (with inclusive tax extraction: subtotal × r / (100 + r)).
 */
export function taxTotal(inv: Invoice): number {
  const t = resolveTax(inv);
  if (!t.enabled) return 0;
  if (t.mode === 'per_line') {
    return inv.items.reduce((s, i) => {
      if (hasOverride(i)) return s;
      const base = lineBase(i, inv.calcMode) * (1 - num(i.discount) / 100);
      return s + base * (num(i.taxRate) / 100);
    }, 0);
  }
  const rate = num(t.rate);
  const base = subtotal(inv) - discountTotal(inv);
  if (t.inclusive) {
    return rate === 0 ? 0 : (base * rate) / (100 + rate);
  }
  return base * (rate / 100);
}

export function grandTotal(inv: Invoice): number {
  const t = resolveTax(inv);
  if (!t.enabled) {
    // No tax configured — fall back to the per-line totals (which may
    // contain legacy per-item taxRate values from pre-tax-section invoices).
    return inv.items.reduce((s, i) => s + lineTotal(i, inv.calcMode), 0);
  }
  if (t.mode === 'per_line') {
    return inv.items.reduce((s, i) => s + lineTotal(i, inv.calcMode), 0);
  }
  // Subtotal mode — sum of (base − discount) then tax added on top, unless
  // the subtotal is already inclusive in which case the total equals the
  // discounted subtotal.
  const base = subtotal(inv) - discountTotal(inv);
  if (t.inclusive) return base;
  return base + taxTotal(inv);
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
