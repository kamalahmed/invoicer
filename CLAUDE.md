# Invoicer — Project Memory for AI Sessions

This file is the canonical brief for any AI assistant working on this repo.
Keep it accurate when you change architecture or add features. Treat it as
living documentation, not a snapshot.

> **For end-users / contributors**, the human-facing entry point is
> [`README.md`](./README.md). This file is technical context for AI work.

---

## What this app is

A single-page web app that builds, customises, saves and exports invoices —
**entirely in the browser**. No backend. No API. No account. Data persists
to **IndexedDB** (with one-time migration from any pre-existing
`localStorage` blob).

**Live demo:** https://invoicer-one-zeta.vercel.app/

Core invariants:
- The product is **free and open-source**. There is no paywall and no
  artificial gating. Don't add "Pro" features without explicit user direction.
- The app must work **offline** once loaded. Avoid network calls on the hot
  path; lazy-load heavy deps (`html2canvas`, `jsPDF`) on demand.
- The user's invoice data must **never leave the device**. No analytics that
  capture invoice content, no auto-uploads, no telemetry on personal data.

---

## Tech stack and key versions

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 18** + **TypeScript** | Mature, small enough |
| Bundler / dev | **Vite 5** | Fast HMR, ESM-first |
| Styling | **Tailwind 3** | Single source of truth in JSX |
| State | **Zustand 4** with `persist` middleware | One small slice, IndexedDB (with localStorage migration) |
| Tests | **Vitest 2** | Native Vite integration |
| PDF | **html2canvas** + **jsPDF** | Lazy-loaded to keep main bundle ~70 KB gz |

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
  vite-env.d.ts                 # Vite ambient types

  pages/
    Dashboard.tsx               # Home view
    Editor.tsx                  # Builder + preview shell

  components/
    Toolbar.tsx                 # Sticky header with view switcher + actions
    InvoicePreview.tsx          # Picks the right Template by id

    builder/
      SenderForm.tsx
      ClientForm.tsx            # Uses saved-client picker + save button
      MetaForm.tsx
      ItemsEditor.tsx           # Most complex — columns, labels, override
      TaxForm.tsx
      CustomFieldsForm.tsx
      TotalsForm.tsx
      BankForm.tsx
      SignaturesForm.tsx
      StyleForm.tsx             # Template / accent / font / logo

    dashboard/
      StatCards.tsx
      InvoiceList.tsx
      ClientsList.tsx
      IndustryStarters.tsx
      PdfDownloadButton.tsx     # Lazy-loads pdf utility

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
    tax.ts                      # TAX_PRESETS, DEFAULT_TAX, resolveTax
    columns.ts                  # resolveColumns + COLUMN_WIDTHS
    labels.ts                   # DEFAULT_COLUMN_LABELS + resolveColumnLabels
    industries.ts               # 6 industry starter presets
    invoiceStats.ts             # status pill + library stats
    numbering.ts                # nextNumber()
    migrate.ts                  # migrateInvoice + migratePersisted
    pdf.ts                      # downloadInvoicePdf (lazy imports)
    storage.ts                  # idb-keyval-backed StateStorage adapter
    id.ts                       # newId()
    __tests__/                  # Vitest suite — 51 tests as of last update

public/
  manifest.webmanifest          # PWA manifest (PNG icons listed first)
  sw.js                         # Vanilla service worker
  icon.svg / icon-maskable.svg  # Source SVG icons
  icon-192.png / icon-512.png   # Generated PWA icons (npm run icons)
  icon-maskable-192.png / icon-maskable-512.png
  apple-touch-icon.png          # 180×180 for iOS Safari
  favicon.svg

scripts/
  generate-pwa-icons.mjs        # sharp-based SVG → PNG generator

