import type { ReactNode } from 'react';

interface CheckboxProps {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: ReactNode;
  className?: string;
}

export function Checkbox({ label, checked, onChange, description, className = '' }: CheckboxProps) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 accent-moss"
      />
      <span>
        <span className="block text-sm font-semibold text-forest">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-forest/60">{description}</span>}
      </span>
    </label>
  );
}
