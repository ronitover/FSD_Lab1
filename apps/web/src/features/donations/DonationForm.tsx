import { ArrowLeft, ArrowRight, Check, Clock, MapPin, PencilLine } from 'lucide-react';
import {
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { donationCreateSchema, MAX_EXPIRY_DAYS, type DonationCreateInput } from '@replate/shared';
import { LocationMap } from '../../components/map/LocationMap.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Alert } from '../../components/ui/Feedback.tsx';
import { CategoryTile, FoodTypeLabel } from '../../components/ui/FoodVisuals.tsx';
import { TextAreaField, TextField } from '../../components/ui/FormField.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { inputClasses } from '../../components/ui/styles.ts';
import { formatDateTime, fromLocalInput, localInputFromNow } from '../../lib/dates.ts';
import { fieldErrors, type FieldErrors } from '../../lib/forms.ts';
import { COMMON_ALLERGENS, formatQuantity, optionsFrom, UNIT_LABELS } from '../../lib/labels.ts';
import {
  AllergenChips,
  CategoryPicker,
  CollectByPicker,
  FoodTypePicker,
  KeepColdToggle,
  QuantityStepper,
} from './formParts.tsx';
import { valuesToInput, type DonationFormValues } from './formValues.ts';
import { PickupLocationField } from './PickupLocationField.tsx';

const UNIT_OPTIONS = optionsFrom(UNIT_LABELS);

type Field = keyof DonationFormValues;

/** The three steps, and which fields each one asks for. */
const STEPS: { title: string; heading: string; fields: Field[] }[] = [
  {
    title: 'Food',
    heading: 'What are you donating?',
    fields: ['title', 'category', 'dietaryType', 'quantity', 'quantityUnit'],
  },
  {
    title: 'Safety & time',
    heading: 'Keeping it safe',
    fields: ['expiresAt', 'pickupFrom', 'preparedAt', 'allergens', 'needsRefrigeration'],
  },
  {
    title: 'Pickup',
    heading: 'Where should the NGO collect it?',
    fields: ['pickupAddress', 'pickupLat', 'pickupLng', 'pickupNotes', 'description'],
  },
];

interface DonationFormProps {
  initialValues: DonationFormValues;
  submitLabel: string;
  /** "edit" opens every step, since an existing donation already has all its details. */
  mode?: 'create' | 'edit';
  /** Receives input that has passed the same checks the API runs. */
  onSubmit: (input: DonationCreateInput) => Promise<void>;
  onCancel: () => void;
}

/**
 * The donation form, split into three short steps so it never feels like a wall of fields.
 * Each step is checked with the shared schema before moving on; the API checks everything again.
 */
export function DonationForm({
  initialValues,
  submitLabel,
  mode = 'create',
  onSubmit,
  onCancel,
}: DonationFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors<DonationFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(mode === 'edit' ? STEPS.length - 1 : 0);
  const topRef = useRef<HTMLDivElement>(null);

  const last = step === STEPS.length - 1;
  const current = STEPS[step] ?? STEPS[0]!;

  function update<K extends Field>(field: K, value: DonationFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleAllergen(allergen: string, on: boolean) {
    update(
      'allergens',
      on ? [...values.allergens, allergen] : values.allergens.filter((item) => item !== allergen),
    );
  }

  function goTo(next: number) {
    setStep(next);
    setReached((current) => Math.max(current, next));
    setFormError(null);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Errors from the shared schema, keyed by field. */
  function validate() {
    const parsed = donationCreateSchema.safeParse(valuesToInput(values));
    return parsed.success ? {} : fieldErrors<DonationFormValues>(parsed.error);
  }

  function next() {
    const all = validate();
    const here = Object.fromEntries(
      Object.entries(all).filter(([field]) => current.fields.includes(field as Field)),
    );
    if (Object.keys(here).length > 0) {
      setErrors(here);
      return;
    }
    goTo(step + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!last) {
      next();
      return;
    }
    setFormError(null);
    const all = validate();
    if (Object.keys(all).length > 0) {
      setErrors(all);
      // Send the donor back to the first step with a problem.
      const firstBad = STEPS.findIndex((item) => item.fields.some((field) => all[field]));
      if (firstBad !== -1 && firstBad !== step) goTo(firstBad);
      setFormError('Some details need fixing. They are marked below.');
      return;
    }
    setSubmitting(true);
    try {
      // Send what was validated, before zod's defaults and transforms, so the API validates the same thing.
      await onSubmit(valuesToInput(values) as DonationCreateInput);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div ref={topRef} className="scroll-mt-24" />
      <StepIndicator step={step} reached={reached} onSelect={goTo} />

      <section
        key={step}
        aria-labelledby="step-heading"
        className="mt-6 space-y-7 rounded-3xl bg-surface p-5 shadow-soft motion-safe:animate-fade-up sm:p-8"
      >
        <h2 id="step-heading" className="font-display text-2xl text-forest sm:text-3xl">
          {current.heading}
        </h2>
        {formError && <Alert>{formError}</Alert>}

        {step === 0 && (
          <>
            <TextField
              label="What is it?"
              placeholder="e.g. Veg biryani from today's lunch buffet"
              value={values.title}
              onChange={(value) => update('title', value)}
              error={errors.title}
              maxLength={120}
              required
              autoFocus={mode === 'create'}
            />
            <CategoryPicker
              value={values.category}
              onChange={(value) => update('category', value)}
              error={errors.category}
            />
            <FoodTypePicker
              value={values.dietaryType}
              onChange={(value) => update('dietaryType', value)}
              error={errors.dietaryType}
            />
            <QuantityStepper
              value={values.quantity}
              onChange={(value) => update('quantity', value)}
              error={errors.quantity}
              unitSelect={
                <SelectField
                  label="Unit"
                  className="[&_label]:sr-only"
                  options={UNIT_OPTIONS}
                  value={values.quantityUnit}
                  onChange={(value) => update('quantityUnit', value || 'servings')}
                />
              }
            />
          </>
        )}

        {step === 1 && (
          <>
            <CollectByPicker
              value={values.expiresAt}
              onChange={(value) => update('expiresAt', value)}
              min={values.pickupFrom || localInputFromNow()}
              max={localInputFromNow(MAX_EXPIRY_DAYS * 24)}
              error={errors.expiresAt}
            />
            <ReadyFrom
              value={values.pickupFrom}
              onChange={(value) => update('pickupFrom', value)}
              error={errors.pickupFrom}
            />
            <AllergenChips
              common={COMMON_ALLERGENS}
              selected={values.allergens}
              onToggle={toggleAllergen}
              error={errors.allergens}
            />
            <KeepColdToggle
              checked={values.needsRefrigeration}
              onChange={(on) => update('needsRefrigeration', on)}
            />
            {/* Only cooked food needs a cooking time, so other categories skip the question. */}
            {(values.category === 'cooked_meal' || values.preparedAt) && (
              <TextField
                label="When was it cooked?"
                type="datetime-local"
                optional
                hint="Helps the NGO judge how fresh it is."
                value={values.preparedAt}
                onChange={(value) => update('preparedAt', value)}
                error={errors.preparedAt}
                max={localInputFromNow()}
                className="sm:max-w-xs"
              />
            )}
          </>
        )}

        {step === 2 && (
          <>
            <PickupStep
              values={values}
              errors={errors}
              setValues={setValues}
              setErrors={setErrors}
            />
            <TextAreaField
              label="Pickup instructions"
              optional
              placeholder="e.g. Use the back entrance, ask for Ravi at the counter."
              value={values.pickupNotes}
              onChange={(value) => update('pickupNotes', value)}
              error={errors.pickupNotes}
              maxLength={500}
              rows={2}
            />
            <TextAreaField
              label="Anything else NGOs should know?"
              optional
              placeholder="Ingredients, how it was stored, how it's packed…"
              value={values.description}
              onChange={(value) => update('description', value)}
              error={errors.description}
              maxLength={1000}
              rows={2}
            />
            <Review values={values} onEdit={goTo} />
          </>
        )}
      </section>

      {/* Sticks to the bottom on phones, so Next is always in reach. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-forest/10 bg-cream/90 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
        {step === 0 ? (
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => goTo(step - 1)} disabled={submitting}>
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Button>
        )}
        <Button type="submit" size="lg" loading={submitting} variant={last ? 'accent' : 'primary'}>
          {last ? (
            <>
              <Check className="size-4" aria-hidden="true" /> {submitLabel}
            </>
          ) : (
            <>
              Next <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/** Numbered steps with a progress line. Steps already visited can be jumped back to. */
function StepIndicator({
  step,
  reached,
  onSelect,
}: {
  step: number;
  reached: number;
  onSelect: (step: number) => void;
}) {
  return (
    <nav aria-label="Form steps">
      <ol className="flex items-center gap-2">
        {STEPS.map((item, index) => {
          const current = index === step;
          const done = index < step || (index <= reached && !current);
          return (
            <li key={item.title} className="flex flex-1 items-center gap-2 last:flex-none">
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={index > reached}
                aria-current={current ? 'step' : undefined}
                className="group flex items-center gap-2 rounded-full disabled:cursor-not-allowed"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition duration-300 ${
                    current
                      ? 'scale-110 bg-forest text-cream shadow-lg shadow-forest/20'
                      : done
                        ? 'bg-moss text-white'
                        : 'border border-forest/20 bg-surface text-forest/50'
                  }`}
                >
                  {done && !current ? (
                    <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`text-sm font-semibold whitespace-nowrap ${
                    current ? 'text-forest' : 'hidden text-forest/55 sm:inline'
                  }`}
                >
                  {item.title}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <span
                  className="h-0.5 flex-1 overflow-hidden rounded-full bg-forest/10"
                  aria-hidden="true"
                >
                  <span
                    className={`block h-full rounded-full bg-moss transition-all duration-500 ${
                      index < step ? 'w-full' : 'w-0'
                    }`}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** "Ready for pickup now", with a way to set a later time. */
function ReadyFrom({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  // Opens on the exact time if one later than now was already set, e.g. when editing.
  const [open, setOpen] = useState(() => {
    const iso = fromLocalInput(value);
    return iso !== undefined && Date.parse(iso) > Date.now() + 5 * 60 * 1000;
  });

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-forest">Ready for pickup</p>
      {open ? (
        <input
          type="datetime-local"
          aria-label="Ready for pickup from"
          className={`${inputClasses} max-w-xs motion-safe:animate-fade-up`}
          aria-invalid={error ? true : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-forest/75">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-moss" aria-hidden="true" /> Right now
          </span>
          <button
            type="button"
            className="font-semibold text-moss underline-offset-4 hover:underline"
            onClick={() => setOpen(true)}
          >
            Later?
          </button>
        </p>
      )}
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

/** The saved pickup address as a card, so most donors never need to touch the map. */
function PickupStep({
  values,
  errors,
  setValues,
  setErrors,
}: {
  values: DonationFormValues;
  errors: FieldErrors<DonationFormValues>;
  setValues: Dispatch<SetStateAction<DonationFormValues>>;
  setErrors: Dispatch<SetStateAction<FieldErrors<DonationFormValues>>>;
}) {
  const hasLocation = values.pickupLat !== null && values.pickupLng !== null;
  const [changing, setChanging] = useState(!hasLocation || !values.pickupAddress);

  if (!changing && hasLocation) {
    return (
      <div className="overflow-hidden rounded-2xl border border-forest/15">
        <LocationMap
          lat={values.pickupLat!}
          lng={values.pickupLng!}
          label={values.pickupAddress}
          className="h-40"
        />
        <div className="flex items-start gap-3 p-4">
          <MapPin className="mt-0.5 size-5 shrink-0 text-orange" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-forest/55">Pickup from</p>
            <p className="text-sm font-semibold break-words text-forest">{values.pickupAddress}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setChanging(true)}>
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PickupLocationField
      address={values.pickupAddress}
      location={hasLocation ? { lat: values.pickupLat!, lng: values.pickupLng! } : null}
      onAddressChange={(value) => {
        setValues((current) => ({ ...current, pickupAddress: value }));
        setErrors((current) => ({ ...current, pickupAddress: undefined }));
      }}
      onLocationChange={({ lat, lng }) => {
        setValues((current) => ({ ...current, pickupLat: lat, pickupLng: lng }));
        setErrors((current) => ({ ...current, pickupLat: undefined, pickupLng: undefined }));
      }}
      addressError={errors.pickupAddress}
      locationError={errors.pickupLat ?? errors.pickupLng}
    />
  );
}

/** A last look at what will be posted, with shortcuts back to each step. */
function Review({
  values,
  onEdit,
}: {
  values: DonationFormValues;
  onEdit: (step: number) => void;
}) {
  const expires = fromLocalInput(values.expiresAt);
  const rows: { label: string; value: ReactNode; step: number }[] = [
    {
      label: 'Food',
      step: 0,
      value: (
        <span className="flex items-center gap-3">
          {values.category && <CategoryTile category={values.category} size="sm" />}
          <span className="min-w-0">
            <span className="block font-semibold break-words text-forest">
              {values.title || 'Untitled'}
            </span>
            <span className="flex flex-wrap items-center gap-x-2 text-xs text-forest/60">
              {values.dietaryType && <FoodTypeLabel type={values.dietaryType} />}
              {values.quantity && formatQuantity(Number(values.quantity), values.quantityUnit)}
            </span>
          </span>
        </span>
      ),
    },
    {
      label: 'Collect by',
      step: 1,
      value: (
        <span className="text-sm text-forest">
          {expires ? formatDateTime(expires) : 'Not set'}
          {values.allergens.length > 0 && (
            <span className="block text-xs text-forest/60">
              Contains {values.allergens.join(', ')}
            </span>
          )}
          {values.needsRefrigeration && (
            <span className="block text-xs text-sky-700 dark:text-sky-300">Keep cold</span>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-2xl bg-cream/70 p-4">
      <p className="mb-3 text-xs font-bold tracking-[0.18em] text-moss uppercase">Review</p>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <dt className="sr-only">{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-moss hover:bg-moss/10"
              aria-label={`Edit ${row.label.toLowerCase()}`}
            >
              <PencilLine className="size-3.5" aria-hidden="true" /> Edit
            </button>
          </div>
        ))}
      </dl>
    </div>
  );
}