.github/workflows/ci.yml        # Build + test on every PR
docs/screenshots/               # User-supplied screenshots referenced in README
vercel.json                     # Explicit MIME types for .webmanifest + sw.js
```

---

## Data model (single source of truth)

All shared types live in [`src/types.ts`](./src/types.ts). Important shapes:

### `Invoice`
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

### `LineItem`
```ts
{
  id, ref?, description,
  calendarDays?, daysWorked?, quantity?, rate,
  taxRate?, discount?,
  totalOverride?,   // when set, bypasses qty × rate math
}
```

### `InvoiceTax`
```ts
{
  enabled, label, rate,
  mode: 'subtotal' | 'per_line',
  inclusive,
  split?: { enabled, primaryLabel, secondaryLabel },
}
```

### `SavedClient` / `CustomField`
Self-explanatory; `id` + `createdAt` on `SavedClient`, `id` + `label` + `value`
on `CustomField`.

---

## Store conventions

Single Zustand slice in [`src/store.ts`](./src/store.ts). Persisted under
`invoicer:v1` with `version: 2` and a `migrate` function that runs through
[`utils/migrate.ts`](./src/utils/migrate.ts). The persisted blob lives in
**IndexedDB** via the adapter in [`utils/storage.ts`](./src/utils/storage.ts);
on first read of a key, the adapter automatically pulls any pre-existing
`localStorage` value over so users upgrading from older builds keep their
data. `main.tsx` also calls `requestPersistentStorage()` to ask the browser
not to evict the data under storage pressure.

What's persisted (`partialize`): `invoice`, `library`, `clients`. Everything
else (`view`, `mobileTab`, `focus`) is transient and resets on reload.

Store responsibilities:
- **Current invoice** — `setInvoice`, `replaceInvoice`, `resetBlank`, `loadSample`.
- **Items / signatories** — add/update/remove/move helpers per type.
- **Library** — `saveCurrent` (auto-numbers via `nextNumber` when blank),
  `loadFromLibrary` (also flips view → editor), `duplicateInLibrary` (bumps
  number and clears `paid`), `deleteFromLibrary`.
- **Clients** — `addClient`, `updateClient`, `deleteClient`, `useClient(id)`,
  `saveCurrentClient` (upserts by name + email), `startNewInvoiceFor(id)`.
- **Custom fields** — add/update/remove.
- **Industry starters** — `startFromIndustry(presetId)` applies an
  `IndustryPreset.apply(blank)` and switches to editor.
- **UI** — `view`, `setView`, `mobileTab`, `setMobileTab`, `focus`,
  `focusSection(key, opts?)`.

### Focus / click-to-edit

`SectionKey` enumerates the editor sections that can be deep-linked from the
preview. `EditZone` (in templates) calls `focusSection(key)`; the matching
`Section` (in builder forms) listens to `focus.token` and scrolls itself into
view + pulses. Always pass `sectionId` when adding a new builder section.

### Adding a new field to `Invoice`

1. Add to `Invoice` in `types.ts`.
2. Initialise in **both** `emptyInvoice()` and `sampleInvoice()` in `store.ts`.
3. Update `migrateInvoice()` in `utils/migrate.ts` to default the field for
   older persisted invoices.
4. Bump `version` in the persist config if the change is not backward-safe.
5. Add a test in `utils/__tests__/migrate.test.ts`.

---

## Templates

There are **10 templates**. `Classic` renders its own JSX from scratch (it
matches the original sample). The other nine are thin wrappers around
`TemplateBase` with a `variant` prop that swaps cosmetics (header, accent,
totals box style).

Both Classic and TemplateBase consume the same data model and share helpers:
`resolveColumns`, `resolveColumnLabels`, `resolveTax`, `lineQty`, `lineTotalStr`,
`renderMultiline`, `hasValue`, `prettyDate`, `EditZone`.

### Adding a new template

1. Write `src/templates/MyTemplate.tsx` — either thin wrapper around
   `TemplateBase` (with a new variant in `presets`) or a standalone paper.
2. Register in `src/templates/index.ts` — add to `TEMPLATES` map and the
   `TemplateId` union in `types.ts`.
3. The dashboard's `StyleForm` template picker reads from `TEMPLATE_LIST` so
   new entries appear automatically.

### Adding a new tax preset

Append to `TAX_PRESETS` in `src/utils/tax.ts` and add a presence assertion in
`utils/__tests__/tax.test.ts`.

### Adding a new industry starter

Append to `INDUSTRY_PRESETS` in `src/utils/industries.ts` (with `id`, `name`,
`tagline`, `description`, `preview` gradient, `icon`, `apply()`). Add a test in
`utils/__tests__/industries.test.ts`. The preset must be a **pure function** —
the existing immutability test will catch mutation.

---

## Math conventions

- All money helpers live in `src/utils/format.ts`. Don't recompute in
  components.
- `lineBase()` / `lineTotal()` honour `totalOverride` — overridden lines
  bypass tax/discount.
- `taxTotal()` short-circuits to 0 when tax is disabled. Per-line mode sums
  per-row tax; subtotal mode applies `tax.rate` once. Inclusive mode extracts
  tax with `subtotal × r / (100 + r)`.
- `grandTotal()` = subtotal − discount + (tax if exclusive). When
  `tax.inclusive`, grand total equals the discounted subtotal.
- `money(amount, symbol)` formats with the symbol prefix; negative numbers
  put the minus before the symbol (`-AED 99.90`, not `AED -99.90`).
- Test coverage for these is in `utils/__tests__/format.test.ts`.

---

## Click-to-edit (UX glue)

- Editor and preview columns each have their own scroll on `sm:` and up
  (`scroll-column` + `sm:overflow-y-auto sm:h-full`).
- Each preview region is wrapped in `<EditZone target="...">`. Hovering shows
  a dashed sky-blue outline; clicking calls `focusSection(target)`.
- Each builder form passes its `sectionId` to `<Section>` so the listener on
  `focus.token` triggers the scroll + pulse animation (`focus-pulse` keyframes
  in `index.css`).
- On mobile, `focusSection` also flips `mobileTab` to `'edit'` so the target
  is reachable.
- Print resets `.scroll-column` to natural height so the export isn't clipped.

---

## PDF export

`utils/pdf.ts` exports `downloadInvoicePdf(node, filename)`. Implementation:
1. Capture `node` (`.invoice-paper`) with html2canvas at 2× scale.
2. Build a `jsPDF` Letter-size doc and place the JPEG image; if it overflows
   one page, paginate by re-drawing the same image with a negative `y` offset.

`PdfDownloadButton` (in `components/dashboard/`) renders any `Invoice`
off-screen via a temporary React root, captures it, then unmounts. This means
both the editor toolbar and dashboard rows can export without depending on
what's currently rendered.

`html2canvas` and `jsPDF` are loaded via dynamic `import()` — they are not in
the main bundle. Don't move them to static imports without good reason; doing
so triples the first-paint payload.

---

## Theming (light / dark / system)

- Tailwind's `darkMode: 'class'` is on (see `tailwind.config.js`). Dark mode
  is applied by adding the `dark` class to `<html>`.
- `src/utils/theme.ts` owns the runtime API: `getStoredTheme`,
  `setTheme(theme)`, `applyTheme()`, `watchSystemTheme()`.
- **Important:** the same logic is mirrored as an inline `<script>` at the
  top of `index.html` so the class lands on `<html>` *before* any CSS
  parses. Without this the dark-mode user gets a flash of the light theme
  on every load. If you change the storage key (`invoicer:theme`) or the
  system-pref check, update both places.
- `ThemeToggle` (in `components/ThemeToggle.tsx`) cycles
  `Light → Dark → System`. Mounted in the toolbar (top row on tablet+,
  secondary mobile row on phones).
- The **invoice paper itself stays white** in both themes — it represents
  a printed document. The "Dark" *template* is for users who actually want
  a dark exported invoice. PDFs render the same regardless of UI theme.
- When adding a new card / panel / surface, give it `dark:bg-slate-900`
  and `dark:border-slate-800` (or a slightly lighter `slate-800` for
  nested panels). Text on dark goes `dark:text-slate-100`, muted text
  `dark:text-slate-400`. Inputs, buttons, chips already have dark variants
  baked into `index.css` — keep using the `field-input` / `btn-ghost` /
  `chip` classes and you get them for free.

## PWA

- `public/manifest.webmanifest` declares the app. Chrome's installability
  heuristic requires **PNG** icons at 192×192 and 512×512 — SVG-only
  manifests don't satisfy installability on Android. PNGs (regular and
  maskable) are generated from the source SVGs by
  `scripts/generate-pwa-icons.mjs` (run `npm run icons` after editing the
  SVGs). The script uses `sharp` and is a devDependency-only.
- `public/sw.js` is a hand-written service worker. App shell precaches on
  install. Navigations are network-first with a cached `index.html` fallback.
  Hashed `/assets/*` are cache-first.
- Registration happens in `src/main.tsx`, gated by `import.meta.env.PROD` so
  the dev server isn't intercepted.
- Bump `CACHE_VERSION` in `sw.js` when the offline behaviour needs to change.
- `vercel.json` sets explicit `Content-Type` headers for `/manifest.webmanifest`
  and `/sw.js` to avoid hosting MIME-type quirks that break installability.
- `src/components/InstallButton.tsx` listens for `beforeinstallprompt`
  (Chromium / Edge / Android) and offers a one-tap install. On iOS Safari
  (`isIosNeedingManualInstall()` heuristic in `utils/install.ts`) it shows
  a popover with the manual Share → Add to Home Screen steps — Apple does
  not provide an automatic prompt. Renders nothing once installed
  (`display-mode: standalone` or `navigator.standalone`).

---

## Mobile

- The editor uses `Edit / Preview` tabs below `sm`. Above `sm` both columns
  are visible side-by-side.
- The toolbar collapses primary actions on mobile: Save + PDF only, with
  "Download PDF" → "PDF" via the `shortLabel` prop on `PdfDownloadButton`.
- Dashboard / Editor and Edit / Preview pill switchers wrap in a single
  `flex-wrap` row below `sm` to avoid horizontal overflow.
- Touch drawing on the signature pad uses `pointer` events with
  `touch-action: none`.

---

## Tests and CI

- `npm test` runs Vitest. Tests live under `src/utils/__tests__/`.
- Coverage is **51 tests** as of the last quality pass: format math, tax,
  columns, numbering, migrate, industries.
- CI is `.github/workflows/ci.yml` — runs `npm ci`, `npm run build` (which
  is `tsc -b && vite build`, so typecheck is included), and `npm test` on
  every push and PR.
- When adding a new utility or store action, write at least one test alongside
  it.

---

## Conventions

- **TypeScript strict** is on. Don't use `any`; reach for `unknown` plus a
  narrowing function instead.
- **No new dependencies** without considering bundle weight. The current main
  chunk is ~70 KB gzipped — keep it that way.
- **Tailwind classes only** for styling; no inline `style` except for
  dynamic values that can't be expressed as a class (per-template colour
  presets, computed widths).
- **Section header CSS** — `field-label`, `field-input`, `btn-primary`,
  `btn-ghost`, `btn-danger`, `chip` are defined in `index.css`. Use them
  rather than re-defining.
- **No comments unless the why is non-obvious.** Don't narrate what the code
  does.
- **Don't store transient UI state in the persisted slice.** Use `partialize`
  to keep it out.

---

## Common operations

| Task | Steps |
|---|---|
| Add a new builder section | New form component → register `sectionId` → add `SectionKey` entry → mount in `pages/Editor.tsx` |
| Add a new template | New file in `src/templates/` → register in `templates/index.ts` → add to `TemplateId` |
| Add a new tax preset | Append to `TAX_PRESETS` in `utils/tax.ts` |
| Add a new industry starter | Append to `INDUSTRY_PRESETS` in `utils/industries.ts` + test |
| Add a new currency | Append to `CURRENCIES` in `utils/format.ts` |
| Change persisted shape | Bump `version` + write a migration step in `utils/migrate.ts` |

---

## Things to check before merging a PR

- [ ] `npm run build` is clean (typecheck passes).
- [ ] `npm test` is green.
- [ ] No new `console.log` left in source.
- [ ] No accidental `style.showTaxColumn` re-introduction (deprecated;
      replaced by `tax.enabled` + `tax.mode === 'per_line'`).
- [ ] If the persisted shape changed, `migrateInvoice` was updated and a
      migration test was added.
- [ ] If a new dependency was added, the gzipped main chunk is still under
      ~80 KB (lazy-load if not).
- [ ] If a UI section was added or moved, click-to-edit still works
      (`sectionId` matches the new `SectionKey`).

---

## Known limitations / non-goals

- **No multi-user / cloud sync.** This is a single-device tool by design.
  Users with multiple devices use JSON import/export.
- **No automatic recurring invoices.** Out of scope; users duplicate
  manually.
- **No payment integrations.** Users send a PDF; payment happens elsewhere.
- **No team / role-based access.**
- **No tax-compliance reporting** (audit logs, GST returns, etc.).

These are deliberate scope limits, not bugs. Don't try to add them without an
explicit user request and a clear plan for the data-model fallout.

---

## When updating this file

If your change adds a new top-level concept (a page, a major utility, a new
data-model field), update the relevant section here. The point is for the
next AI session — including future `/init` runs — to start with accurate
context instead of re-discovering the codebase from scratch.
