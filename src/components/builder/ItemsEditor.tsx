import { useStore } from '../../store';
import { lineTotal, money } from '../../utils/format';
import { Field, NumberInput, TextInput } from '../ui/Field';
import { Section } from '../ui/Section';

export function ItemsEditor() {
  const inv = useStore((s) => s.invoice);
  const { addItem, updateItem, removeItem, moveItem } = useStore();
  const showDays = inv.calcMode === 'days';
  const showTax = inv.style.showTaxColumn;

  return (
    <Section
      title="Line items"
      subtitle={`${inv.items.length} row${inv.items.length === 1 ? '' : 's'}`}
      action={
        <button onClick={addItem} className="btn-primary">
          + Add item
        </button>
      }
    >
      <div className="space-y-3">
        {inv.items.map((item, idx) => (
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
            <Field label="Description">
              <TextInput
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                placeholder="What did you deliver?"
              />
            </Field>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {showDays && (
                <Field label="Calendar days">
                  <NumberInput
                    value={item.calendarDays}
                    onChange={(v) => updateItem(item.id, { calendarDays: v })}
                  />
                </Field>
              )}
              <Field label={showDays ? 'Days worked' : 'Quantity'}>
                <NumberInput
                  value={showDays ? item.daysWorked : item.quantity}
                  onChange={(v) =>
                    updateItem(item.id, showDays ? { daysWorked: v } : { quantity: v })
                  }
                />
              </Field>
              <Field label={showDays ? 'Rate / day' : 'Rate'}>
                <NumberInput
                  value={item.rate}
                  onChange={(v) => updateItem(item.id, { rate: v })}
                  step="0.01"
                />
              </Field>
              {showTax && (
                <>
                  <Field label="Tax %">
                    <NumberInput
                      value={item.taxRate}
                      onChange={(v) => updateItem(item.id, { taxRate: v })}
                      step="0.01"
                    />
                  </Field>
                  <Field label="Discount %">
                    <NumberInput
                      value={item.discount}
                      onChange={(v) => updateItem(item.id, { discount: v })}
                      step="0.01"
                    />
                  </Field>
                </>
              )}
              <Field label="Line total">
                <div className="field-input bg-slate-50 font-medium">
                  {money(lineTotal(item, inv.calcMode), inv.currencySymbol)}
                </div>
              </Field>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
