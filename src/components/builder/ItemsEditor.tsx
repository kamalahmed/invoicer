import { useState } from 'react';
import { useStore } from '../../store';
import { hasOverride, lineTotal, money } from '../../utils/format';
import type {
  ColumnLabels,
  ColumnVisibility,
  LineItem,
  WideColumn,
} from '../../types';
import { Field, NumberInput, TextInput } from '../ui/Field';
import { Section } from '../ui/Section';
import { DEFAULT_COLUMN_LABELS, resolveColumnLabels } from '../../utils/labels';
import { resolveColumns } from '../../utils/columns';

export function ItemsEditor() {
  const inv = useStore((s) => s.invoice);
  const { addItem, updateItem, removeItem, moveItem, setInvoice } = useStore();
  const showDays = inv.calcMode === 'days';
  const cols = resolveColumns(inv);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);

  const labels = resolveColumnLabels(inv);

  const setLabel = (key: keyof ColumnLabels, v: string) =>
    setInvoice((i) => ({
      ...i,
      columnLabels: { ...(i.columnLabels ?? {}), [key]: v },
    }));

  const setVisibility = (key: keyof ColumnVisibility, v: boolean) =>
    setInvoice((i) => ({
      ...i,
      columnVisibility: { ...(i.columnVisibility ?? {}), [key]: v },
    }));

  const setWide = (w: WideColumn) =>
    setInvoice((i) => ({ ...i, wideColumn: w }));

  const qtyKey: 'quantity' | 'daysWorked' = showDays ? 'daysWorked' : 'quantity';

  const onQtyChange = (item: LineItem, v: number | '') => {
    const patch: Partial<LineItem> = { [qtyKey]: v } as Partial<LineItem>;
    if (hasOverride(item) && typeof v === 'number' && v !== 0) {
      patch.rate = Number((Number(item.totalOverride) / v).toFixed(4));
    }
    updateItem(item.id, patch);
  };

  const onRateChange = (item: LineItem, v: number | '') => {
    updateItem(item.id, { rate: v, totalOverride: '' });
  };

  const onTotalChange = (item: LineItem, v: number | '') => {
    const qty = Number(showDays ? item.daysWorked : item.quantity) || 0;
    if (v === '' || v == null) {
      updateItem(item.id, { totalOverride: '' });
      return;
    }
    const patch: Partial<LineItem> = { totalOverride: v };
    if (qty !== 0) {
      patch.rate = Number((Number(v) / qty).toFixed(4));
    }
    updateItem(item.id, patch);
  };

  return (
    <Section
      title="Line items"
      subtitle={`${inv.items.length} row${inv.items.length === 1 ? '' : 's'}`}
      sectionId="items"
      action={
        <button onClick={addItem} className="btn-primary">
          + Add item
        </button>
      }
    >
      {/* Columns & width — hide columns, choose which column gets the extra width. */}
      <div className="rounded-lg border border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => setColumnsOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-ink-soft"
        >
          <span>Columns &amp; width</span>
          <span className="text-ink-muted">{columnsOpen ? 'Hide' : 'Adjust'}</span>
        </button>
        {columnsOpen && (
          <div className="space-y-3 border-t border-slate-200 p-3">
            <div>
              <div className="field-label">Show columns</div>
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cols.serial}
                    onChange={(e) => setVisibility('serial', e.target.checked)}
                  />
                  Serial / ref
                </label>
                {showDays && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cols.calendarDays}
                      onChange={(e) => setVisibility('calendarDays', e.target.checked)}
                    />
                    Calendar days
                  </label>
                )}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cols.qty}
                    onChange={(e) => setVisibility('qty', e.target.checked)}
                  />
                  {showDays ? 'Days worked' : 'Qty'}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cols.rate}
                    onChange={(e) => setVisibility('rate', e.target.checked)}
                  />
                  Rate
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cols.discount}
                    onChange={(e) =>
                      setInvoice((i) => ({
                        ...i,
                        style: { ...i.style, showDiscountColumn: e.target.checked },
                      }))
                    }
                  />
                  Discount %
                </label>
                <label className="flex items-center gap-2 text-ink-muted" title="Driven by the Tax section">
                  <input type="checkbox" checked={cols.tax} disabled readOnly />
                  Tax % (from Tax)
                </label>
              </div>
              <p className="mt-1 text-[11px] text-ink-muted">
                Description and Total stay visible on every invoice.
              </p>
            </div>

            <Field
              label="Which column should take the extra width?"
              hint="Others stay compact. Default is Description — matches the classic contractor layout."
            >
              <select
                className="field-input"
                value={cols.wide}
                onChange={(e) => setWide(e.target.value as WideColumn)}
              >
                <option value="description">Description (default)</option>
                <option value="serial" disabled={!cols.serial}>
                  Serial / ref {cols.serial ? '' : '— enable the column first'}
                </option>
              </select>
            </Field>
          </div>
        )}
      </div>

      {/* Column labels — editable, with the defaults surfaced as placeholders. */}
      <div className="rounded-lg border border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => setLabelsOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-ink-soft"
        >
          <span>Column labels</span>
          <span className="text-ink-muted">{labelsOpen ? 'Hide' : 'Customize'}</span>
        </button>
        {labelsOpen && (
          <div className="grid grid-cols-2 gap-2 border-t border-slate-200 p-3 sm:grid-cols-3">
            {cols.serial && (
              <Field label="Serial / ref">
                <TextInput
                  value={inv.columnLabels?.serial ?? ''}
                  placeholder={DEFAULT_COLUMN_LABELS.serial}
                  onChange={(e) => setLabel('serial', e.target.value)}
                />
              </Field>
            )}
            <Field label="Description">
              <TextInput
                value={inv.columnLabels?.description ?? ''}
                placeholder={DEFAULT_COLUMN_LABELS.description}
                onChange={(e) => setLabel('description', e.target.value)}
              />
            </Field>
            {cols.calendarDays && (
              <Field label="Calendar days">
                <TextInput
                  value={inv.columnLabels?.calendarDays ?? ''}
                  placeholder={DEFAULT_COLUMN_LABELS.calendarDays}
                  onChange={(e) => setLabel('calendarDays', e.target.value)}
                />
              </Field>
            )}
            {cols.qty && (
              <Field label={showDays ? 'Days worked' : 'Quantity'}>
                <TextInput
                  value={(showDays ? inv.columnLabels?.daysWorked : inv.columnLabels?.quantity) ?? ''}
                  placeholder={showDays ? DEFAULT_COLUMN_LABELS.daysWorked : DEFAULT_COLUMN_LABELS.quantity}
                  onChange={(e) => setLabel(showDays ? 'daysWorked' : 'quantity', e.target.value)}
                />
              </Field>
            )}
            {cols.rate && (
              <Field label="Rate">
                <TextInput
                  value={inv.columnLabels?.rate ?? ''}
                  placeholder={showDays ? DEFAULT_COLUMN_LABELS.rateDays : DEFAULT_COLUMN_LABELS.rate}
                  onChange={(e) => setLabel('rate', e.target.value)}
                />
              </Field>
            )}
            {cols.tax && (
              <Field label="Tax column">
                <TextInput
                  value={inv.columnLabels?.tax ?? ''}
                  placeholder={DEFAULT_COLUMN_LABELS.tax}
                  onChange={(e) => setLabel('tax', e.target.value)}
                />
              </Field>
            )}
            <Field label="Total">
              <TextInput
                value={inv.columnLabels?.total ?? ''}
                placeholder={DEFAULT_COLUMN_LABELS.total}
                onChange={(e) => setLabel('total', e.target.value)}
              />
            </Field>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {inv.items.map((item, idx) => {
          const overridden = hasOverride(item);
          return (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink-muted">Row {idx + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    className="btn-ghost px-2 py-1 text-xs"
                    onClick={() => moveItem(item.id, -1)}
                    disabled={idx === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="btn-ghost px-2 py-1 text-xs"
                    onClick={() => moveItem(item.id, 1)}
                    disabled={idx === inv.items.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    className="btn-danger px-2 py-1 text-xs"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {cols.serial && (
                <Field
                  label={labels.serial}
                  hint={`Short label — SKU, date, or any short identifier. Leave blank to use row ${idx + 1}.`}
                >
                  <TextInput
                    value={item.ref ?? ''}
                    onChange={(e) => updateItem(item.id, { ref: e.target.value })}
                    placeholder={String(idx + 1)}
                  />
                </Field>
              )}

              <Field label={labels.description}>
                <TextInput
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="What did you deliver?"
                />
              </Field>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {cols.calendarDays && (
                  <Field label={labels.calendarDays}>
                    <NumberInput
                      value={item.calendarDays}
                      onChange={(v) => updateItem(item.id, { calendarDays: v })}
                    />
                  </Field>
                )}
                {cols.qty && (
                  <Field label={showDays ? labels.daysWorked : labels.quantity}>
                    <NumberInput
                      value={showDays ? item.daysWorked : item.quantity}
                      onChange={(v) => onQtyChange(item, v)}
                    />
                  </Field>
                )}
                {cols.rate && (
                  <Field label={labels.rate}>
                    <NumberInput
                      value={item.rate}
                      onChange={(v) => onRateChange(item, v)}
                      step="0.01"
                    />
                  </Field>
                )}
                {cols.tax && (
                  <Field label={labels.tax}>
                    <NumberInput
                      value={item.taxRate}
                      onChange={(v) => updateItem(item.id, { taxRate: v })}
                      step="0.01"
                      disabled={overridden}
                    />
                  </Field>
                )}
                {cols.discount && (
                  <Field label="Discount %">
                    <NumberInput
                      value={item.discount}
                      onChange={(v) => updateItem(item.id, { discount: v })}
                      step="0.01"
                      disabled={overridden}
                    />
                  </Field>
                )}
                <Field
                  label={labels.total}
                  hint={
                    overridden
                      ? 'Manual — clear to return to qty × rate'
                      : 'Or type a value to override the math'
                  }
                >
                  <NumberInput
                    value={
                      overridden
                        ? item.totalOverride
                        : Number(lineTotal(item, inv.calcMode).toFixed(2))
                    }
                    onChange={(v) => onTotalChange(item, v)}
                    step="0.01"
                    className={overridden ? 'border-amber-400 bg-amber-50' : ''}
                  />
                </Field>
              </div>
              {overridden && (
                <div className="mt-2 flex items-center justify-between rounded-md bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
                  <span>
                    Line total manually set to{' '}
                    <strong>{money(Number(item.totalOverride), inv.currencySymbol)}</strong>. Tax /
                    discount columns don't apply here.
                  </span>
                  <button
                    type="button"
                    className="font-semibold underline"
                    onClick={() => updateItem(item.id, { totalOverride: '' })}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
