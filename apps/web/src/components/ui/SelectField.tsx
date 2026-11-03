import type { SelectHTMLAttributes } from 'react';
import { FormField } from './FormField.tsx';
import { inputClasses } from './styles.ts';

export interface Option<T extends string> {
  value: T;
  label: string;
}

type SelectFieldProps<T extends string> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange' | 'value'
> & {
  label: string;
  options: readonly Option<T>[];
  value: T | '';
  onChange: (value: T | '') => void;
  /** First, empty choice, e.g. "Any category" for filters or "Choose…" for required fields. */
  placeholder?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

export function SelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  hint,
  optional,
  className,
  ...select
}: SelectFieldProps<T>) {
  return (
    <FormField label={label} error={error} hint={hint} optional={optional} className={className}>
      {({ id, describedBy }) => (
        <select
          id={id}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClasses} pr-9`}
          onChange={(event) => onChange(event.target.value as T | '')}
          {...select}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}
