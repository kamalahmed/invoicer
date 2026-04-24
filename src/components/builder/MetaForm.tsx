import { useStore } from '../../store';
import { CURRENCIES } from '../../utils/format';
import { Field, TextInput } from '../ui/Field';
import { Section } from '../ui/Section';

export function MetaForm() {
  const inv = useStore((s) => s.invoice);
  const setInvoice = useStore((s) => s.setInvoice);
  const { meta } = inv;
  const patchMeta = (p: Partial<typeof meta>) =>
    setInvoice((i) => ({ ...i, meta: { ...i.meta, ...p } }));
  return (
    <Section title="Invoice details" subtitle="meta" sectionId="meta">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Document title">
          <TextInput
            value={inv.title}
            onChange={(e) => setInvoice((i) => ({ ...i, title: e.target.value }))}
            placeholder="INVOICE"
          />
        </Field>
        <Field label="Invoice #">
          <TextInput
            value={meta.number ?? ''}
            onChange={(e) => patchMeta({ number: e.target.value })}
            placeholder="INV-0001"
          />
        </Field>
        <Field label="Reference">
          <TextInput
            value={meta.reference ?? ''}
            onChange={(e) => patchMeta({ reference: e.target.value })}
          />
        </Field>
        <Field label="Date">
          <TextInput
            type="date"
            value={meta.date}
            onChange={(e) => patchMeta({ date: e.target.value })}
          />
        </Field>
        <Field label="Due date">
          <TextInput
            type="date"
            value={meta.dueDate ?? ''}
            onChange={(e) => patchMeta({ dueDate: e.target.value })}
          />
        </Field>
        <Field label="PO #">
          <TextInput
            value={meta.poNumber ?? ''}
            onChange={(e) => patchMeta({ poNumber: e.target.value })}
          />
        </Field>
        <Field label="Period">
          <TextInput
            value={meta.period ?? ''}
            onChange={(e) => patchMeta({ period: e.target.value })}
            placeholder="e.g. Apr-26"
          />
        </Field>
        <Field label="Department">
          <TextInput
            value={meta.department ?? ''}
            onChange={(e) => patchMeta({ department: e.target.value })}
          />
        </Field>
        <Field label="Currency">
          <select
            className="field-input"
            value={inv.currency}
            onChange={(e) => {
              const c = CURRENCIES.find((x) => x.code === e.target.value);
              if (!c) return;
              setInvoice((i) => ({ ...i, currency: c.code, currencySymbol: c.symbol }));
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Billing mode" hint="Days: shows Calendar / Days Worked columns. Quantity: qty × rate.">
          <select
            className="field-input"
            value={inv.calcMode}
            onChange={(e) =>
              setInvoice((i) => ({ ...i, calcMode: e.target.value as 'days' | 'quantity' }))
            }
          >
            <option value="quantity">Quantity × Rate</option>
            <option value="days">Days Worked × Rate</option>
          </select>
        </Field>
        <Field label="Currency symbol">
          <TextInput
            value={inv.currencySymbol}
            onChange={(e) => setInvoice((i) => ({ ...i, currencySymbol: e.target.value }))}
            placeholder="$"
          />
        </Field>
      </div>
    </Section>
  );
}
