import type { Invoice, WideColumn } from '../types';
import { resolveTax } from './tax';

export interface ResolvedColumns {
  serial: boolean;
  calendarDays: boolean;
  qty: boolean;
  rate: boolean;
  tax: boolean;
  discount: boolean;
  wide: WideColumn;
}

/**
 * Resolve which line-item table columns are visible, honouring the user's
 * toggles plus the sensible defaults (calendar days only in days mode, tax
 * column tied to tax mode, discount column tied to `style.showDiscountColumn`).
 */
export function resolveColumns(inv: Invoice): ResolvedColumns {
  const v = inv.columnVisibility ?? {};
  const days = inv.calcMode === 'days';
  const tax = resolveTax(inv);
  const wide: WideColumn = inv.wideColumn ?? 'description';
  return {
    // Serial column is opt-in.
    serial: v.serial ?? false,
    calendarDays: days && (v.calendarDays ?? true),
    qty: v.qty ?? true,
    rate: v.rate ?? true,
    tax: tax.enabled && tax.mode === 'per_line',
    discount: !!inv.style.showDiscountColumn,
    // When the user asked for the serial column to be wide but it's hidden,
    // silently fall back to description so nothing collapses to 0 width.
    wide: wide === 'serial' && !(v.serial ?? false) ? 'description' : wide,
  };
}

/**
 * Approx pixel widths used by the <colgroup>. The wide column is rendered
 * with `width: auto` and absorbs remaining space.
 */
export const COLUMN_WIDTHS = {
  serial: 72,
  calendarDays: 104,
  qty: 90,
  rate: 120,
  tax: 90,
  discount: 110,
  total: 120,
};
