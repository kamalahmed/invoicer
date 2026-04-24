import { describe, expect, it } from 'vitest';
import { DEFAULT_TAX, findPreset, resolveTax, TAX_PRESETS } from '../tax';
import { makeInvoice } from './_helpers';

describe('TAX_PRESETS', () => {
  it('includes the common standards we advertise', () => {
    const ids = TAX_PRESETS.map((p) => p.id);
    for (const id of [
      'none',
      'vat-uk',
      'vat-eu',
      'vat-uae',
      'vat-ksa',
      'gst-in-18',
      'gst-au',
      'gst-nz',
      'hst-ca-on',
      'sales-us',
      'custom',
    ]) {
      expect(ids).toContain(id);
    }
  });

  it('lookup by id works for every preset', () => {
    for (const p of TAX_PRESETS) {
      expect(findPreset(p.id)).toEqual(p);
    }
    expect(findPreset('made-up')).toBeUndefined();
  });
});

describe('resolveTax()', () => {
  it('returns defaults for an invoice with no tax config', () => {
    const inv = makeInvoice({ tax: undefined });
    expect(resolveTax(inv)).toEqual(DEFAULT_TAX);
  });

  it('respects explicit tax config', () => {
    const inv = makeInvoice({
      tax: { enabled: true, label: 'GST', rate: 18, mode: 'subtotal', inclusive: false },
    });
    expect(resolveTax(inv)).toEqual({
      enabled: true,
      label: 'GST',
      rate: 18,
      mode: 'subtotal',
      inclusive: false,
    });
  });

  it('migrates legacy style.showTaxColumn into per-line tax', () => {
    const base = makeInvoice({ tax: undefined });
    // Force the legacy flag onto the style object — not part of the
    // current type, but older persisted invoices had it.
    (base.style as unknown as { showTaxColumn: boolean }).showTaxColumn = true;
    const t = resolveTax(base);
    expect(t.enabled).toBe(true);
    expect(t.mode).toBe('per_line');
  });
});
