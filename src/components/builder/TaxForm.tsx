import { useStore } from '../../store';
import type { InvoiceTax } from '../../types';
import { TAX_PRESETS, findPreset, resolveTax } from '../../utils/tax';
import { Field, NumberInput, TextInput } from '../ui/Field';
import { Section } from '../ui/Section';

export function TaxForm() {
  const inv = useStore((s) => s.invoice);
  const setInvoice = useStore((s) => s.setInvoice);
  const tax = resolveTax(inv);

  const patch = (p: Partial<InvoiceTax>) =>
    setInvoice((i) => ({
      ...i,
      tax: { ...(i.tax ?? tax), ...p },
    }));

  const onPreset = (id: string) => {
    const preset = findPreset(id);
    if (!preset) return;
    if (id === 'none') {
      patch({ enabled: false, rate: 0, label: 'Tax' });
      return;
    }
    patch({
      enabled: true,
      label: preset.label,
      rate: preset.rate,
    });
  };

  // Show "India GST" specific split affordance when the label matches
  const isIndiaGst =
    tax.enabled && /gst/i.test(tax.label) && tax.mode === 'subtotal';

  return (
    <Section
      title="Tax"
      subtitle={
        !tax.enabled
          ? 'none'
          : tax.mode === 'per_line'
          ? `per-line · ${tax.label}`
          : `${tax.label} ${tax.rate}%${tax.inclusive ? ' · incl.' : ''}`
      }
      sectionId="tax"
    >
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={tax.enabled}
          onChange={(e) => patch({ enabled: e.target.checked })}
        />
        <span className="font-medium">Apply tax to this invoice</span>
      </label>

      {tax.enabled && (
        <>
          <Field
            label="Preset"
            hint="Pick a standard rate or choose Custom to enter your own."
          >
            <select
              className="field-input"
              value=""
              onChange={(e) => {
                const v = e.target.value;
                if (v) onPreset(v);
                e.currentTarget.value = '';
              }}
            >
              <option value="">Choose a preset…</option>
              {TAX_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.country ? `${p.country} — ` : ''}
                  {p.label}
                  {p.rate > 0 ? ` (${p.rate}%)` : ''} — {p.description}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Tax name" hint="Appears as the row label in the totals.">
              <TextInput
                value={tax.label}
                onChange={(e) => patch({ label: e.target.value })}
                placeholder="VAT / GST / Sales Tax"
              />
            </Field>
            <Field label="Rate (%)">
              <NumberInput
                value={tax.rate}
                onChange={(v) => patch({ rate: v })}
                step="0.01"
              />
            </Field>
          </div>

          <Field
            label="Where is it applied?"
            hint={
              tax.mode === 'subtotal'
                ? 'One tax row at the bottom, based on the subtotal.'
                : 'Each line can have its own tax rate. Good for mixed taxable / exempt items.'
            }
          >
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tax-mode"
                  checked={tax.mode === 'subtotal'}
                  onChange={() => patch({ mode: 'subtotal' })}
                />
                On subtotal
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tax-mode"
                  checked={tax.mode === 'per_line'}
                  onChange={() => patch({ mode: 'per_line' })}
                />
                Per line
              </label>
            </div>
          </Field>

          {tax.mode === 'subtotal' && (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={tax.inclusive}
                onChange={(e) => patch({ inclusive: e.target.checked })}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Prices include this tax</span>
                <span className="block text-xs text-ink-muted">
                  The subtotal is treated as tax-inclusive. Useful when the
                  rate is already baked into the line prices.
                </span>
              </span>
            </label>
          )}

          {tax.mode === 'subtotal' && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={!!tax.split?.enabled}
                  onChange={(e) =>
                    patch({
                      split: {
                        enabled: e.target.checked,
                        primaryLabel:
                          tax.split?.primaryLabel ?? (isIndiaGst ? 'CGST' : 'Tax A'),
                        secondaryLabel:
                          tax.split?.secondaryLabel ?? (isIndiaGst ? 'SGST' : 'Tax B'),
                      },
                    })
                  }
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium">Split into two components</span>
                  <span className="block text-xs text-ink-muted">
                    Useful for India GST (CGST + SGST) or similar. Each
                    component is displayed at half the rate.
                  </span>
                </span>
              </label>
              {tax.split?.enabled && (
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <Field label="Primary label">
                    <TextInput
                      value={tax.split.primaryLabel}
                      onChange={(e) =>
                        patch({
                          split: { ...tax.split!, primaryLabel: e.target.value },
                        })
                      }
                    />
                  </Field>
                  <Field label="Secondary label">
                    <TextInput
                      value={tax.split.secondaryLabel}
                      onChange={(e) =>
                        patch({
                          split: { ...tax.split!, secondaryLabel: e.target.value },
                        })
                      }
                    />
                  </Field>
                </div>
              )}
            </div>
          )}

          {tax.mode === 'per_line' && (
            <p className="rounded-md bg-sky-50 p-3 text-xs text-sky-900">
              Tax column is shown on each line in the items table. Set each
              row's Tax % individually — you can leave the rate here as a
              default suggestion for new rows you add.
            </p>
          )}
        </>
      )}
    </Section>
  );
}
