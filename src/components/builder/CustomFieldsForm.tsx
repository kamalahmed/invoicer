import { useStore } from '../../store';
import { Field, TextInput } from '../ui/Field';
import { Section } from '../ui/Section';

export function CustomFieldsForm() {
  const fields = useStore((s) => s.invoice.customFields ?? []);
  const addCustomField = useStore((s) => s.addCustomField);
  const updateCustomField = useStore((s) => s.updateCustomField);
  const removeCustomField = useStore((s) => s.removeCustomField);

  return (
    <Section
      title="Custom fields"
      subtitle={
        fields.length === 0
          ? 'optional — PO #, project code, matter, order ID …'
          : `${fields.length} field${fields.length === 1 ? '' : 's'}`
      }
      sectionId="custom"
      defaultOpen={fields.length > 0}
      action={
        <button className="btn-primary" onClick={() => addCustomField()}>
          + Add field
        </button>
      }
    >
      {fields.length === 0 ? (
        <p className="text-xs text-ink-muted">
          Add anything your clients need to see alongside Date / Invoice #:
          PO number, order ID, project code, matter reference, patient ID, etc.
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-lg border border-slate-200 p-3"
            >
              <Field label="Label">
                <TextInput
                  value={f.label}
                  onChange={(e) => updateCustomField(f.id, { label: e.target.value })}
                  placeholder="e.g. PO #"
                />
              </Field>
              <Field label="Value">
                <TextInput
                  value={f.value}
                  onChange={(e) => updateCustomField(f.id, { value: e.target.value })}
                  placeholder="e.g. 123456"
                />
              </Field>
              <button
                type="button"
                className="btn-danger text-xs"
                onClick={() => removeCustomField(f.id)}
                title="Remove this field"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
