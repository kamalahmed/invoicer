import type { TemplateProps } from './types';
import {
  balanceDue,
  grandTotal,
  money,
} from '../utils/format';
import { hasValue, lineQty, lineTotalStr, prettyDate, renderMultiline } from './shared';

/**
 * Classic — a clean white-paper layout styled like the attached sample:
 * sender at top-left, centered "INVOICE" title, client on the left, meta on the
 * right, days-worked table, totals block, bank details, signature block.
 */
export default function Classic({ invoice }: TemplateProps) {
  const { sender, client, meta, items, totals, bank, signatories, style, calcMode } = invoice;
  const showDays = calcMode === 'days';
  const sym = invoice.currencySymbol;

  return (
    <div
      className="invoice-paper px-16 py-12 text-[13px] leading-normal"
      style={{ fontFamily: style.fontFamily === 'serif' ? '"Playfair Display", Georgia, serif' : style.fontFamily === 'mono' ? '"JetBrains Mono", Menlo, monospace' : 'Inter, system-ui, sans-serif' }}
    >
      {/* Sender block */}
      <div className="flex items-start justify-between gap-8">
        <div className="grid grid-cols-[140px_1fr] gap-y-1 gap-x-4 text-[13px]">
          <div className="font-bold">{sender.label || 'Contractor Name'}:</div>
          <div>{sender.name || ' '}</div>
          {hasValue(sender.contractType) && (
            <>
              <div className="font-bold">Type of Contract:</div>
              <div>{sender.contractType}</div>
            </>
          )}
          {hasValue(sender.address) && (
            <>
              <div className="font-bold">Address :</div>
              <div>{renderMultiline(sender.address)}</div>
            </>
          )}
          {hasValue(sender.contact) && (
            <>
              <div className="font-bold">Contact :</div>
              <div className="text-sky-600">{sender.contact}</div>
            </>
          )}
          {hasValue(sender.email) && (
            <>
              <div className="font-bold">Email :</div>
              <div className="text-sky-600 underline">{sender.email}</div>
            </>
          )}
          {hasValue(sender.website) && (
            <>
              <div className="font-bold">Website :</div>
              <div className="text-sky-600 underline">{sender.website}</div>
            </>
          )}
        </div>
        {style.logoDataUrl && (
          <img src={style.logoDataUrl} alt="Logo" className="max-h-20 max-w-[180px] object-contain" />
        )}
      </div>

      {/* Title */}
      <h1 className="my-10 text-center text-2xl font-semibold tracking-wide">
        {invoice.title || 'INVOICE'}
      </h1>

      {/* Client + meta */}
      <div className="flex items-start justify-between gap-8 border-b border-slate-300 pb-3">
        <div>
          <div className="font-bold mb-2">INVOICE TO:</div>
          <div className="font-medium">{client.name || ' '}</div>
          <div className="text-ink-soft">{renderMultiline(client.address)}</div>
          {hasValue(client.contact) && <div className="text-ink-soft">{client.contact}</div>}
          {hasValue(client.email) && <div className="text-ink-soft">{client.email}</div>}
        </div>
        <div className="text-[13px] min-w-[220px]">
          {hasValue(meta.number) && (
            <div className="flex justify-between gap-8">
              <span className="text-ink-soft">Invoice #:</span>
              <span>{meta.number}</span>
            </div>
          )}
          <div className="flex justify-between gap-8">
            <span className="text-ink-soft">Date:</span>
            <span>{prettyDate(meta.date)}</span>
          </div>
          {hasValue(meta.dueDate) && (
            <div className="flex justify-between gap-8">
              <span className="text-ink-soft">Due Date:</span>
              <span>{prettyDate(meta.dueDate)}</span>
            </div>
          )}
          {hasValue(meta.period) && (
            <div className="flex justify-between gap-8">
              <span className="text-ink-soft">Period:</span>
              <span>{meta.period}</span>
            </div>
          )}
          {hasValue(meta.department) && (
            <div className="flex justify-between gap-8">
              <span className="text-ink-soft">Department:</span>
              <span>{meta.department}</span>
            </div>
          )}
          {hasValue(meta.poNumber) && (
            <div className="flex justify-between gap-8">
              <span className="text-ink-soft">PO #:</span>
              <span>{meta.poNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="mt-6 overflow-hidden rounded-sm">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-sky-50 text-left">
              <th className="px-3 py-2 font-semibold">ACTIVITY / DESCRIPTION</th>
              {showDays && (
                <th className="px-3 py-2 text-center font-semibold">Calendar Days</th>
              )}
              <th className="px-3 py-2 text-center font-semibold">
                {showDays ? 'Days Worked' : 'Qty'}
              </th>
              <th className="px-3 py-2 text-right font-semibold">
                {showDays ? 'Rate / Day' : 'Rate'}
              </th>
              {style.showTaxColumn && (
                <th className="px-3 py-2 text-right font-semibold">Tax %</th>
              )}
              <th className="px-3 py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id} className={idx === 0 ? '' : ''}>
                <td className="px-3 py-2 align-top">{it.description}</td>
                {showDays && (
                  <td className="px-3 py-2 text-center align-top">
                    {it.calendarDays === '' || it.calendarDays == null ? '' : it.calendarDays}
                  </td>
                )}
                <td className="px-3 py-2 text-center align-top">
                  {lineQty(it, calcMode) ? (
                    <span className="inline-block min-w-10 rounded-sm bg-slate-100 px-2 py-0.5">
                      {lineQty(it, calcMode)}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-right align-top">
                  {it.rate === '' || it.rate == null
                    ? ''
                    : Number(it.rate).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                </td>
                {style.showTaxColumn && (
                  <td className="px-3 py-2 text-right align-top">
                    {it.taxRate === '' || it.taxRate == null ? '' : `${it.taxRate}%`}
                  </td>
                )}
                <td className="px-3 py-2 text-right align-top">{lineTotalStr(it, invoice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-10 flex items-start justify-end border-t border-slate-300 pt-4">
        <div className="min-w-[280px] text-[13px]">
          <div className="flex justify-between py-1">
            <span>TOTAL</span>
            <span>{money(grandTotal(invoice), sym)}</span>
          </div>
          {hasValue(totals.adjustment) && (
            <div className="flex justify-between py-1">
              <span>{totals.adjustmentLabel || 'Adjustment'}</span>
              <span>{money(Number(totals.adjustment || 0), sym)}</span>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span>Paid</span>
            <span>{hasValue(totals.paid) ? money(Number(totals.paid || 0), sym) : '-'}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-slate-300 py-2 font-bold">
            <span>Total Payable</span>
            <span>{money(balanceDue(invoice), sym)}</span>
          </div>
        </div>
      </div>

      {/* Bank + Signatures */}
      <div className="mt-12 grid grid-cols-[1fr_1fr] gap-10 text-[13px]">
        <div>
          {style.showBank && (
            <div className="space-y-1">
              {hasValue(bank.accountNumber) && (
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-semibold">Bank Details</span>
                  <span>: {bank.accountNumber}</span>
                </div>
              )}
              {hasValue(bank.bankName) && (
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-semibold">Bank Name</span>
                  <span>: {bank.bankName}</span>
                </div>
              )}
              {hasValue(bank.accountTitle) && (
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-semibold">Title</span>
                  <span>: {bank.accountTitle}</span>
                </div>
              )}
              {hasValue(bank.iban) && (
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-semibold">IBAN</span>
                  <span>: {bank.iban}</span>
                </div>
              )}
              {hasValue(bank.swift) && (
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-semibold">Swift Code</span>
                  <span>: {bank.swift}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-10">
          {style.showSignatures &&
            signatories.map((sig) => (
              <div key={sig.id} className="text-center">
                <div className="h-14" />
                <div className="border-t border-slate-400 pt-1">
                  {sig.label && <div className="font-semibold">{sig.label}:</div>}
                  {sig.name && <div className="font-semibold">{sig.name}</div>}
                  {sig.title && <div className="text-ink-soft">{sig.title}</div>}
                </div>
              </div>
            ))}
        </div>
      </div>

      {(hasValue(totals.notes) || hasValue(totals.terms)) && (
        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-slate-200 pt-6 text-[12px] text-ink-soft">
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
        </div>
      )}
    </div>
  );
}
