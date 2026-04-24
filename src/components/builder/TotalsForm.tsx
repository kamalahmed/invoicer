import { useStore } from '../../store';
import { balanceDue, grandTotal, money, subtotal, taxTotal } from '../../utils/format';
import { Field, NumberInput, TextArea, TextInput } from '../ui/Field';
import { Section } from '../ui/Section';

export function TotalsForm() {
  const inv = useStore((s) => s.invoice);
  const setInvoice = useStore((s) => s.setInvoice);
  const t = inv.totals;
  const patch = (p: Partial<typeof t>) =>
    setInvoice((i) => ({ ...i, totals: { ...i.totals, ...p } }));
  const sym = inv.currencySymbol;
  return (
    <Section title="Totals, notes & terms" subtitle="summary" sectionId="totals">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Adjustment label">
          <TextInput
            value={t.adjustmentLabel ?? ''}
            onChange={(e) => patch({ adjustmentLabel: e.target.value })}
            placeholder="Discount / Shipping / Fee"
          />
        </Field>
        <Field label="Adjustment amount" hint="Negative for discount, positive for fee">
          <NumberInput
            value={t.adjustment}
            onChange={(v) => patch({ adjustment: v })}
            step="0.01"
          />
        </Field>
        <Field label="Amount paid">
          <NumberInput value={t.paid} onChange={(v) => patch({ paid: v })} step="0.01" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-4">
        <div>
          <div className="text-xs text-ink-muted">Subtotal</div>
          <div className="font-semibold">{money(subtotal(inv), sym)}</div>
        </div>
        <div>
          <div className="text-xs text-ink-muted">Tax</div>
          <div className="font-semibold">{money(taxTotal(inv), sym)}</div>
        </div>
        <div>
          <div className="text-xs text-ink-muted">Total</div>
          <div className="font-semibold">{money(grandTotal(inv), sym)}</div>
        </div>
        <div>
          <div className="text-xs text-ink-muted">Balance due</div>
          <div className="font-semibold">{money(balanceDue(inv), sym)}</div>
        </div>
      </div>

      <Field label="Notes">
        <TextArea
          value={t.notes ?? ''}
          onChange={(e) => patch({ notes: e.target.value })}
          placeholder="Thank you for your business!"
        />
      </Field>
      <Field label="Terms">
        <TextArea
          value={t.terms ?? ''}
          onChange={(e) => patch({ terms: e.target.value })}
          placeholder="Payment due within 14 days."
        />
      </Field>
    </Section>
  );
}
