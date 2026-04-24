import { describe, expect, it } from 'vitest';
import { INDUSTRY_PRESETS, findIndustryPreset } from '../industries';
import { makeInvoice } from './_helpers';

describe('industry presets', () => {
  it('ships with the 6 advertised starters', () => {
    const ids = INDUSTRY_PRESETS.map((p) => p.id);
    for (const id of [
      'freelancer',
      'agency',
      'retail',
      'contractor-days',
      'legal',
      'medical',
    ]) {
      expect(ids).toContain(id);
    }
  });

  it('lookup by id works for every preset', () => {
    for (const p of INDUSTRY_PRESETS) {
      expect(findIndustryPreset(p.id)).toBe(p);
    }
    expect(findIndustryPreset('nope')).toBeUndefined();
  });

  it('freelancer: hourly columns, no tax, one line', () => {
    const inv = findIndustryPreset('freelancer')!.apply(makeInvoice());
    expect(inv.calcMode).toBe('quantity');
    expect(inv.columnLabels?.quantity).toBe('Hours');
    expect(inv.columnLabels?.rate).toBe('Rate / hr');
    expect(inv.tax?.enabled).toBe(false);
    expect(inv.items).toHaveLength(1);
  });

  it('agency: VAT 20% preset with sample lines', () => {
    const inv = findIndustryPreset('agency')!.apply(makeInvoice());
    expect(inv.tax).toMatchObject({ enabled: true, label: 'VAT', rate: 20, mode: 'subtotal' });
    expect(inv.items.length).toBeGreaterThan(1);
    expect(inv.customFields?.some((f) => /project/i.test(f.label))).toBe(true);
  });

  it('retail: serial column on with SKU label, sales tax preset', () => {
    const inv = findIndustryPreset('retail')!.apply(makeInvoice());
    expect(inv.columnVisibility?.serial).toBe(true);
    expect(inv.columnLabels?.serial).toBe('SKU');
    expect(inv.tax).toMatchObject({ enabled: true, label: 'Sales Tax' });
  });

  it('contractor-days: days mode with calendar days visible, bank + signatures on', () => {
    const inv = findIndustryPreset('contractor-days')!.apply(makeInvoice());
    expect(inv.calcMode).toBe('days');
    expect(inv.columnVisibility?.calendarDays).toBe(true);
    expect(inv.style.showBank).toBe(true);
    expect(inv.style.showSignatures).toBe(true);
  });

  it('legal: hours mode and matter / client reference custom fields', () => {
    const inv = findIndustryPreset('legal')!.apply(makeInvoice());
    expect(inv.columnLabels?.quantity).toBe('Hours');
    const labels = (inv.customFields ?? []).map((f) => f.label.toLowerCase());
    expect(labels).toContain('matter #');
    expect(labels).toContain('client reference');
  });

  it('medical: titled STATEMENT with Code column and patient ID', () => {
    const inv = findIndustryPreset('medical')!.apply(makeInvoice());
    expect(inv.title).toBe('STATEMENT');
    expect(inv.columnLabels?.serial).toBe('Code');
    const labels = (inv.customFields ?? []).map((f) => f.label.toLowerCase());
    expect(labels).toContain('patient id');
  });

  it('presets never mutate the input invoice', () => {
    const before = makeInvoice();
    const snapshot = JSON.stringify(before);
    for (const p of INDUSTRY_PRESETS) {
      p.apply(before);
      expect(JSON.stringify(before)).toBe(snapshot);
    }
  });
});
