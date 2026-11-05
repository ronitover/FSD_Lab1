import { useId, type ReactNode } from 'react';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: ReactNode;
  /** Shown on the card appearance, e.g. an icon for each role. */
  icon?: ReactNode;
}

interface RadioGroupProps<T extends string> {
  legend: string;
  name?: string;
  options: readonly RadioOption<T>[];
  value: T | '';
  onChange: (value: T) => void;
  error?: string;
  /** Cards suit choices with descriptions; pills suit short labels side by side. */
  appearance?: 'cards' | 'pills';
  className?: string;
}

/** A set of radio buttons styled as selectable cards or pills, with native keyboard behaviour. */
export function RadioGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  appearance = 'cards',
  className = '',
}: RadioGroupProps<T>) {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <fieldset
      className={className}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-1.5 text-sm font-semibold text-forest">{legend}</legend>
      <div
        className={appearance === 'cards' ? 'grid gap-3 sm:grid-cols-2' : 'flex flex-wrap gap-2'}
      >
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={
                appearance === 'cards'
                  ? `flex cursor-pointer gap-3 rounded-2xl border p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-orange ${
                      checked
                        ? 'border-moss bg-moss/10'
                        : 'border-forest/15 bg-surface hover:border-forest/40'
                    }`
                  : `cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition has-focus-visible:ring-2 has-focus-visible:ring-orange ${
                      checked
                        ? 'border-forest bg-forest text-cream'
                        : 'border-forest/20 bg-surface text-forest hover:border-forest/50'
                    }`
              }
            >
              <input
                type="radio"
                name={name ?? groupId}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className={appearance === 'cards' ? 'mt-1 accent-moss' : 'sr-only'}
              />
              {appearance === 'cards' ? (
                <span className="min-w-0 flex-1">
                  {option.icon && (
                    <span
                      className={`mb-3 flex size-11 items-center justify-center rounded-xl transition duration-300 ${
                        checked ? 'scale-110 bg-moss text-white' : 'bg-orange/15 text-orange'
                      }`}
                      aria-hidden="true"
                    >
                      {option.icon}
                    </span>
                  )}
                  <span className="block text-sm font-bold text-forest">{option.label}</span>
                  {option.description && (
                    <span className="mt-1 block text-xs leading-5 text-forest/65">
                      {option.description}
                    </span>
                  )}
                </span>
              ) : (
                option.label
              )}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
