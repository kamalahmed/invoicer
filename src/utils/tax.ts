import type { Invoice, InvoiceTax } from '../types';

export interface TaxPreset {
  id: string;
  country?: string;
  label: string;
  rate: number;
  description: string;
}

/**
 * Common invoice tax presets grouped roughly by region. Users can still pick
 * "Custom" and enter any rate. Rates here match the headline standard rates
 * at the time of writing — reduced rates and exemptions vary by country and
 * are the user's responsibility.
 */
export const TAX_PRESETS: TaxPreset[] = [
  { id: 'none', label: 'No tax', rate: 0, description: 'Tax disabled' },
  { id: 'vat-uk', country: 'UK', label: 'VAT', rate: 20, description: 'United Kingdom VAT — standard 20%' },
  { id: 'vat-eu', country: 'EU', label: 'VAT', rate: 21, description: 'Typical EU VAT — varies by country' },
  { id: 'vat-de', country: 'DE', label: 'VAT', rate: 19, description: 'Germany MwSt. / VAT — standard 19%' },
  { id: 'vat-fr', country: 'FR', label: 'TVA', rate: 20, description: 'France TVA / VAT — standard 20%' },
  { id: 'vat-uae', country: 'AE', label: 'VAT', rate: 5, description: 'UAE VAT — 5%' },
  { id: 'vat-ksa', country: 'SA', label: 'VAT', rate: 15, description: 'Saudi Arabia VAT — 15%' },
  { id: 'gst-in-5', country: 'IN', label: 'GST', rate: 5, description: 'India GST — 5% slab' },
  { id: 'gst-in-12', country: 'IN', label: 'GST', rate: 12, description: 'India GST — 12% slab' },
  { id: 'gst-in-18', country: 'IN', label: 'GST', rate: 18, description: 'India GST — 18% slab (default for services)' },
  { id: 'gst-in-28', country: 'IN', label: 'GST', rate: 28, description: 'India GST — 28% slab' },
  { id: 'gst-au', country: 'AU', label: 'GST', rate: 10, description: 'Australia GST — 10%' },
  { id: 'gst-nz', country: 'NZ', label: 'GST', rate: 15, description: 'New Zealand GST — 15%' },
  { id: 'gst-sg', country: 'SG', label: 'GST', rate: 9, description: 'Singapore GST — 9%' },
  { id: 'hst-ca-on', country: 'CA', label: 'HST', rate: 13, description: 'Canada HST — Ontario 13%' },
  { id: 'gst-ca', country: 'CA', label: 'GST', rate: 5, description: 'Canada GST — 5% (federal)' },
  { id: 'sales-us', country: 'US', label: 'Sales Tax', rate: 7, description: 'US state sales tax — rate varies' },
  { id: 'service-pk', country: 'PK', label: 'Sales Tax', rate: 15, description: 'Pakistan sales tax on services — varies by province' },
  { id: 'custom', label: 'Custom', rate: 0, description: 'Any rate — set it yourself' },
];

export const DEFAULT_TAX: InvoiceTax = {
  enabled: false,
  label: 'Tax',
  rate: 0,
  mode: 'subtotal',
  inclusive: false,
};

/**
 * Pulls the tax config off an invoice, filling in defaults and migrating
 * the old per-line-only `style.showTaxColumn` flag from pre-tax-section
 * invoices so saved data keeps working.
 */
export function resolveTax(inv: Invoice): InvoiceTax {
  if (inv.tax) return { ...DEFAULT_TAX, ...inv.tax };
  if (inv.style.showTaxColumn) {
    return { ...DEFAULT_TAX, enabled: true, mode: 'per_line' };
  }
  return DEFAULT_TAX;
}

export function findPreset(id: string): TaxPreset | undefined {
  return TAX_PRESETS.find((p) => p.id === id);
}
