import type { Invoice, LineItem } from '../types';
import { formatDate, lineTotal, money } from '../utils/format';

export function resolveLabel(sender: Invoice['sender']): string {
  return sender.label?.trim() || 'From';
}

export function hasValue(v: unknown): boolean {
  return v !== undefined && v !== null && String(v).trim() !== '';
}

export function renderMultiline(text?: string): JSX.Element | null {
  if (!text) return null;
  return (
    <>
      {text.split(/\r?\n/).map((ln, i) => (
        <div key={i}>{ln || ' '}</div>
      ))}
    </>
  );
}

export function lineQty(item: LineItem, calcMode: Invoice['calcMode']): string {
  if (calcMode === 'days') {
    return item.daysWorked === '' || item.daysWorked == null ? '' : String(item.daysWorked);
  }
  return item.quantity === '' || item.quantity == null ? '' : String(item.quantity);
}

export function lineTotalStr(item: LineItem, inv: Invoice): string {
  return money(lineTotal(item, inv.calcMode), inv.currencySymbol);
}

export function prettyDate(iso?: string): string {
  return formatDate(iso);
}
