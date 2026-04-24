import type { CSSProperties, ReactNode } from 'react';
import type { Invoice } from '../types';
import { balanceDue, discountTotal, grandTotal, money, subtotal, taxTotal } from '../utils/format';
import { resolveColumnLabels } from '../utils/labels';
import { resolveTax } from '../utils/tax';
import { hasValue, lineQty, lineTotalStr, prettyDate, renderMultiline } from './shared';
import { EditZone } from '../components/ui/EditZone';

export interface TemplateBaseProps {
  invoice: Invoice;
  variant?: 'modern' | 'minimal' | 'corporate' | 'creative' | 'elegant' | 'dark' | 'gradient' | 'bold' | 'playful';
  /** Custom header block (replaces the default variant header). */
  header?: ReactNode;
  /** Style overrides for the invoice paper. */
  paperStyle?: CSSProperties;
}

function fontFamilyFor(invoice: Invoice): string {
  switch (invoice.style.fontFamily) {
    case 'serif':
      return '"Playfair Display", Georgia, serif';
    case 'mono':
      return '"JetBrains Mono", Menlo, monospace';
    default:
      return 'Inter, system-ui, sans-serif';
  }
}

/** Shared, flexible template body used by all non-Classic templates. */
export default function TemplateBase({
  invoice,
  variant = 'modern',
  header,
  paperStyle,
}: TemplateBaseProps) {
  const { sender, client, meta, items, totals, bank, signatories, style, calcMode } = invoice;
  const accent = style.accent || '#0f172a';
  const sym = invoice.currencySymbol;
  const showDays = calcMode === 'days';
  const labels = resolveColumnLabels(invoice);
  const tax = resolveTax(invoice);
  const showTaxCol = tax.enabled && tax.mode === 'per_line';
  const showDiscountCol = !!style.showDiscountColumn;

  // Preset cosmetics per variant
  const presets: Record<NonNullable<TemplateBaseProps['variant']>, { tableHead: CSSProperties; titleClass: string; totalBg: CSSProperties }> = {
    modern: {
      tableHead: { background: accent, color: '#fff' },
      titleClass: 'text-3xl font-extrabold tracking-tight',
      totalBg: { background: accent, color: '#fff' },
    },
    minimal: {
      tableHead: { borderBottom: `1px solid #0f172a`, color: '#0f172a' },
      titleClass: 'text-3xl font-light tracking-[0.3em] uppercase',
      totalBg: { borderTop: `2px solid #0f172a` },
    },
    corporate: {
      tableHead: { background: accent, color: '#fff' },
      titleClass: 'text-3xl font-bold uppercase tracking-wide',
      totalBg: { background: '#f1f5f9', borderLeft: `4px solid ${accent}` },
    },
    creative: {
      tableHead: { borderBottom: `2px solid ${accent}`, color: accent },
      titleClass: 'font-serif text-4xl font-semibold',
      totalBg: { background: accent, color: '#fff', borderRadius: 12 },
    },
    elegant: {
      tableHead: { borderBottom: `1px solid ${accent}`, color: accent, textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
      titleClass: 'font-serif text-5xl font-semibold italic',
      totalBg: { borderTop: `1px solid ${accent}`, borderBottom: `1px solid ${accent}` },
    },
    dark: {
      tableHead: { background: '#0f172a', color: '#e2e8f0' },
      titleClass: 'text-3xl font-bold uppercase tracking-widest',
      totalBg: { background: '#0f172a', color: '#fff' },
    },
    gradient: {
      tableHead: { background: `linear-gradient(90deg, ${accent}, #ec4899)`, color: '#fff' },
      titleClass: 'text-3xl font-extrabold tracking-tight',
      totalBg: { background: `linear-gradient(135deg, ${accent}, #ec4899)`, color: '#fff', borderRadius: 12 },
    },
    bold: {
      tableHead: { background: '#0f172a', color: '#fff' },
      titleClass: 'text-[42px] font-black uppercase tracking-tight',
      totalBg: { background: accent, color: '#fff' },
    },
    playful: {
      tableHead: { background: accent, color: '#fff', borderRadius: 12 },
      titleClass: 'text-3xl font-bold',
      totalBg: { background: '#fff7ed', borderRadius: 16, border: `2px dashed ${accent}` },
    },
  };
  const p = presets[variant];

  const defaultHeader = (() => {
    switch (variant) {
      case 'modern':
      case 'dark':
      case 'bold':
      case 'corporate':
        return (
          <div
            className="flex items-center justify-between px-16 py-10"
            style={{ background: variant === 'dark' ? '#0f172a' : accent, color: '#fff' }}
          >
            <div className="flex items-center gap-4">
              {style.logoDataUrl && (
                <img src={style.logoDataUrl} alt="Logo" className="max-h-14 max-w-[160px] object-contain bg-white/90 rounded p-1" />
              )}
              <div>
                <div className="text-xs uppercase tracking-[0.3em] opacity-80">{sender.label || 'From'}</div>
                <div className="text-xl font-bold">{sender.name || ' '}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={p.titleClass}>{invoice.title || 'INVOICE'}</div>
              {hasValue(meta.number) && (
                <div className="text-sm opacity-80">#{meta.number}</div>
              )}
            </div>
          </div>
        );
      case 'gradient':
        return (
          <div
            className="flex items-center justify-between px-16 py-10 text-white"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, #ec4899 100%)` }}
          >
            <div className="flex items-center gap-4">
              {style.logoDataUrl && (
                <img src={style.logoDataUrl} alt="Logo" className="max-h-14 max-w-[160px] object-contain bg-white/90 rounded p-1" />
              )}
              <div>
                <div className="text-xs uppercase tracking-[0.3em] opacity-80">{sender.label || 'From'}</div>
                <div className="text-xl font-bold">{sender.name || ' '}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={p.titleClass}>{invoice.title || 'INVOICE'}</div>
              {hasValue(meta.number) && <div className="text-sm opacity-80">#{meta.number}</div>}
            </div>
          </div>
        );
      case 'creative':
        return (
          <div className="flex items-start justify-between px-16 pt-12 pb-6">
            <div className="flex items-center gap-4">
              {style.logoDataUrl && (
                <img src={style.logoDataUrl} alt="Logo" className="max-h-14 max-w-[160px] object-contain" />
              )}
              <div>
                <div className="text-xs uppercase tracking-widest text-ink-muted">{sender.label || 'From'}</div>
                <div className="text-xl font-bold">{sender.name || ' '}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={p.titleClass} style={{ color: accent }}>
                {invoice.title || 'Invoice'}
              </div>
              {hasValue(meta.number) && <div className="text-sm text-ink-muted">#{meta.number}</div>}
            </div>
          </div>
        );
      case 'elegant':
        return (
          <div className="px-16 pt-14 pb-6 text-center">
            <div className={p.titleClass} style={{ color: accent }}>
              {invoice.title || 'Invoice'}
            </div>
            <div className="mx-auto mt-2 h-px w-24" style={{ background: accent }} />
            {style.logoDataUrl && (
              <img src={style.logoDataUrl} alt="Logo" className="mx-auto mt-6 max-h-16 max-w-[200px] object-contain" />
            )}
            <div className="mt-6 text-sm text-ink-muted">{sender.name || ' '}</div>
          </div>
        );
      case 'minimal':
        return (
          <div className="flex items-start justify-between px-16 pt-12 pb-2">
            <div>
              {style.logoDataUrl && (
                <img src={style.logoDataUrl} alt="Logo" className="mb-4 max-h-12 max-w-[160px] object-contain" />
              )}
              <div className="text-xs uppercase tracking-widest text-ink-muted">{sender.label || 'From'}</div>
              <div className="text-lg font-semibold">{sender.name || ' '}</div>
            </div>
            <div className={p.titleClass}>{invoice.title || 'Invoice'}</div>
          </div>
        );
      case 'playful':
        return (
          <div className="flex items-center justify-between px-16 pt-12 pb-4">
            <div className="flex items-center gap-4">
              {style.logoDataUrl ? (
                <img src={style.logoDataUrl} alt="Logo" className="max-h-14 max-w-[140px] object-contain" />
              ) : (
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold"
                  style={{ background: accent }}
                >
                  {(sender.name || 'I').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-xs uppercase tracking-widest text-ink-muted">{sender.label || 'From'}</div>
                <div className="text-lg font-bold">{sender.name || ' '}</div>
              </div>
            </div>
            <div
              className="rounded-2xl px-5 py-2 text-white font-bold"
              style={{ background: accent }}
            >
              {invoice.title || 'INVOICE'}
              {hasValue(meta.number) && <span className="ml-2 opacity-80">#{meta.number}</span>}
            </div>
          </div>
        );
    }
  })();

  const creativeSideBar = variant === 'creative' ? (
    <div className="absolute inset-y-0 left-0 w-3" style={{ background: accent }} />
  ) : null;

  return (
    <div
      className="invoice-paper relative text-[13px] leading-normal"
      style={{ fontFamily: fontFamilyFor(invoice), ...paperStyle }}
    >
      {creativeSideBar}
      <EditZone target="sender" title="Click to edit your details / logo">
        {header ?? defaultHeader}
      </EditZone>

      <div className="px-16 pb-12">
        {/* Parties & meta */}
        <div className="mt-8 grid grid-cols-2 gap-10">
          <EditZone target="client">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
              Bill To
            </div>
            <div className="mt-1 font-semibold">{client.name || ' '}</div>
            <div className="text-ink-soft">{renderMultiline(client.address)}</div>
            {hasValue(client.contact) && <div className="text-ink-soft">{client.contact}</div>}
            {hasValue(client.email) && <div className="text-ink-soft">{client.email}</div>}
            {hasValue(client.taxId) && <div className="text-ink-soft">Tax ID: {client.taxId}</div>}
          </EditZone>
          <EditZone target="meta" className="text-[13px]">
            <div className="grid grid-cols-[120px_1fr] gap-y-1">
              {hasValue(meta.number) && (
                <>
                  <div className="text-ink-muted">Invoice #</div>
                  <div className="text-right font-medium">{meta.number}</div>
                </>
              )}
              <div className="text-ink-muted">Date</div>
              <div className="text-right font-medium">{prettyDate(meta.date)}</div>
              {hasValue(meta.dueDate) && (
                <>
                  <div className="text-ink-muted">Due Date</div>
                  <div className="text-right font-medium">{prettyDate(meta.dueDate)}</div>
                </>
              )}
              {hasValue(meta.period) && (
                <>
                  <div className="text-ink-muted">Period</div>
                  <div className="text-right font-medium">{meta.period}</div>
                </>
              )}
              {hasValue(meta.department) && (
                <>
                  <div className="text-ink-muted">Department</div>
                  <div className="text-right font-medium">{meta.department}</div>
                </>
              )}
              {hasValue(meta.poNumber) && (
                <>
                  <div className="text-ink-muted">PO #</div>
                  <div className="text-right font-medium">{meta.poNumber}</div>
                </>
              )}
              {hasValue(meta.reference) && (
                <>
                  <div className="text-ink-muted">Reference</div>
                  <div className="text-right font-medium">{meta.reference}</div>
                </>
              )}
            </div>
          </EditZone>
        </div>

        {/* Items */}
        <EditZone target="items" className="mt-8 block">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={p.tableHead}>
                <th className="px-3 py-2 text-left font-semibold">{labels.description}</th>
                {showDays && (
                  <th className="px-3 py-2 text-center font-semibold">{labels.calendarDays}</th>
                )}
                <th className="px-3 py-2 text-center font-semibold">
                  {showDays ? labels.daysWorked : labels.quantity}
                </th>
                <th className="px-3 py-2 text-right font-semibold">{labels.rate}</th>
                {showTaxCol && (
                  <th className="px-3 py-2 text-right font-semibold">{tax.label} %</th>
                )}
                {showDiscountCol && (
                  <th className="px-3 py-2 text-right font-semibold">Discount %</th>
                )}
                <th className="px-3 py-2 text-right font-semibold">{labels.total}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id} className={idx % 2 === 1 && variant !== 'minimal' && variant !== 'elegant' ? 'bg-slate-50' : ''}>
                  <td className="px-3 py-2 align-top">{it.description || <span className="text-ink-muted">—</span>}</td>
                  {showDays && (
                    <td className="px-3 py-2 text-center align-top">
                      {it.calendarDays === '' || it.calendarDays == null ? '' : it.calendarDays}
                    </td>
                  )}
                  <td className="px-3 py-2 text-center align-top">{lineQty(it, calcMode)}</td>
                  <td className="px-3 py-2 text-right align-top">
                    {it.rate === '' || it.rate == null
                      ? ''
                      : Number(it.rate).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </td>
                  {showTaxCol && (
                    <td className="px-3 py-2 text-right align-top">
                      {it.taxRate === '' || it.taxRate == null ? '' : `${it.taxRate}%`}
                    </td>
                  )}
                  {showDiscountCol && (
                    <td className="px-3 py-2 text-right align-top">
                      {it.discount === '' || it.discount == null ? '' : `${it.discount}%`}
                    </td>
                  )}
                  <td className="px-3 py-2 text-right align-top font-medium">{lineTotalStr(it, invoice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </EditZone>

        {/* Totals */}
        <EditZone target="totals" className="mt-8 flex justify-end">
          <div className="min-w-[300px]">
            <div className="space-y-1 px-4 py-3 text-[13px]" style={p.totalBg}>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(subtotal(invoice) - discountTotal(invoice), sym)}</span>
              </div>
              {tax.enabled && tax.mode === 'subtotal' && tax.split?.enabled ? (
                <>
                  <div className="flex justify-between">
                    <span>
                      {tax.split.primaryLabel} ({(Number(tax.rate) / 2).toFixed(2)}%)
                    </span>
                    <span>{money(taxTotal(invoice) / 2, sym)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      {tax.split.secondaryLabel} ({(Number(tax.rate) / 2).toFixed(2)}%)
                    </span>
                    <span>{money(taxTotal(invoice) / 2, sym)}</span>
                  </div>
                </>
              ) : (
                tax.enabled &&
                taxTotal(invoice) > 0 && (
                  <div className="flex justify-between">
                    <span>
                      {tax.label}
                      {tax.mode === 'subtotal' && tax.rate ? ` (${Number(tax.rate)}%)` : ''}
                      {tax.inclusive ? ' · incl.' : ''}
                    </span>
                    <span>{money(taxTotal(invoice), sym)}</span>
                  </div>
                )
              )}
              {hasValue(totals.adjustment) && (
                <div className="flex justify-between">
                  <span>{totals.adjustmentLabel || 'Adjustment'}</span>
                  <span>{money(Number(totals.adjustment || 0), sym)}</span>
                </div>
              )}
              {hasValue(totals.paid) && (
                <div className="flex justify-between">
                  <span>Paid</span>
                  <span>-{money(Number(totals.paid || 0), sym)}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between border-t border-current/30 pt-2 text-base font-bold">
                <span>{hasValue(totals.paid) ? 'Balance Due' : 'Total'}</span>
                <span>{money(hasValue(totals.paid) || hasValue(totals.adjustment) ? balanceDue(invoice) : grandTotal(invoice), sym)}</span>
              </div>
            </div>
          </div>
        </EditZone>

        {/* Bank + signatures */}
        {(style.showBank || style.showSignatures) && (
          <div className="mt-12 grid grid-cols-2 gap-10">
            <div>
              {style.showBank && (
                <EditZone target="bank">
                  <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
                    Payment Details
                  </div>
                  <div className="mt-2 space-y-1 text-[13px]">
                    {hasValue(bank.bankName) && <div><span className="text-ink-muted">Bank: </span>{bank.bankName}</div>}
                    {hasValue(bank.accountTitle) && <div><span className="text-ink-muted">Account Title: </span>{bank.accountTitle}</div>}
                    {hasValue(bank.accountNumber) && <div><span className="text-ink-muted">Account #: </span>{bank.accountNumber}</div>}
                    {hasValue(bank.iban) && <div><span className="text-ink-muted">IBAN: </span>{bank.iban}</div>}
                    {hasValue(bank.swift) && <div><span className="text-ink-muted">SWIFT: </span>{bank.swift}</div>}
                    {hasValue(bank.notes) && <div className="text-ink-soft">{renderMultiline(bank.notes)}</div>}
                  </div>
                </EditZone>
              )}
            </div>
            <div className="space-y-8">
              {style.showSignatures &&
                signatories.map((sig) => (
                  <EditZone key={sig.id} target="signatures" className="block">
                    <div>
                      <div className="flex h-12 items-end">
                        {sig.signatureDataUrl && (
                          <img
                            src={sig.signatureDataUrl}
                            alt={sig.label || sig.name || 'Signature'}
                            className="max-h-12 max-w-[200px] object-contain"
                          />
                        )}
                      </div>
                      <div className="border-t border-slate-400 pt-1 text-[13px]">
                        {sig.label && <div className="font-semibold">{sig.label}</div>}
                        {sig.name && <div>{sig.name}</div>}
                        {sig.title && <div className="text-ink-muted">{sig.title}</div>}
                      </div>
                    </div>
                  </EditZone>
                ))}
            </div>
          </div>
        )}

        {(hasValue(totals.notes) || hasValue(totals.terms)) && (
          <EditZone
            target="totals"
            className="mt-10 grid grid-cols-2 gap-8 border-t border-slate-200 pt-6 text-[12px] text-ink-soft"
          >
            {hasValue(totals.notes) && (
              <div>
                <div className="mb-1 font-semibold text-ink">Notes</div>
                <div>{renderMultiline(totals.notes)}</div>
              </div>
            )}
            {hasValue(totals.terms) && (
              <div>
                <div className="mb-1 font-semibold text-ink">Terms</div>
                <div>{renderMultiline(totals.terms)}</div>
              </div>
            )}
          </EditZone>
        )}
      </div>
    </div>
  );
}
