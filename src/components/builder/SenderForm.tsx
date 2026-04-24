import { useStore } from '../../store';
import { Field, TextArea, TextInput } from '../ui/Field';
import { Section } from '../ui/Section';

export function SenderForm() {
  const sender = useStore((s) => s.invoice.sender);
  const setInvoice = useStore((s) => s.setInvoice);
  const patch = (p: Partial<typeof sender>) =>
    setInvoice((inv) => ({ ...inv, sender: { ...inv.sender, ...p } }));

  return (
    <Section title="Your details" subtitle="sender" sectionId="sender">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Label" hint="e.g. From, Contractor Name, Seller">
          <TextInput
            value={sender.label ?? ''}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder="From"
          />
        </Field>
        <Field label="Name / Company">
          <TextInput
            value={sender.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="Your name or business"
          />
        </Field>
        <Field label="Contract type" hint="optional">
          <TextInput
            value={sender.contractType ?? ''}
            onChange={(e) => patch({ contractType: e.target.value })}
            placeholder="e.g. Independent Contractor"
          />
        </Field>
        <Field label="Tax ID / VAT" hint="optional">
          <TextInput
            value={sender.taxId ?? ''}
            onChange={(e) => patch({ taxId: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Address">
        <TextArea
          value={sender.address ?? ''}
          onChange={(e) => patch({ address: e.target.value })}
          placeholder="Street, city, country"
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Contact">
          <TextInput
            value={sender.contact ?? ''}
            onChange={(e) => patch({ contact: e.target.value })}
            placeholder="Phone"
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={sender.email ?? ''}
            onChange={(e) => patch({ email: e.target.value })}
          />
        </Field>
        <Field label="Website">
          <TextInput
            value={sender.website ?? ''}
            onChange={(e) => patch({ website: e.target.value })}
          />
        </Field>
      </div>
    </Section>
  );
}
