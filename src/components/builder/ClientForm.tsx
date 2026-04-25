import { useStore } from '../../store';
import { Field, TextArea, TextInput } from '../ui/Field';
import { Section } from '../ui/Section';

export function ClientForm() {
  const client = useStore((s) => s.invoice.client);
  const clients = useStore((s) => s.clients);
  const useClient = useStore((s) => s.useClient);
  const saveCurrentClient = useStore((s) => s.saveCurrentClient);
  const setInvoice = useStore((s) => s.setInvoice);
  const patch = (p: Partial<typeof client>) =>
    setInvoice((inv) => ({ ...inv, client: { ...inv.client, ...p } }));

  const currentMatchId = clients.find(
    (c) =>
      c.name.trim().toLowerCase() === (client.name ?? '').trim().toLowerCase() &&
      (c.email ?? '').trim().toLowerCase() === (client.email ?? '').trim().toLowerCase()
  )?.id;

  return (
    <Section title="Bill to" subtitle="client" sectionId="client">
      {clients.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="field-label">Use a saved client</div>
          <div className="flex items-center gap-2">
            <select
              className="field-input"
              value={currentMatchId ?? ''}
              onChange={(e) => {
                const id = e.target.value;
                if (id) useClient(id);
              }}
            >
              <option value="">Choose from address book…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.email ? ` — ${c.email}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

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

      <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        <p className="text-xs text-ink-muted dark:text-slate-400">
          {currentMatchId
            ? 'This client is in your address book.'
            : 'Save this client to reuse on future invoices.'}
        </p>
        <button
          type="button"
          className="btn-ghost text-xs"
          disabled={!client.name?.trim()}
          onClick={() => {
            const saved = saveCurrentClient();
            if (saved)
              alert(
                currentMatchId
                  ? 'Client updated in your address book.'
                  : 'Client saved to your address book.'
              );
          }}
        >
          {currentMatchId ? 'Update saved client' : 'Save as new client'}
        </button>
      </div>
    </Section>
  );
}
