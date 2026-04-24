import type { Invoice, ColumnLabels } from '../types';

export const DEFAULT_COLUMN_LABELS = {
  description: 'Description',
  calendarDays: 'Calendar Days',
  quantity: 'Qty',
  daysWorked: 'Days Worked',
  rate: 'Rate',
  rateDays: 'Rate / Day',
  tax: 'Tax %',
  total: 'Total',
} as const;

export interface ResolvedLabels {
  description: string;
  calendarDays: string;
  quantity: string;
  daysWorked: string;
  rate: string;
  tax: string;
  total: string;
}

function firstDefined(...vals: Array<string | undefined>): string | undefined {
  for (const v of vals) {
    if (v !== undefined && v !== null && v.trim() !== '') return v;
  }
  return undefined;
}

/**
 * Resolve the labels to display for the items table, falling back to sensible
 * defaults when the user hasn't customised a particular label.
 */
export function resolveColumnLabels(inv: Invoice): ResolvedLabels {
  const c: ColumnLabels = inv.columnLabels ?? {};
  const days = inv.calcMode === 'days';
  return {
    description: firstDefined(c.description) ?? DEFAULT_COLUMN_LABELS.description,
    calendarDays: firstDefined(c.calendarDays) ?? DEFAULT_COLUMN_LABELS.calendarDays,
    quantity: firstDefined(c.quantity) ?? DEFAULT_COLUMN_LABELS.quantity,
    daysWorked: firstDefined(c.daysWorked) ?? DEFAULT_COLUMN_LABELS.daysWorked,
    rate: firstDefined(c.rate) ?? (days ? DEFAULT_COLUMN_LABELS.rateDays : DEFAULT_COLUMN_LABELS.rate),
    tax: firstDefined(c.tax) ?? DEFAULT_COLUMN_LABELS.tax,
    total: firstDefined(c.total) ?? DEFAULT_COLUMN_LABELS.total,
  };
}
