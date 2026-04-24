import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Invoice, LineItem, Signatory, TemplateId } from './types';
import { newId } from './utils/id';

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

/** Pull numeric suffix off an invoice number so we can bump it. */
function nextNumber(prev: string | undefined): string {
  if (!prev) return `INV-${String(1).padStart(4, '0')}`;
  const m = prev.match(/^(.*?)(\d+)(\D*)$/);
  if (!m) return `${prev}-2`;
  const [, head, digits, tail] = m;
  const next = String(Number(digits) + 1).padStart(digits.length, '0');
  return `${head}${next}${tail}`;
}

export type SectionKey =
  | 'style'
  | 'sender'
  | 'client'
  | 'meta'
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

interface Store {
  invoice: Invoice;
  library: Invoice[]; // saved invoices
  mobileTab: 'edit' | 'preview';
  focus: FocusState;
  setInvoice: (updater: (inv: Invoice) => Invoice) => void;
  replaceInvoice: (inv: Invoice) => void;
  resetBlank: () => void;
  loadSample: () => void;
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
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      invoice: sampleInvoice(),
      library: [],
      mobileTab: 'edit',
      focus: { key: null, token: 0 },

      setInvoice: (updater) => set({ invoice: updater(get().invoice) }),
      replaceInvoice: (invoice) => set({ invoice }),
      resetBlank: () => set({ invoice: emptyInvoice() }),
      loadSample: () => set({ invoice: sampleInvoice() }),
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
          return found ? { invoice: { ...found } } : s;
        }),
      duplicateInLibrary: (id) =>
        set((s) => {
          const found = s.library.find((i) => i.id === id);
          if (!found) return s;
          const copy = { ...found, id: newId(), savedAt: Date.now() };
          return { library: [copy, ...s.library] };
        }),
      deleteFromLibrary: (id) =>
        set((s) => ({ library: s.library.filter((i) => i.id !== id) })),
    }),
    {
      name: 'invoicer:v1',
      // Only persist data — transient UI state (focus, mobile tab) resets
      // on reload so stale tokens don't trigger unwanted scrolls.
      partialize: (s) => ({ invoice: s.invoice, library: s.library }),
    }
  )
);
