# Invoicer — Developer Documentation

## Quick start

```bash
git clone https://github.com/kamalahmed/invoicer.git
cd invoicer
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server on `localhost:5173`. |
| `npm run build` | Type-check (`tsc -b`) and produce a static build in `dist/`. |
| `npm run preview` | Serve the production build locally to verify it. |
| `npm test` | Run the Vitest suite. |
| `npm run test:watch` | Watch-mode tests during development. |
| `npm run lint` | TypeScript-only check, no emit. |

### Deploy

Drop `dist/` on any static host — Vercel, Netlify, Cloudflare Pages, GitHub Pages, or your own server. The PWA service worker requires HTTPS, which all named platforms provide automatically.

Use `NODE_ENV=development npm install` if devDependencies are skipped (the build environment may have `NODE_ENV=production` set globally).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand 4 with `persist` middleware |
| Tests | Vitest 2 |
| PDF | html2canvas + jsPDF (lazy-loaded) |

Node 22 in CI; Node 20+ should also work.

---

## Project structure

```
src/
  App.tsx                       # Routes by store.view between Dashboard / Editor
  main.tsx                      # React root + service-worker registration
  index.css                     # Tailwind layers + print/PWA + edit-zone CSS
  store.ts                      # Zustand store (one big slice)
  types.ts                      # Every shared type

  pages/
    Dashboard.tsx               # Home view
    Editor.tsx                  # Builder + preview shell

  components/
    Toolbar.tsx                 # Sticky header with view switcher + actions
    InvoicePreview.tsx          # Picks the right Template by id

    builder/
      SenderForm.tsx
      ClientForm.tsx
      MetaForm.tsx
      ItemsEditor.tsx
      TaxForm.tsx
      CustomFieldsForm.tsx
      TotalsForm.tsx
      BankForm.tsx
      SignaturesForm.tsx
      StyleForm.tsx

    dashboard/
      StatCards.tsx
      InvoiceList.tsx
      ClientsList.tsx
      IndustryStarters.tsx
      PdfDownloadButton.tsx

    ui/
      Section.tsx               # Collapsible card with sectionId focus support
      Field.tsx                 # Field / TextInput / NumberInput / TextArea
      EditZone.tsx              # Click-to-focus wrapper used inside templates
      SignaturePad.tsx          # Canvas drawing + image upload

  templates/
    index.ts                    # TEMPLATES + TEMPLATE_LIST registry
    types.ts                    # TemplateProps / TemplateMeta
    shared.tsx                  # Render helpers shared by templates
    Classic.tsx                 # Original sample-style design
    TemplateBase.tsx            # Shared body for the other 9 variants
    Modern.tsx Minimal.tsx Corporate.tsx Creative.tsx Elegant.tsx
    Dark.tsx Gradient.tsx Bold.tsx Playful.tsx

  utils/
    format.ts                   # Money + per-line + grand totals
    tax.ts                      # TAX_PRESETS + resolveTax
    columns.ts                  # resolveColumns + COLUMN_WIDTHS
    labels.ts                   # DEFAULT_COLUMN_LABELS + resolveColumnLabels
    industries.ts               # 6 industry starter presets
    invoiceStats.ts             # Status pill + library stats
    numbering.ts                # nextNumber()
    migrate.ts                  # migrateInvoice + migratePersisted
    pdf.ts                      # downloadInvoicePdf (lazy imports)
    storage.ts                  # idb-keyval-backed StateStorage adapter
    id.ts                       # newId()
    __tests__/

public/
  manifest.webmanifest          # PWA manifest
  sw.js                         # Vanilla service worker
  icon.svg / icon-maskable.svg  # Source SVG icons
  icon-192.png / icon-512.png   # Generated PWA icons

scripts/
  generate-pwa-icons.mjs        # sharp-based SVG → PNG generator

