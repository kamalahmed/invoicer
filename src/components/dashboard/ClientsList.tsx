import { useState } from 'react';
import { useStore } from '../../store';
import type { Client, SavedClient } from '../../types';
import { clientUsage } from '../../utils/invoiceStats';
import { Field, TextArea, TextInput } from '../ui/Field';

function blankDraft(): Client {
  return { name: '', address: '', email: '', contact: '', taxId: '' };
}

export function ClientsList() {
  const library = useStore((s) => s.library);
  const clients = useStore((s) => s.clients);
  const addClient = useStore((s) => s.addClient);
  const updateClient = useStore((s) => s.updateClient);
  const deleteClient = useStore((s) => s.deleteClient);
  const startNewInvoiceFor = useStore((s) => s.startNewInvoiceFor);
  const useClient = useStore((s) => s.useClient);
  const setView = useStore((s) => s.setView);

  const usage = clientUsage(library, clients);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Client>(blankDraft());
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const startEdit = (c: SavedClient) => {
    setEditing(c.id);
    setCreating(false);
    setDraft({ ...c });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setDraft(blankDraft());
  };

  const cancel = () => {
    setEditing(null);
    setCreating(false);
    setDraft(blankDraft());
  };

  const save = () => {
    if (!draft.name.trim()) {
      alert('Client name is required.');
      return;
    }
    if (editing) updateClient(editing, draft);
    else addClient(draft);
    cancel();
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-ink dark:text-slate-100">Clients</h2>
          <p className="text-xs text-ink-muted dark:text-slate-400">
            Reusable address book — pick one when creating an invoice.
          </p>
        </div>
        {!creating && !editing && (
          <button className="btn-primary" onClick={startCreate}>
            + Add client
          </button>
        )}
      </header>

      {(creating || editing) && (
        <div className="space-y-3 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Name / Company">
              <TextInput
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Northwind Traders, Inc."
              />
            </Field>
            <Field label="Email">
              <TextInput
                type="email"
                value={draft.email ?? ''}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </Field>
            <Field label="Contact">
              <TextInput
                value={draft.contact ?? ''}
                onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
              />
            </Field>
            <Field label="Tax ID / VAT">
              <TextInput
                value={draft.taxId ?? ''}
                onChange={(e) => setDraft({ ...draft, taxId: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Address">
            <TextArea
              value={draft.address ?? ''}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              placeholder="Street, city, country"
            />
          </Field>
          <div className="flex items-center justify-end gap-2">
            <button className="btn-ghost" onClick={cancel}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save}>
              {editing ? 'Save changes' : 'Add client'}
            </button>
          </div>
        </div>
      )}

      {clients.length === 0 && !creating ? (
        <div className="p-8 text-center text-sm text-ink-muted dark:text-slate-400">
          No clients yet. Add one here, or save one from the Bill-to section in
          the editor.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {clients.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-start justify-between gap-2 px-5 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{c.name}</div>
                <div className="text-xs text-ink-muted dark:text-slate-400">
                  {[c.email, c.contact, c.taxId && `Tax ID: ${c.taxId}`]
                    .filter(Boolean)
                    .join(' · ') || 'No contact details'}
                  <span className="ml-2">
                    · {usage.get(c.id) ?? 0} invoice
                    {(usage.get(c.id) ?? 0) === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="btn-ghost text-xs"
                  onClick={() => {
                    startNewInvoiceFor(c.id);
                  }}
                  title="Start a new invoice pre-filled for this client"
                >
                  New invoice
                </button>
                <button
                  className="btn-ghost text-xs"
                  onClick={() => {
                    useClient(c.id);
                    setView('editor');
                  }}
                  title="Use this client on the invoice currently open"
                >
                  Apply to current
                </button>
                <button className="btn-ghost text-xs" onClick={() => startEdit(c)}>
                  Edit
                </button>
                {confirmId === c.id ? (
                  <>
                    <button
                      className="btn-danger text-xs"
                      onClick={() => {
                        deleteClient(c.id);
                        setConfirmId(null);
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn-ghost text-xs"
                      onClick={() => setConfirmId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-danger text-xs"
                    onClick={() => setConfirmId(c.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
