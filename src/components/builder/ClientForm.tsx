import { useStore } from '../../store';
import { Field, TextArea, TextInput } from '../ui/Field';
import { Section } from '../ui/Section';

export function ClientForm() {
  const client = useStore((s) => s.invoice.client);
  const setInvoice = useStore((s) => s.setInvoice);
  const patch = (p: Partial<typeof client>) =>
    setInvoice((inv) => ({ ...inv, client: { ...inv.client, ...p } }));
  return (
    <Section title="Bill to" subtitle="client">
      <Field label="Name / Company">
        <TextInput
          value={client.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Client company"
        />
      </Field>
      <Field label="Address">
        <TextArea
          value={client.address ?? ''}
          onChange={(e) => patch({ address: e.target.value })}
          placeholder="Street, city, country"
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Contact">
          <TextInput
            value={client.contact ?? ''}
            onChange={(e) => patch({ contact: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={client.email ?? ''}
            onChange={(e) => patch({ email: e.target.value })}
          />
        </Field>
        <Field label="Tax ID / VAT">
          <TextInput
            value={client.taxId ?? ''}
            onChange={(e) => patch({ taxId: e.target.value })}
          />
        </Field>
      </div>
    </Section>
  );
}
