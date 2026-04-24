import { describe, expect, it } from 'vitest';
import { resolveColumns } from '../columns';
import { makeInvoice } from './_helpers';

describe('resolveColumns()', () => {
  it('returns sane defaults (matches sample layout)', () => {
    const cols = resolveColumns(makeInvoice());
    expect(cols).toEqual({
      serial: false,
      calendarDays: false, // quantity mode → hidden
      qty: true,
      rate: true,
      tax: false,
      discount: false,
      wide: 'description',
    });
  });

  it('shows calendar days only in days mode', () => {
    const cols = resolveColumns(makeInvoice({ calcMode: 'days' }));
    expect(cols.calendarDays).toBe(true);
  });

  it('hides calendar days when explicitly disabled', () => {
    const cols = resolveColumns(
      makeInvoice({ calcMode: 'days', columnVisibility: { calendarDays: false } })
    );
    expect(cols.calendarDays).toBe(false);
  });

  it('honours discount flag and tax mode', () => {
    const inv = makeInvoice({
      style: { ...makeInvoice().style, showDiscountColumn: true },
      tax: { enabled: true, label: 'Tax', rate: 0, mode: 'per_line', inclusive: false },
    });
    const cols = resolveColumns(inv);
    expect(cols.discount).toBe(true);
    expect(cols.tax).toBe(true);
  });

  it('falls back to description when serial is the chosen wide column but serial is off', () => {
    const cols = resolveColumns(
      makeInvoice({
        wideColumn: 'serial',
        columnVisibility: { serial: false },
      })
    );
    expect(cols.wide).toBe('description');
  });

  it('keeps serial-wide when serial is on', () => {
    const cols = resolveColumns(
      makeInvoice({
        wideColumn: 'serial',
        columnVisibility: { serial: true },
      })
    );
    expect(cols.wide).toBe('serial');
  });
});
