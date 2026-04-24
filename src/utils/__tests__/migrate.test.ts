import { describe, expect, it } from 'vitest';
import { migrateInvoice, migratePersisted } from '../migrate';

describe('migrateInvoice()', () => {
  it('fills in defaults when fields are missing', () => {
    const migrated = migrateInvoice({ id: 'x' });
    expect(migrated.id).toBe('x');
    expect(migrated.title).toBe('INVOICE');
    expect(migrated.currency).toBe('USD');
    expect(migrated.calcMode).toBe('quantity');
    expect(migrated.items).toEqual([]);
    expect(migrated.signatories).toEqual([]);
    expect(migrated.style.templateId).toBe('classic');
    expect(migrated.tax).toMatchObject({ enabled: false, mode: 'subtotal' });
  });

  it('preserves unknown fields for forward-compat', () => {
    const migrated = migrateInvoice({ id: 'x', somethingFuture: 42 });
    expect((migrated as unknown as { somethingFuture: number }).somethingFuture).toBe(42);
  });

  it('converts the legacy style.showTaxColumn flag into per-line tax and drops the flag', () => {
    const migrated = migrateInvoice({
      id: 'x',
      style: {
        templateId: 'classic',
        accent: '#000',
        fontFamily: 'sans',
        showBank: false,
        showSignatures: false,
        showTaxColumn: true,
      },
    });
    expect(migrated.tax?.enabled).toBe(true);
    expect(migrated.tax?.mode).toBe('per_line');
    expect('showTaxColumn' in (migrated.style as object)).toBe(false);
  });

  it('respects existing tax config over the legacy flag', () => {
    const migrated = migrateInvoice({
      id: 'x',
      tax: { enabled: true, label: 'VAT', rate: 20, mode: 'subtotal', inclusive: false },
      style: {
        templateId: 'classic',
        accent: '#000',
        fontFamily: 'sans',
        showBank: false,
        showSignatures: false,
        showTaxColumn: true,
      },
    });
    expect(migrated.tax).toMatchObject({ label: 'VAT', rate: 20, mode: 'subtotal' });
  });

  it('defaults wideColumn and visibility/label objects', () => {
    const migrated = migrateInvoice({ id: 'x' });
    expect(migrated.wideColumn).toBe('description');
    expect(migrated.columnLabels).toEqual({});
    expect(migrated.columnVisibility).toEqual({});
  });
});

describe('migratePersisted()', () => {
  it('returns null for non-object input', () => {
    expect(migratePersisted(null)).toBeNull();
    expect(migratePersisted(undefined)).toBeNull();
    expect(migratePersisted('hello')).toBeNull();
  });

  it('returns null when the blob has no invoice', () => {
    expect(migratePersisted({ library: [] })).toBeNull();
  });

  it('migrates invoice and every library entry', () => {
    const out = migratePersisted({
      invoice: { id: 'a' },
      library: [{ id: 'b' }, { id: 'c' }],
    });
    expect(out).not.toBeNull();
    expect(out?.invoice.id).toBe('a');
    expect(out?.library.map((i) => i.id)).toEqual(['b', 'c']);
    expect(out?.library.every((i) => i.tax !== undefined)).toBe(true);
  });
});
