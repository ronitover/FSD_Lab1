import { Check } from 'lucide-react';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
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
        className={
          appearance === 'cards'
            ? `grid gap-3 ${options.some((option) => option.icon) ? 'grid-cols-2' : 'sm:grid-cols-2'}`
            : 'flex flex-wrap gap-2'
        }
      >
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={
                appearance === 'cards'
                  ? `relative flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition duration-200 hover:-translate-y-0.5 has-focus-visible:ring-2 has-focus-visible:ring-orange ${
                      option.icon ? 'flex-col items-center text-center' : ''
                    } ${
                      checked
                        ? 'border-moss bg-moss/10 shadow-soft'
                        : 'border-forest/10 bg-surface hover:border-forest/30 hover:shadow-soft'
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
                // Cards with an icon show their own check badge instead of the native circle.
                className={appearance === 'cards' && !option.icon ? 'mt-1 accent-moss' : 'sr-only'}
              />
              {appearance === 'cards' && option.icon && (
                <AnimatePresence>
                  {checked && (
                    <m.span
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                      className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-moss text-white"
                      aria-hidden="true"
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </m.span>
                  )}
                </AnimatePresence>
              )}
              {appearance === 'cards' ? (
                <span className="min-w-0 flex-1">
                  {option.icon && (
                    <m.span
                      animate={
                        checked ? { scale: 1.08, rotate: [0, -8, 8, 0] } : { scale: 1, rotate: 0 }
                      }
                      transition={{ duration: 0.4 }}
                      className={`mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl transition-colors duration-300 sm:size-16 [&_svg]:size-6 sm:[&_svg]:size-8 ${
                        checked ? 'bg-moss text-white' : 'bg-orange/15 text-orange'
                      }`}
                      aria-hidden="true"
                    >
                      {option.icon}
                    </m.span>
                  )}
                  <span className="block text-sm font-bold text-forest">{option.label}</span>
                  {option.description && (
                    <span className="mt-1 block text-[11px] leading-4 text-forest/65 sm:text-xs sm:leading-5">
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
