import { useStore } from '../../store';
import { Field, TextArea, TextInput } from '../ui/Field';
import { Section } from '../ui/Section';

export function BankForm() {
  const inv = useStore((s) => s.invoice);
  const setInvoice = useStore((s) => s.setInvoice);
  const bank = inv.bank;
  const patch = (p: Partial<typeof bank>) =>
    setInvoice((i) => ({ ...i, bank: { ...i.bank, ...p } }));
  const toggle = (v: boolean) =>
    setInvoice((i) => ({ ...i, style: { ...i.style, showBank: v } }));

  return (
    <Section
      title="Bank details"
      subtitle={inv.style.showBank ? 'shown' : 'hidden'}
      action={
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            checked={inv.style.showBank}
            onChange={(e) => toggle(e.target.checked)}
          />
          Show on invoice
        </label>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Bank name">
          <TextInput
            value={bank.bankName ?? ''}
            onChange={(e) => patch({ bankName: e.target.value })}
          />
        </Field>
        <Field label="Account title">
          <TextInput
            value={bank.accountTitle ?? ''}
            onChange={(e) => patch({ accountTitle: e.target.value })}
          />
        </Field>
        <Field label="Account number">
          <TextInput
            value={bank.accountNumber ?? ''}
            onChange={(e) => patch({ accountNumber: e.target.value })}
          />
        </Field>
        <Field label="IBAN">
          <TextInput
            value={bank.iban ?? ''}
            onChange={(e) => patch({ iban: e.target.value })}
          />
        </Field>
        <Field label="SWIFT / BIC">
          <TextInput
            value={bank.swift ?? ''}
            onChange={(e) => patch({ swift: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Additional notes">
        <TextArea value={bank.notes ?? ''} onChange={(e) => patch({ notes: e.target.value })} />
      </Field>
    </Section>
  );
}
