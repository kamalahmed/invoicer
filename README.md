# Invoicer — Free, In-Browser Invoice Maker

Build, customise, save and export professional invoices entirely in your browser.
**No signup. No cloud. No subscription.** Everything stays on your device.

**Live demo:** [invoicer-one-zeta.vercel.app](https://invoicer-one-zeta.vercel.app/)

---

## Why this exists

Most "free" invoice tools ask you to register, store your data on their servers,
and lock half the templates behind a paywall. This one doesn't:

- Open the page, build an invoice, download a PDF — that's it.
- Your data lives in your browser's local storage. Nothing is sent anywhere.
- Source is MIT-licensed. Use it, fork it, host it yourself.

Built for solo freelancers, contractors, side-hustlers, small consultancies,
and anyone who needs a clean, customisable invoice without an account.

---

## Screenshots

> Drop screenshots into `docs/screenshots/` to populate this section.
> Quick way: open the [live demo](https://invoicer-one-zeta.vercel.app/), capture each
> view, and save with the filenames below.

| | |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Editor](docs/screenshots/editor.png) |
| **Dashboard** — stats, saved invoices, address book, industry starters. | **Editor** — live preview alongside a focused builder. |
| ![Templates](docs/screenshots/templates.png) | ![Mobile](docs/screenshots/mobile.png) |
| **Ten templates** — Classic, Modern, Minimal, Corporate, Creative, Elegant, Dark, Gradient, Bold, Playful. | **Mobile** — switch between Edit and Preview tabs. |

---

## Features

### Editor & preview
- **Click-to-edit** — click any zone in the live preview (sender, client, items, totals, signature) and the matching builder section scrolls into view and pulses.
- **Independent-scroll columns** on desktop — the preview stays put while you scroll the form.
- **Mobile-friendly** with Edit/Preview tabs, touch-friendly hit targets, and an installable PWA.

### Templates
- **Ten visual templates** — Classic (matches the contractor sample), Modern, Minimal, Corporate, Creative, Elegant, Dark, Gradient, Bold, Playful.
- **Per-invoice accent colour** with 10 preset swatches and a colour picker.
- **Font choice** — Inter (sans), Playfair Display (serif), or JetBrains Mono.
- **Logo upload** — drop a PNG/JPG/SVG; stored as a data URL in your browser.

### Industries (one-click setup)
Six starter presets that pre-fill calc mode, columns, tax, sample lines, custom fields, notes/terms:
- Freelancer · Agency / Studio · Retail / Products · Contractor (day rate) · Legal / Consulting · Medical / Healthcare.

### Line items
- **Quantity × Rate** or **Days Worked × Rate** modes.
- **Per-line override** — type a Total directly; Rate auto-derives from `total / qty` while keeping the override fixed.
- **Editable column labels** with sensible defaults (placeholders).
- **Hide / show columns** — Serial / Calendar Days / Qty / Rate / Tax / Discount.
- **Optional Serial / Ref column** for SKUs, dates, or order numbers.
- **Choose the wide column** — Description (default) or Serial / Ref.
- **Move / duplicate / remove** rows.

### Tax (genuinely flexible)
- Built-in presets for common standards: VAT (UK 20%, EU 21%, Germany 19%, France 20%, UAE 5%, KSA 15%), GST (India 5/12/18/28%, Australia 10%, NZ 15%, Singapore 9%, Canada 5%), Ontario HST 13%, US Sales Tax 7%, Pakistan 15%, plus Custom.
- **On-subtotal** or **per-line** application.
- **Inclusive vs exclusive** pricing toggle (extracts tax from a tax-inclusive subtotal).
- **Split into two** for India GST (CGST + SGST) — renders as two rows at half the combined rate, with editable component labels.

### Custom fields
- Add any number of `Label → Value` rows that appear next to Date / Invoice # on every template.
- Useful for PO #, Project code, Matter reference, Patient ID, Order #, Event date, etc.

### Multi-currency
- 10 currencies built-in (USD, EUR, GBP, AED, SAR, INR, PKR, JPY, CAD, AUD).
- Editable currency symbol — type any prefix you want.

### Signatures
- **Draw a signature** on a canvas (mouse or finger) — auto-trimmed to fit above the signature line.
- Or **upload an image** signature.
- Multiple signature blocks per invoice (for ICA, line manager, HR, etc.).

### Saved data
- **Library** of saved invoices on the dashboard — Open, Duplicate, Download PDF, Delete.
- **Address book** — reusable client records. Pick a saved client when filling Bill-to; save the current client with one click.
- **Auto-numbered** invoices on save (`INV-0001` → `INV-0002`…), preserving any padding or prefixes you've used.
- **JSON import / export** for portable backups across devices.
- **Versioned schema migration** — old browser caches keep working when the data shape evolves.

### Output
- **Real PDF download** via `html2canvas` + `jsPDF` — paginates Letter-size, multi-page handled.
- **Browser print** with proper @media-print CSS.
- All processing happens locally; nothing is uploaded.

### Privacy & offline
- **Everything is stored in your browser's local storage.** Nothing leaves your device.
- **PWA** — install the app to your home screen on iOS, Android, macOS, Windows, or Linux. Works offline once installed.

---

## Quick start (developers)

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
| `npm test` | Run the Vitest suite (currently 51 tests). |
| `npm run test:watch` | Watch-mode tests during development. |
| `npm run lint` | TypeScript-only check, no emit. |

### Deploy

Drop `dist/` on any static host — Vercel, Netlify, Cloudflare Pages, GitHub
Pages, or your own server (the live demo runs on Vercel). The PWA service
worker requires HTTPS, which all the named platforms provide automatically.

---

## How to use (end-user guide)

1. **Open the dashboard.** Click an industry starter or **+ New invoice** for a blank one.
2. **Fill the editor.** Click any zone in the right-hand preview and the matching section in the left builder scrolls to the top. Tabs at the top switch between editor and preview on mobile.
3. **Pick a template** in *Template & branding*, set your accent colour, upload a logo if you have one.
4. **Hit Save** to keep the invoice in your library, or click **Download PDF** to get a file you can email.
5. **Save a client** from the Bill-to section and reuse them on future invoices via the dashboard.

Tip: install the app from your browser's address bar (Chrome / Edge / Safari) — it'll behave like a desktop app.

---

## Tech stack

- **React 18** + **TypeScript** for the app
- **Vite 5** for build and dev server
- **Tailwind CSS** for styling
- **Zustand** with `persist` middleware for state + localStorage
- **html2canvas** + **jsPDF** for PDF rendering (lazy-loaded to keep the main bundle small)
- **Vitest** for unit tests
- Vanilla service worker + web app manifest for PWA support

The app is a pure SPA — no backend, no API. The whole thing runs in your browser.

---

## Project structure

```
src/
  pages/                    # Top-level views (Dashboard, Editor)
  components/
    builder/                # Editor sections — sender, client, meta, items, tax, totals, bank, signatures, custom-fields
    dashboard/              # Dashboard widgets — stats, invoice list, clients, industry starters, PDF button
    ui/                     # Reusable primitives — Field, Section, EditZone, SignaturePad
    InvoicePreview.tsx
    Toolbar.tsx
  templates/                # Ten invoice designs + shared TemplateBase
  utils/                    # Pure helpers — format, tax, columns, labels, industries, migrate, numbering, pdf
  store.ts                  # Zustand store (one slice for everything)
  types.ts                  # All shared types
public/                     # Static assets — manifest, service worker, icons
```

Detailed architecture, conventions, and AI-session context live in
[`CLAUDE.md`](./CLAUDE.md).

---

## Contributing

Bug reports, feature requests and pull requests are welcome.

If you're adding a new template, drop a thin component in `src/templates/` that
either uses `TemplateBase` with a new variant or renders its own paper, and add
it to the registry in `src/templates/index.ts`.

If you're adding a new tax preset, append it to `TAX_PRESETS` in
`src/utils/tax.ts`. If you're adding a new industry starter, add an entry in
`src/utils/industries.ts` and a test in `__tests__/industries.test.ts`.

Run `npm test && npm run build` before opening a PR — CI runs both.

---

## License

[MIT](./LICENSE) — use it, fork it, sell services around it. Attribution is
appreciated but not required.

---

## Support

If this saved you time, a coffee is appreciated:

- [☕ Ko-fi](https://ko-fi.com/) *(set up the link once your account is live)*
- [💖 GitHub Sponsors](https://github.com/sponsors/kamalahmed) *(once enabled)*
- ⭐ Star the repo on GitHub — it really helps with discovery.
