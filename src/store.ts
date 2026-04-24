import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Invoice, LineItem, Signatory, TemplateId } from './types';
import { newId } from './utils/id';

const today = () => new Date().toISOString().slice(0, 10);

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
      description: 'Professional services',
      quantity: 1,
      rate: 0,
    },
  ],
  totals: { paid: '', adjustment: '', adjustmentLabel: 'Adjustment', notes: '', terms: '' },
  bank: {},
  signatories: [],
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
    showSignatures: false,
    showDiscountColumn: false,
  },
});

// The sample matches the attached contractor invoice.
export const sampleInvoice = (): Invoice => {
  const id = newId();
  return {
    ...emptyInvoice(),
    id,
    title: 'INVOICE',
    currency: 'USD',
    currencySymbol: '',
    calcMode: 'days',
    sender: {
      name: 'Kamal Ahmed',
      label: 'Contractor Name',
      contractType: 'Independent Contractor',
      address: 'Dubai',
      contact: '052 277',
      email: 'kamal@nara.ae',
    },
    client: {
      name: 'Nara Desert Escape Picnics & Camping Organizing LLC.',
      address: '208, Building 12, Bay Square,\nBusiness Bay,\nDubai.',
    },
    meta: {
      number: '',
      date: today(),
      period: 'Apr-26',
      department: 'Digital Innovation',
    },
    items: [
      {
        id: newId(),
        description: 'No. of days worked',
        calendarDays: 31,
        daysWorked: '',
        rate: 322.58,
      },
      {
        id: newId(),
        description: '',
        calendarDays: 30,
        daysWorked: 30,
        rate: 333.33,
      },
      {
        id: newId(),
        description: '',
        calendarDays: 28,
        daysWorked: '',
        rate: 3571.43,
      },
    ],
    totals: { paid: 0, adjustment: '', adjustmentLabel: 'Adjustment' },
    bank: {
      accountNumber: '0191 ••••••',
      bankName: 'Mashreq Bank',
      accountTitle: 'Kamal Ahmed',
      iban: 'AE60 03•• ••••',
      swift: 'N/A',
    },
    signatories: [
      { id: newId(), label: 'ICA Signature', name: '', title: '' },
      { id: newId(), label: 'Line Manager Signature', name: '', title: '' },
      {
        id: newId(),
        label: '',
        name: 'Dushanthi Wijesekara',
        title: 'Head of Human Resources',
      },
    ],
    style: {
      templateId: 'classic',
      accent: '#0f172a',
      fontFamily: 'sans',
      showBank: true,
      showSignatures: true,
      showDiscountColumn: false,
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
