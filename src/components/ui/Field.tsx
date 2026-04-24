import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';

type FieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Field({ label, hint, children, className = '' }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return <input type="text" {...rest} className={`field-input ${className}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return <textarea {...rest} className={`field-textarea ${className}`} />;
}

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | '' | undefined;
  onChange: (v: number | '') => void;
}

export function NumberInput({ value, onChange, className = '', ...rest }: NumberInputProps) {
  return (
    <input
      {...rest}
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === '' ? '' : Number(raw));
      }}
      className={`field-input ${className}`}
    />
  );
}
