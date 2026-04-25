import { useRef } from 'react';
import { useStore } from '../../store';
import { TEMPLATE_LIST } from '../../templates';
import { Field } from '../ui/Field';
import { Section } from '../ui/Section';

const ACCENT_SWATCHES = [
  '#0f172a',
  '#1d4ed8',
  '#0ea5e9',
  '#059669',
  '#16a34a',
  '#ca8a04',
  '#ea580c',
  '#dc2626',
  '#db2777',
  '#7c3aed',
];

export function StyleForm() {
  const inv = useStore((s) => s.invoice);
  const setInvoice = useStore((s) => s.setInvoice);
  const setTemplate = useStore((s) => s.setTemplate);
  const fileRef = useRef<HTMLInputElement>(null);

  const setStyle = (p: Partial<typeof inv.style>) =>
    setInvoice((i) => ({ ...i, style: { ...i.style, ...p } }));

  const handleLogo = async (file: File | null) => {
    if (!file) return setStyle({ logoDataUrl: undefined });
    const reader = new FileReader();
    reader.onload = () => setStyle({ logoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <Section title="Template & branding" subtitle={inv.style.templateId} sectionId="style">
      <div>
        <div className="field-label">Template</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {TEMPLATE_LIST.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              className={`group relative overflow-hidden rounded-lg border p-0 text-left transition ${
                inv.style.templateId === t.id
                  ? 'border-ink ring-2 ring-ink'
                  : 'border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600'
              }`}
              title={t.description}
            >
              <div className="h-16 w-full" style={{ background: t.preview }} />
              <div className="px-2 py-1.5">
                <div className="text-xs font-semibold">{t.name}</div>
                <div className="text-[10px] text-ink-muted line-clamp-1">{t.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Accent color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={inv.style.accent}
              onChange={(e) => setStyle({ accent: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-slate-300 bg-white"
            />
            <div className="flex flex-wrap gap-1.5">
              {ACCENT_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setStyle({ accent: c })}
                  className="h-6 w-6 rounded-full border border-white shadow-sm ring-1 ring-slate-200"
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </Field>

        <Field label="Font">
          <select
            className="field-input"
            value={inv.style.fontFamily}
            onChange={(e) =>
              setStyle({ fontFamily: e.target.value as 'sans' | 'serif' | 'mono' })
            }
          >
            <option value="sans">Sans — Inter</option>
            <option value="serif">Serif — Playfair Display</option>
            <option value="mono">Mono — JetBrains Mono</option>
          </select>
        </Field>
      </div>

      <Field label="Logo">
        <div className="flex items-center gap-3">
          {inv.style.logoDataUrl && (
            <img
              src={inv.style.logoDataUrl}
              alt="Logo preview"
              className="h-10 w-10 rounded border border-slate-200 object-contain bg-white"
            />
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleLogo(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
          {inv.style.logoDataUrl && (
            <button
              type="button"
              className="btn-danger text-xs"
              onClick={() => {
                setStyle({ logoDataUrl: undefined });
                if (fileRef.current) fileRef.current.value = '';
              }}
            >
              Remove
            </button>
          )}
        </div>
      </Field>
    </Section>
  );
}
