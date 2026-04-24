import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Client,
  CustomField,
  Invoice,
  LineItem,
  SavedClient,
  Signatory,
  TemplateId,
} from './types';
import { newId } from './utils/id';
import { nextNumber } from './utils/numbering';
import { migratePersisted } from './utils/migrate';
import { findIndustryPreset } from './utils/industries';

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (iso: string, days: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const emptyInvoice = (): Invoice => ({
  id: newId(),
  savedAt: Date.now(),
  title: 'INVOICE',
  currency: 'USD',
  currencySymbol: '$',
  calcMode: 'quantity',
  sender: {
    name: '',
    label: 'From',
    address: '',
    contact: '',
    email: '',
  },
  client: { name: '', address: '', email: '' },
  meta: { number: '', date: today(), dueDate: '' },
  items: [
    {
      id: newId(),
      description: '',
      quantity: 1,
      rate: 0,
    },
  ],
  totals: { paid: '', adjustment: '', adjustmentLabel: 'Adjustment', notes: '', terms: '' },
  bank: {},
  // A single blank signature block is shown by default so users can see where
  // it lives on the invoice and decide to fill it in or remove it.
  signatories: [{ id: newId(), label: 'Authorized Signature', name: '', title: '' }],
  tax: {
    enabled: false,
    label: 'Tax',
    rate: 0,
    mode: 'subtotal',
    inclusive: false,
  },
  style: {
    templateId: 'classic',
    accent: '#0f172a',
    fontFamily: 'sans',
    showBank: false,
    showSignatures: true,
    showDiscountColumn: false,
  },
});

/**
 * A friendly, generic demo invoice shown on first load and when the user
 * clicks "Sample". Uses fictitious companies so the data is obviously
 * placeholder text that needs replacing, but still reads like a real
 * invoice so new users understand what goes where.
 */
export const sampleInvoice = (): Invoice => {
  const base = emptyInvoice();
  const issued = today();
  return {
    ...base,
    title: 'INVOICE',
    currency: 'USD',
    currencySymbol: '$',
    calcMode: 'quantity',
    sender: {
      label: 'From',
      name: 'Acme Studio',
      address: '123 Market Street, Suite 200\nSan Francisco, CA 94103',
      contact: '+1 (555) 123-4567',
      email: 'billing@acmestudio.example',
      website: 'acmestudio.example',
    },
    client: {
      name: 'Northwind Traders, Inc.',
      address: '500 Terry Francois Blvd\nSan Francisco, CA 94158',
      email: 'accounts@northwind.example',
    },
    meta: {
      number: 'INV-0001',
      date: issued,
      dueDate: plusDays(issued, 14),
    },
    items: [
      {
        id: newId(),
        description: 'Website design and development',
        quantity: 1,
        rate: 1500,
      },
    ],
    totals: {
      paid: '',
      adjustment: '',
      adjustmentLabel: 'Adjustment',
      notes: 'Thank you for your business.',
      terms: 'Payment due within 14 days.',
    },
    bank: {},
    signatories: [
      { id: newId(), label: 'Authorized Signature', name: '', title: '' },
    ],
    style: {
      ...base.style,
      showBank: false,
      showSignatures: true,
    },
  };
};

export type SectionKey =
  | 'style'
  | 'sender'
  | 'client'
  | 'meta'
  | 'custom'
  | 'items'
  | 'tax'
  | 'totals'
  | 'bank'
  | 'signatures'
  | 'library';

export interface FocusState {
  key: SectionKey | null;
  token: number; // bumped on every focus call so repeated clicks re-trigger
  itemId?: string; // optional — when focusing items, deep-link to a row
}

export type View = 'dashboard' | 'editor';

interface Store {
  invoice: Invoice;
  library: Invoice[]; // saved invoices
  clients: SavedClient[]; // address book
  view: View;
  mobileTab: 'edit' | 'preview';
  focus: FocusState;
  setInvoice: (updater: (inv: Invoice) => Invoice) => void;
  replaceInvoice: (inv: Invoice) => void;
  resetBlank: () => void;
  loadSample: () => void;
  setView: (v: View) => void;
  setMobileTab: (tab: 'edit' | 'preview') => void;
  focusSection: (key: SectionKey, opts?: { itemId?: string }) => void;
  // items
  addItem: () => void;
  updateItem: (id: string, patch: Partial<LineItem>) => void;
  removeItem: (id: string) => void;
  moveItem: (id: string, dir: -1 | 1) => void;
  // signatories
  addSignatory: () => void;
  updateSignatory: (id: string, patch: Partial<Signatory>) => void;
  removeSignatory: (id: string) => void;
  // style
  setTemplate: (t: TemplateId) => void;
  // library
  saveCurrent: () => void;
  loadFromLibrary: (id: string) => void;
  duplicateInLibrary: (id: string) => void;
  deleteFromLibrary: (id: string) => void;
  // clients (address book)
  addClient: (c: Client) => SavedClient;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  useClient: (id: string) => void;
  saveCurrentClient: () => SavedClient | null;
  startNewInvoiceFor: (clientId: string) => void;
  // custom fields
  addCustomField: (initial?: Partial<CustomField>) => void;
  updateCustomField: (id: string, patch: Partial<CustomField>) => void;
  removeCustomField: (id: string) => void;
  // industry starter
  startFromIndustry: (presetId: string) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      invoice: sampleInvoice(),
      library: [],
      clients: [],
      view: 'dashboard',
      mobileTab: 'edit',
      focus: { key: null, token: 0 },

      setInvoice: (updater) => set({ invoice: updater(get().invoice) }),
      replaceInvoice: (invoice) => set({ invoice }),
      resetBlank: () => set({ invoice: emptyInvoice(), view: 'editor' }),
      loadSample: () => set({ invoice: sampleInvoice() }),
      setView: (view) => set({ view }),
      setMobileTab: (mobileTab) => set({ mobileTab }),
      focusSection: (key, opts) =>
        set(() => ({
          focus: { key, token: Date.now(), itemId: opts?.itemId },
          // Flip to the Edit tab on mobile so the section is actually reachable.
          mobileTab: 'edit',
        })),

      addItem: () =>
        set((s) => ({
          invoice: {
            ...s.invoice,
            items: [
              ...s.invoice.items,
              { id: newId(), description: '', quantity: 1, rate: 0 },
            ],
          },
        })),
      updateItem: (id, patch) =>
        set((s) => ({
          invoice: {
            ...s.invoice,
            items: s.invoice.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
          },
        })),
      removeItem: (id) =>
        set((s) => ({
          invoice: { ...s.invoice, items: s.invoice.items.filter((i) => i.id !== id) },
        })),
      moveItem: (id, dir) =>
        set((s) => {
          const items = [...s.invoice.items];
          const idx = items.findIndex((i) => i.id === id);
          const next = idx + dir;
          if (idx < 0 || next < 0 || next >= items.length) return s;
          [items[idx], items[next]] = [items[next], items[idx]];
          return { invoice: { ...s.invoice, items } };
        }),

      addSignatory: () =>
        set((s) => ({
          invoice: {
            ...s.invoice,
            signatories: [
              ...s.invoice.signatories,
              { id: newId(), label: 'Signature', name: '', title: '' },
            ],
          },
        })),
      updateSignatory: (id, patch) =>
        set((s) => ({
          invoice: {
            ...s.invoice,
            signatories: s.invoice.signatories.map((sig) =>
              sig.id === id ? { ...sig, ...patch } : sig
            ),
          },
        })),
      removeSignatory: (id) =>
        set((s) => ({
          invoice: {
            ...s.invoice,
            signatories: s.invoice.signatories.filter((sig) => sig.id !== id),
          },
        })),

      setTemplate: (templateId) =>
        set((s) => ({ invoice: { ...s.invoice, style: { ...s.invoice.style, templateId } } })),

      saveCurrent: () =>
        set((s) => {
          const exists = s.library.find((i) => i.id === s.invoice.id);
          // First-time save of an invoice with no number: auto-increment from
          // the latest numbered invoice in the library.
          let number = s.invoice.meta.number;
          if (!exists && !number) {
            const latest = s.library.find((i) => i.meta.number)?.meta.number;
            number = nextNumber(latest);
          }
          const stamped: Invoice = {
            ...s.invoice,
            savedAt: Date.now(),
            meta: { ...s.invoice.meta, number },
          };
          const library = exists
            ? s.library.map((i) => (i.id === stamped.id ? stamped : i))
            : [stamped, ...s.library];
          return { invoice: stamped, library };
        }),
      loadFromLibrary: (id) =>
        set((s) => {
          const found = s.library.find((i) => i.id === id);
          // Opening a library entry should flip to the editor as well so
          // users actually see it.
          return found ? { invoice: { ...found }, view: 'editor' } : s;
        }),
      duplicateInLibrary: (id) =>
        set((s) => {
          const found = s.library.find((i) => i.id === id);
          if (!found) return s;
          const number = nextNumber(
            s.library.find((i) => i.meta.number)?.meta.number ?? found.meta.number
          );
          const copy: Invoice = {
            ...found,
            id: newId(),
            savedAt: Date.now(),
            meta: { ...found.meta, number },
            totals: { ...found.totals, paid: '' },
          };
          return { library: [copy, ...s.library] };
        }),
      deleteFromLibrary: (id) =>
        set((s) => ({ library: s.library.filter((i) => i.id !== id) })),

      // Address-book actions
      addClient: (c) => {
        const saved: SavedClient = { ...c, id: newId(), createdAt: Date.now() };
        set((s) => ({ clients: [saved, ...s.clients] }));
        return saved;
      },
      updateClient: (id, patch) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),
      useClient: (id) =>
        set((s) => {
          const c = s.clients.find((x) => x.id === id);
          if (!c) return s;
          const { id: _id, createdAt: _createdAt, ...rest } = c;
          void _id;
          void _createdAt;
          return {
            invoice: { ...s.invoice, client: { ...rest } },
          };
        }),
      saveCurrentClient: () => {
        const s = get();
        const current = s.invoice.client;
        if (!current.name || !current.name.trim()) return null;
        // If an identical client is already saved (same name + email),
        // don't duplicate — update it instead.
        const existing = s.clients.find(
          (c) =>
            c.name.trim().toLowerCase() === current.name.trim().toLowerCase() &&
            (c.email ?? '').trim().toLowerCase() ===
              (current.email ?? '').trim().toLowerCase()
        );
        if (existing) {
          set((state) => ({
            clients: state.clients.map((c) =>
              c.id === existing.id ? { ...c, ...current } : c
            ),
          }));
          return { ...existing, ...current };
        }
        const saved: SavedClient = {
          ...current,
          id: newId(),
          createdAt: Date.now(),
        };
        set((state) => ({ clients: [saved, ...state.clients] }));
        return saved;
      },
      startNewInvoiceFor: (clientId) =>
        set((s) => {
          const c = s.clients.find((x) => x.id === clientId);
          const blank = emptyInvoice();
          if (!c) return { invoice: blank, view: 'editor' };
          const { id: _id, createdAt: _createdAt, ...rest } = c;
          void _id;
          void _createdAt;
          return {
            invoice: { ...blank, client: { ...rest } },
            view: 'editor',
          };
        }),

      addCustomField: (initial) =>
        set((s) => ({
          invoice: {
            ...s.invoice,
            customFields: [
              ...(s.invoice.customFields ?? []),
              {
                id: newId(),
                label: initial?.label ?? 'Label',
                value: initial?.value ?? '',
              },
            ],
          },
        })),
      updateCustomField: (id, patch) =>
        set((s) => ({
          invoice: {
            ...s.invoice,
            customFields: (s.invoice.customFields ?? []).map((f) =>
              f.id === id ? { ...f, ...patch } : f
            ),
          },
        })),
      removeCustomField: (id) =>
        set((s) => ({
          invoice: {
            ...s.invoice,
            customFields: (s.invoice.customFields ?? []).filter((f) => f.id !== id),
          },
        })),

      startFromIndustry: (presetId) =>
        set(() => {
          const preset = findIndustryPreset(presetId);
          const blank = emptyInvoice();
          if (!preset) return { invoice: blank, view: 'editor' };
          return {
            invoice: preset.apply(blank),
            view: 'editor',
          };
        }),
    }),
    {
      name: 'invoicer:v1',
      // Bump when the Invoice shape changes in an incompatible way.
      version: 2,
      // Only persist data — transient UI state (focus, mobile tab) resets
      // on reload so stale tokens don't trigger unwanted scrolls.
      partialize: (s) => ({
        invoice: s.invoice,
        library: s.library,
        clients: s.clients,
      }),
      // Normalize older invoice shapes on load. Older browsers may have
      // state without `tax`, `columnVisibility`, etc. The migrator fills in
      // defaults and removes the deprecated `style.showTaxColumn` flag.
      migrate: (persisted) => migratePersisted(persisted) ?? (persisted as never),
    }
  )
);
