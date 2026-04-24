import { useStore } from '../../store';
import { Field, TextInput } from '../ui/Field';
import { Section } from '../ui/Section';
import { SignaturePad } from '../ui/SignaturePad';

export function SignaturesForm() {
  const inv = useStore((s) => s.invoice);
  const { addSignatory, updateSignatory, removeSignatory } = useStore();
  const setInvoice = useStore((s) => s.setInvoice);
  const toggle = (v: boolean) =>
    setInvoice((i) => ({ ...i, style: { ...i.style, showSignatures: v } }));

  return (
    <Section
      title="Signatures"
      subtitle={`${inv.signatories.length} block${inv.signatories.length === 1 ? '' : 's'}`}
      sectionId="signatures"
      action={
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={inv.style.showSignatures}
              onChange={(e) => toggle(e.target.checked)}
            />
            Show
          </label>
          <button className="btn-primary" onClick={addSignatory}>
            + Add
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {inv.signatories.length === 0 && (
          <div className="text-xs text-ink-muted">
            Add signature blocks like “ICA Signature” or “Line Manager Signature”.
          </div>
        )}
        {inv.signatories.map((sig) => (
          <div key={sig.id} className="rounded-lg border border-slate-200 p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Label">
                <TextInput
                  value={sig.label}
                  onChange={(e) => updateSignatory(sig.id, { label: e.target.value })}
                  placeholder="e.g. ICA Signature"
                />
              </Field>
              <Field label="Name">
                <TextInput
                  value={sig.name ?? ''}
                  onChange={(e) => updateSignatory(sig.id, { name: e.target.value })}
                />
              </Field>
              <Field label="Title">
                <TextInput
                  value={sig.title ?? ''}
                  onChange={(e) => updateSignatory(sig.id, { title: e.target.value })}
                />
              </Field>
            </div>
            <div className="mt-3">
              <div className="field-label">Signature</div>
              <SignaturePad
                value={sig.signatureDataUrl}
                onChange={(v) => updateSignatory(sig.id, { signatureDataUrl: v })}
              />
            </div>
            <div className="mt-2 text-right">
              <button className="btn-danger" onClick={() => removeSignatory(sig.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
