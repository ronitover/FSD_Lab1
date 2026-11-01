import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { inputClasses } from './styles.ts';

interface FieldProps {
  label: string;
  /** Shown under the input in red; also marks the input invalid for screen readers. */
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
}

interface FieldIds {
  id: string;
  describedBy: string | undefined;
}

/** Label, hint and error around any control. The control gets the ids it needs through `children`. */
export function FormField({
  label,
  error,
  hint,
  optional,
  className = '',
  children,
}: FieldProps & { className?: string; children: (ids: FieldIds) => ReactNode }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-forest">
        {label}
        {optional && <span className="ml-1 font-normal text-forest/50">(optional)</span>}
      </label>
      {children({ id, describedBy })}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-forest/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
    value: string;
    onChange: (value: string) => void;
  };

export function TextField({
  label,
  error,
  hint,
  optional,
  className,
  onChange,
  ...input
}: TextFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint} optional={optional} className={className}>
      {({ id, describedBy }) => (
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={inputClasses}
          onChange={(event) => onChange(event.target.value)}
          {...input}
        />
      )}
    </FormField>
  );
}

type TextAreaFieldProps = FieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
    value: string;
    onChange: (value: string) => void;
  };

export function TextAreaField({
  label,
  error,
  hint,
  optional,
  className,
  onChange,
  rows = 3,
  ...textarea
}: TextAreaFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint} optional={optional} className={className}>
      {({ id, describedBy }) => (
        <textarea
          id={id}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClasses} resize-y`}
          onChange={(event) => onChange(event.target.value)}
          {...textarea}
        />
      )}
    </FormField>
  );
}
