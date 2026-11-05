import { Check, Minus, Plus, Snowflake } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import type { DietaryType, FoodCategory } from '@replate/shared';
import { CategoryTile, FoodTypeMark } from '../../components/ui/FoodVisuals.tsx';
import { inputClasses } from '../../components/ui/styles.ts';
import {
  formatDateTime,
  formatRelative,
  fromLocalInput,
  localInputFromNow,
} from '../../lib/dates.ts';
import { CATEGORY_LABELS, DIETARY_LABELS } from '../../lib/labels.ts';

/** Shared look for a group of choices: a legend, the choices, and an error under them. */
function ChoiceGroup({
  legend,
  hint,
  error,
  children,
}: {
  legend: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <fieldset aria-invalid={error ? true : undefined} aria-describedby={error ? id : undefined}>
      <legend className="mb-2 text-sm font-semibold text-forest">{legend}</legend>
      {hint && <p className="-mt-1 mb-2 text-xs text-forest/60">{hint}</p>}
      {children}
      {error && (
        <p id={id} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}

const chipClasses = (on: boolean) =>
  `inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition duration-200 select-none active:scale-[0.97] has-focus-visible:ring-2 has-focus-visible:ring-orange ${
    on
      ? 'border-forest bg-forest text-cream'
      : 'border-forest/20 bg-surface text-forest hover:border-forest/50'
  }`;

/** Categories as tappable tiles. Each tile is a radio button underneath. */
export function CategoryPicker({
  value,
  onChange,
  error,
}: {
  value: FoodCategory | '';
  onChange: (value: FoodCategory) => void;
  error?: string;
}) {
  const name = useId();
  return (
    <ChoiceGroup legend="Category" error={error}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {(Object.keys(CATEGORY_LABELS) as FoodCategory[]).map((category) => {
          const checked = value === category;
          return (
            <label
              key={category}
              className={`relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-3 text-center transition duration-200 active:scale-[0.97] has-focus-visible:ring-2 has-focus-visible:ring-orange ${
                checked
                  ? 'border-moss bg-moss/10 shadow-soft'
                  : 'border-forest/15 bg-surface hover:border-forest/40'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={category}
                checked={checked}
                onChange={() => onChange(category)}
                className="sr-only"
              />
              <CategoryTile category={category} size="sm" />
              <span className="text-xs leading-tight font-semibold text-forest">
                {CATEGORY_LABELS[category]}
              </span>
              {checked && (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-moss text-white">
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </ChoiceGroup>
  );
}

/** Veg, non-veg or vegan, with the marks people know from food packaging. Radio buttons underneath. */
export function FoodTypePicker({
  value,
  onChange,
  error,
}: {
  value: DietaryType | '';
  onChange: (value: DietaryType) => void;
  error?: string;
}) {
  const name = useId();
  return (
    <ChoiceGroup legend="Food type" error={error}>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(DIETARY_LABELS) as DietaryType[]).map((type) => (
          <label key={type} className={chipClasses(value === type)}>
            <input
              type="radio"
              name={name}
              value={type}
              checked={value === type}
              onChange={() => onChange(type)}
              className="sr-only"
            />
            <FoodTypeMark type={type} className="size-4" />
            {DIETARY_LABELS[type]}
          </label>
        ))}
      </div>
    </ChoiceGroup>
  );
}

/** A number box with − and + buttons, so phone users rarely need the keyboard. */
export function QuantityStepper({
  value,
  onChange,
  error,
  unitSelect,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** The unit dropdown, shown beside the number. */
  unitSelect: ReactNode;
}) {
  const id = useId();
  const current = Number(value) || 0;
  const step = (by: number) => onChange(String(Math.max(1, current + by)));
  const buttonClasses =
    'flex size-11 shrink-0 items-center justify-center rounded-xl border border-forest/20 bg-surface text-forest transition hover:border-forest/50 active:scale-95 disabled:opacity-40';

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-forest">
        How much?
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={buttonClasses}
          onClick={() => step(current >= 20 ? -5 : -1)}
          disabled={current <= 1}
          aria-label="Less"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <div className="w-20 shrink-0">
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="0"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={error ? true : undefined}
            className={`${inputClasses} text-center text-lg font-bold`}
          />
        </div>
        <button
          type="button"
          className={buttonClasses}
          onClick={() => step(current >= 20 ? 5 : 1)}
          aria-label="More"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
        <div className="min-w-28 flex-1 sm:max-w-40">{unitSelect}</div>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

const EXPIRY_PRESETS = [2, 4, 8, 24];

/** Collect-by time as quick choices, with an exact date and time for anything else. */
export function CollectByPicker({
  value,
  onChange,
  min,
  max,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  min: string;
  max: string;
  error?: string;
}) {
  const [preset, setPreset] = useState<number | null>(null);
  // Editing an existing donation starts on the exact time it already has.
  const [custom, setCustom] = useState(value !== '');
  const iso = fromLocalInput(value);

  return (
    <ChoiceGroup
      legend="Collect by"
      hint="After this, the food is no longer safe to collect."
      error={error}
    >
      <div className="flex flex-wrap gap-2">
        {EXPIRY_PRESETS.map((hours) => (
          <button
            key={hours}
            type="button"
            aria-pressed={!custom && preset === hours}
            className={chipClasses(!custom && preset === hours)}
            onClick={() => {
              setPreset(hours);
              setCustom(false);
              onChange(localInputFromNow(hours));
            }}
          >
            In {hours < 24 ? `${hours} hours` : '1 day'}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={custom}
          className={chipClasses(custom)}
          onClick={() => setCustom(true)}
        >
          Pick a time
        </button>
      </div>
      {custom && (
        <input
          type="datetime-local"
          aria-label="Collect by date and time"
          className={`${inputClasses} mt-3 max-w-xs motion-safe:animate-fade-up`}
          aria-invalid={error ? true : undefined}
          value={value}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {iso && !error && (
        <p className="mt-2 text-sm text-forest/70">
          NGOs must collect by <strong className="text-forest">{formatDateTime(iso)}</strong> (
          {formatRelative(iso)}).
        </p>
      )}
    </ChoiceGroup>
  );
}

/** Allergens as tap-to-toggle chips (checkboxes underneath), plus any the donor adds. */
export function AllergenChips({
  common,
  selected,
  onToggle,
  error,
}: {
  common: string[];
  selected: string[];
  onToggle: (allergen: string, on: boolean) => void;
  error?: string;
}) {
  const [other, setOther] = useState('');
  const extra = selected.filter((item) => !common.includes(item));

  function addOther() {
    const allergen = other.trim();
    if (allergen && !selected.some((item) => item.toLowerCase() === allergen.toLowerCase())) {
      onToggle(allergen, true);
    }
    setOther('');
  }

  return (
    <ChoiceGroup legend="Contains any allergens?" hint="Tap all that apply." error={error}>
      <div className="flex flex-wrap gap-2">
        {[...common, ...extra].map((allergen) => {
          const on = selected.includes(allergen);
          return (
            <label key={allergen} className={chipClasses(on)}>
              <input
                type="checkbox"
                checked={on}
                onChange={(event) => onToggle(allergen, event.target.checked)}
                className="sr-only"
              />
              {on && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
              {allergen}
            </label>
          );
        })}
      </div>
      <div className="mt-3 flex max-w-xs gap-2">
        <input
          aria-label="Other allergen"
          placeholder="Something else?"
          className={inputClasses}
          value={other}
          maxLength={40}
          onChange={(event) => setOther(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addOther();
            }
          }}
        />
        <button
          type="button"
          className="shrink-0 rounded-xl border border-forest/20 px-3.5 text-sm font-semibold text-forest transition hover:border-forest/50 disabled:opacity-50"
          onClick={addOther}
          disabled={!other.trim()}
        >
          Add
        </button>
      </div>
    </ChoiceGroup>
  );
}

/** A single on/off choice shown as a card: used for "needs refrigeration". */
export function KeepColdToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition duration-200 has-focus-visible:ring-2 has-focus-visible:ring-orange ${
        checked
          ? 'border-sky-400 bg-sky-50 dark:border-sky-400/50 dark:bg-sky-400/10'
          : 'border-forest/15 bg-surface hover:border-forest/40'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition ${
          checked
            ? 'bg-sky-500 text-white'
            : 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300'
        }`}
        aria-hidden="true"
      >
        <Snowflake className="size-5" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold text-forest">Needs to stay cold</span>
        <span className="block text-xs text-forest/60">
          Dairy, cut fruit, or anything from the fridge. The NGO will bring a cool box.
        </span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-sky-500' : 'bg-forest/20'}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : ''}`}
        />
      </span>
    </label>
  );
}
