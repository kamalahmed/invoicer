import { describe, expect, it } from 'vitest';
import {
  balanceDue,
  discountTotal,
  grandTotal,
  hasOverride,
  lineBase,
  lineTotal,
  money,
  subtotal,
  taxTotal,
} from '../format';
import { makeInvoice, makeItem } from './_helpers';

describe('money()', () => {
  it('formats positives with symbol prefix', () => {
    expect(money(1234.5, '$')).toBe('$1,234.50');
    expect(money(0, '$')).toBe('$0.00');
  });

  it('puts the minus sign before the symbol for negatives', () => {
    expect(money(-123, '$')).toBe('-$123.00');
    expect(money(-99.9, 'AED ')).toBe('-AED 99.90');
  });

  it('treats NaN and Infinity as zero', () => {
    expect(money(NaN, '$')).toBe('$0.00');
    expect(money(Infinity, '$')).toBe('$0.00');
  });
});

describe('lineBase / lineTotal (quantity mode)', () => {
  it('multiplies quantity by rate when no override', () => {
    const item = makeItem({ quantity: 3, rate: 50 });
    expect(lineBase(item, 'quantity')).toBe(150);
    expect(lineTotal(item, 'quantity')).toBe(150);
  });

  it('applies per-line discount and tax', () => {
    const item = makeItem({ quantity: 2, rate: 100, discount: 10, taxRate: 20 });
    // 200 × 0.9 × 1.2 = 216
    expect(lineTotal(item, 'quantity')).toBeCloseTo(216, 6);
  });

  it('returns the override verbatim when set, ignoring tax/discount', () => {
    const item = makeItem({ quantity: 2, rate: 100, discount: 50, taxRate: 100, totalOverride: 999 });
    expect(hasOverride(item)).toBe(true);
    expect(lineBase(item, 'quantity')).toBe(999);
    expect(lineTotal(item, 'quantity')).toBe(999);
  });
});

describe('lineBase / lineTotal (days mode)', () => {
  it('uses daysWorked × rate', () => {
    const item = makeItem({ daysWorked: 5, rate: 300, quantity: '' });
    expect(lineBase(item, 'days')).toBe(1500);
    expect(lineTotal(item, 'days')).toBe(1500);
  });

  it('empty daysWorked yields zero', () => {
    const item = makeItem({ daysWorked: '', rate: 300, quantity: '' });
    expect(lineBase(item, 'days')).toBe(0);
  });
});

describe('subtotal / grandTotal with tax modes', () => {
  it('no tax: grand total is the sum of line totals', () => {
    const inv = makeInvoice({
      items: [makeItem({ quantity: 2, rate: 100 }), makeItem({ quantity: 1, rate: 50 })],
    });
    expect(subtotal(inv)).toBe(250);
    expect(taxTotal(inv)).toBe(0);
    expect(grandTotal(inv)).toBe(250);
  });

  it('subtotal-mode tax: exclusive rate is added on top', () => {
    const inv = makeInvoice({
      items: [makeItem({ quantity: 1, rate: 100 })],
      tax: { enabled: true, label: 'VAT', rate: 20, mode: 'subtotal', inclusive: false },
    });
    expect(subtotal(inv)).toBe(100);
    expect(taxTotal(inv)).toBe(20);
    expect(grandTotal(inv)).toBe(120);
  });

  it('subtotal-mode inclusive: tax is extracted from the subtotal', () => {
    const inv = makeInvoice({
      items: [makeItem({ quantity: 1, rate: 120 })],
      tax: { enabled: true, label: 'VAT', rate: 20, mode: 'subtotal', inclusive: true },
    });
    // 120 × 20 / 120 = 20
    expect(taxTotal(inv)).toBeCloseTo(20, 6);
    // Grand total equals subtotal when tax is already inside
    expect(grandTotal(inv)).toBeCloseTo(120, 6);
  });

  it('per-line tax: each item contributes', () => {
    const inv = makeInvoice({
      items: [
        makeItem({ quantity: 1, rate: 100, taxRate: 10 }),
        makeItem({ quantity: 2, rate: 50, taxRate: 20 }),
      ],
      tax: { enabled: true, label: 'Tax', rate: 0, mode: 'per_line', inclusive: false },
    });
    // Line 1: 100 + 10 = 110. Line 2: 100 + 20 = 120. Total 230.
    expect(taxTotal(inv)).toBe(30);
    expect(grandTotal(inv)).toBe(230);
  });

  it('overridden lines skip the tax calc in per-line mode', () => {
    const inv = makeInvoice({
      items: [
        makeItem({ quantity: 1, rate: 100, taxRate: 100, totalOverride: 50 }),
        makeItem({ quantity: 1, rate: 100, taxRate: 10 }),
      ],
      tax: { enabled: true, label: 'Tax', rate: 0, mode: 'per_line', inclusive: false },
    });
    // Override line contributes 50 flat; second line contributes 110.
    expect(taxTotal(inv)).toBe(10);
    expect(grandTotal(inv)).toBe(160);
  });
});

describe('discountTotal', () => {
  it('sums line discounts', () => {
    const inv = makeInvoice({
      items: [
        makeItem({ quantity: 1, rate: 100, discount: 10 }), // 10 off
        makeItem({ quantity: 2, rate: 50, discount: 20 }), // 20 off
      ],
    });
    expect(discountTotal(inv)).toBe(30);
  });
});

describe('balanceDue', () => {
  it('adjusts by paid and adjustment', () => {
    const inv = makeInvoice({
      items: [makeItem({ quantity: 1, rate: 100 })],
      totals: { paid: 30, adjustment: 5 },
    });
    // 100 + 5 - 30 = 75
    expect(balanceDue(inv)).toBe(75);
  });
});