.github/workflows/ci.yml        # Build + test on every PR
```

---

## Data model

All shared types live in `src/types.ts`:

### Invoice
```ts
{
  id, savedAt, title, currency, currencySymbol,
  calcMode: 'quantity' | 'days',
  sender: Party,
  client: Client,
  meta: { number?, date, dueDate?, period?, department?, poNumber?, reference? },
  items: LineItem[],
  columnLabels?, columnVisibility?, wideColumn?,
  customFields?: CustomField[],
  tax?: InvoiceTax,
  totals: { paid?, adjustment?, adjustmentLabel?, notes?, terms? },
  bank: BankDetails,
  signatories: Signatory[],
  style: InvoiceStyle,
}
```

### LineItem
```ts
{
  id, ref?, description,
  calendarDays?, daysWorked?, quantity?, rate,
  taxRate?, discount?,
  totalOverride?,
}
```

### InvoiceTax
```ts
{
  enabled, label, rate,
  mode: 'subtotal' | 'per_line',
  inclusive,
  split?: { enabled, primaryLabel, secondaryLabel },
}
```

---

## Store conventions

Single Zustand slice in `src/store.ts`. Persisted under `invoicer:v1` with
`version: 2` and a `migrate` function in `utils/migrate.ts`. The persisted
blob lives in IndexedDB via the adapter in `utils/storage.ts`; on first
read, the adapter migrates any pre-existing `localStorage` value over.

What's persisted (`partialize`): `invoice`, `library`, `clients`. Everything
else (`view`, `mobileTab`, `focus`) is transient and resets on reload.

### Focus / click-to-edit

`SectionKey` enumerates editor sections that can be deep-linked from the
preview. `EditZone` (in templates) calls `focusSection(key)`; the matching
`Section` (in builder forms) listens to `focus.token` and scrolls itself
into view + pulses.

### Adding a new field to Invoice

1. Add to `Invoice` in `types.ts`.
2. Initialise in both `emptyInvoice()` and `sampleInvoice()` in `store.ts`.
3. Update `migrateInvoice()` in `utils/migrate.ts` to default the field.
4. Bump `version` in the persist config if the change is not backward-safe.
5. Add a test in `utils/__tests__/migrate.test.ts`.

---

## Templates

There are 10 templates. `Classic` renders its own JSX from scratch. The
other nine are thin wrappers around `TemplateBase` with a `variant` prop.

Both Classic and TemplateBase consume the same data model and share helpers:
`resolveColumns`, `resolveColumnLabels`, `resolveTax`, `lineQty`, `lineTotalStr`,
`renderMultiline`, `hasValue`, `prettyDate`, `EditZone`.

### Adding a new template

1. Write `src/templates/MyTemplate.tsx` — either thin wrapper around
   `TemplateBase` or a standalone paper.
2. Register in `src/templates/index.ts` — add to `TEMPLATES` map and the
   `TemplateId` union in `types.ts`.

---

## Math conventions

- All money helpers live in `src/utils/format.ts`.
- `lineBase()` / `lineTotal()` honour `totalOverride`.
- `taxTotal()` short-circuits to 0 when tax is disabled. Per-line mode sums
  per-row tax; subtotal mode applies rate once. Inclusive mode extracts tax
  with `subtotal × r / (100 + r)`.
- `grandTotal()` = subtotal − discount + (tax if exclusive).
- `money(amount, symbol)` formats negatives as `-AED 99.90`, not `AED -99.90`.

---

## PDF export

`PdfDownloadButton` renders the invoice off-screen via a temporary React root,
captures it with html2canvas at 2× scale, and paginates with jsPDF at Letter
size. `html2canvas` and `jsPDF` are loaded via dynamic `import()` — they are
not in the main bundle.

---

## Theming (light / dark / system)

- Tailwind's `darkMode: 'class'` is on. Dark mode is applied by adding the
  `dark` class to `<html>`.
- `src/utils/theme.ts` owns the runtime API. The same logic is mirrored as
  an inline `<script>` in `index.html` so the class lands before any CSS
  parses.
- The **invoice paper itself stays white** in both themes — it represents
  a printed document. The "Dark" template is for users who want a dark
  exported invoice.

---

## PWA

- Chrome's installability heuristic requires PNG icons at 192×192 and 512×512.
  PNGs are generated from source SVGs by `scripts/generate-pwa-icons.mjs`.
- `public/sw.js` is a hand-written service worker. Navigations are network-first
  with a cached `index.html` fallback; hashed `/assets/*` are cache-first.
- Registration happens in `src/main.tsx`, gated by `import.meta.env.PROD`.
- `vercel.json` sets explicit `Content-Type` headers for webmanifest and SW.

---

## Mobile

- The editor uses `Edit / Preview` tabs below `sm`. Above `sm` both columns
  are visible side-by-side.
- Touch drawing on the signature pad uses `pointer` events with
  `touch-action: none`.

---

## Tests and CI

- `npm test` runs Vitest. Tests live under `src/utils/__tests__/`.
- CI is `.github/workflows/ci.yml` — runs `npm ci`, `npm run build`, and
  `npm test` on every push and PR.

---

## Conventions

- **TypeScript strict** is on. Don't use `any`.
- **No new dependencies** without considering bundle weight.
- **Tailwind classes only** for styling; no inline `style` except for dynamic
  values that can't be expressed as Tailwind classes.
- Use the component classes defined in `index.css`: `field-label`, `field-input`,
  `btn-primary`, `btn-ghost`, `btn-danger`, `chip`.
- Don't store transient UI state in the persisted slice. Use `partialize`.

## Common operations

| Task | Steps |
|---|---|
| Add a builder section | New form component → register `sectionId` → add `SectionKey` entry → mount in `pages/Editor.tsx` |
| Add a template | New file in `src/templates/` → register in `templates/index.ts` → add to `TemplateId` |
| Add a tax preset | Append to `TAX_PRESETS` in `utils/tax.ts` |
| Add an industry starter | Append to `INDUSTRY_PRESETS` in `utils/industries.ts` + test |
| Add a currency | Append to `CURRENCIES` in `utils/format.ts` |
| Change persisted shape | Bump `version` + write a migration step in `utils/migrate.ts` |

## Known limitations

- No multi-user / cloud sync. Users with multiple devices use JSON import/export.
- No automatic recurring invoices. Users duplicate manually.
- No payment integrations. Users send a PDF; payment happens elsewhere.
- No tax-compliance reporting (audit logs, GST returns, etc.).
