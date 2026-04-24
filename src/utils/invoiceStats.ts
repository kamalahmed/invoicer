import type { Invoice, SavedClient } from '../types';
import { balanceDue, grandTotal } from './format';

export type InvoiceStatus = 'paid' | 'partial' | 'open';

export function invoiceStatus(inv: Invoice): InvoiceStatus {
  const total = grandTotal(inv);
  const paid = typeof inv.totals.paid === 'number' ? inv.totals.paid : 0;
  if (total > 0 && paid >= total) return 'paid';
  if (paid > 0) return 'partial';
  return 'open';
}

export interface LibraryStats {
  count: number;
  total: number;
  paid: number;
  outstanding: number;
}

export function libraryStats(library: Invoice[]): LibraryStats {
  let total = 0;
  let paid = 0;
  for (const inv of library) {
    total += grandTotal(inv);
    paid += typeof inv.totals.paid === 'number' ? inv.totals.paid : 0;
  }
  const outstanding = library.reduce((s, inv) => s + Math.max(0, balanceDue(inv)), 0);
  return { count: library.length, total, paid, outstanding };
}

/** Number of invoices each saved client appears on (by matching name). */
export function clientUsage(library: Invoice[], clients: SavedClient[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of clients) counts.set(c.id, 0);
  for (const inv of library) {
    const match = clients.find(
      (c) =>
        c.name.trim().toLowerCase() === (inv.client.name ?? '').trim().toLowerCase()
    );
    if (match) counts.set(match.id, (counts.get(match.id) ?? 0) + 1);
  }
  return counts;
}
