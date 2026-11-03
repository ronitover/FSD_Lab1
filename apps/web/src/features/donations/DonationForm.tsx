import { useState, type FormEvent, type ReactNode } from 'react';
import { donationCreateSchema, MAX_EXPIRY_DAYS, type DonationCreateInput } from '@replate/shared';
import { Button } from '../../components/ui/Button.tsx';
import { Checkbox } from '../../components/ui/Checkbox.tsx';
import { Alert } from '../../components/ui/Feedback.tsx';
import { FormField, TextAreaField, TextField } from '../../components/ui/FormField.tsx';
import { RadioGroup } from '../../components/ui/RadioGroup.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { inputClasses } from '../../components/ui/styles.ts';
import { localInputFromNow } from '../../lib/dates.ts';
import { fieldErrors, type FieldErrors } from '../../lib/forms.ts';
import {
  CATEGORY_LABELS,
  COMMON_ALLERGENS,
  DIETARY_LABELS,
  optionsFrom,
  UNIT_LABELS,
} from '../../lib/labels.ts';
import { valuesToInput, type DonationFormValues } from './formValues.ts';
import { PickupLocationField } from './PickupLocationField.tsx';

const CATEGORY_OPTIONS = optionsFrom(CATEGORY_LABELS);
const DIETARY_OPTIONS = optionsFrom(DIETARY_LABELS);
const UNIT_OPTIONS = optionsFrom(UNIT_LABELS);
const EXPIRY_PRESETS = [2, 4, 8, 24];

interface DonationFormProps {
  initialValues: DonationFormValues;
  submitLabel: string;
  /** Receives input that has passed the same checks the API runs. */
  onSubmit: (input: DonationCreateInput) => Promise<void>;
  onCancel: () => void;
}

export function DonationForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: DonationFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors<DonationFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otherAllergen, setOtherAllergen] = useState('');

  function update<K extends keyof DonationFormValues>(field: K, value: DonationFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleAllergen(allergen: string, on: boolean) {
    update(
      'allergens',
      on ? [...values.allergens, allergen] : values.allergens.filter((item) => item !== allergen),
    );
  }

  function addOtherAllergen() {
    const allergen = otherAllergen.trim();
    if (
      allergen &&
      !values.allergens.some((item) => item.toLowerCase() === allergen.toLowerCase())
    ) {
      toggleAllergen(allergen, true);
    }
    setOtherAllergen('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = donationCreateSchema.safeParse(valuesToInput(values));
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
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

  const customAllergens = values.allergens.filter((item) => !COMMON_ALLERGENS.includes(item));
  const location =
    values.pickupLat !== null && values.pickupLng !== null
      ? { lat: values.pickupLat, lng: values.pickupLng }
      : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {formError && <Alert>{formError}</Alert>}

      <Section title="What are you donating?">
        <TextField
          label="Title"
          placeholder="e.g. Veg biryani from today's lunch buffet"
          value={values.title}
          onChange={(value) => update('title', value)}
          error={errors.title}
          maxLength={120}
          required
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Category"
            options={CATEGORY_OPTIONS}
            placeholder="Choose a category"
            value={values.category}
            onChange={(value) => update('category', value)}
            error={errors.category}
            required
          />
          <RadioGroup
            legend="Food type"
            name="dietaryType"
            appearance="pills"
            options={DIETARY_OPTIONS}
            value={values.dietaryType}
            onChange={(value) => update('dietaryType', value)}
            error={errors.dietaryType}
          />
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-3 sm:max-w-sm">
          <TextField
            label="Quantity"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={values.quantity}
            onChange={(value) => update('quantity', value)}
            error={errors.quantity}
            required
          />
          <SelectField
            label="Unit"
            options={UNIT_OPTIONS}
            value={values.quantityUnit}
            onChange={(value) => update('quantityUnit', value || 'servings')}
          />
        </div>
        <TextAreaField
          label="Description"
          optional
          placeholder="Ingredients, how it was stored, how it's packed…"
          value={values.description}
          onChange={(value) => update('description', value)}
          error={errors.description}
          maxLength={1000}
        />
      </Section>

      <Section title="Food safety">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-forest">Contains allergens</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {[...COMMON_ALLERGENS, ...customAllergens].map((allergen) => (
              <Checkbox
                key={allergen}
                label={allergen}
                checked={values.allergens.includes(allergen)}
                onChange={(on) => toggleAllergen(allergen, on)}
              />
            ))}
          </div>
          <div className="mt-3 flex max-w-sm gap-2">
            <input
              aria-label="Other allergen"
              placeholder="Other allergen"
              className={inputClasses}
              value={otherAllergen}
              maxLength={40}
              onChange={(event) => setOtherAllergen(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addOtherAllergen();
                }
              }}
            />
            <Button variant="secondary" onClick={addOtherAllergen} disabled={!otherAllergen.trim()}>
              Add
            </Button>
          </div>
          {errors.allergens && (
            <p className="mt-1.5 text-xs font-medium text-danger">{errors.allergens}</p>
          )}
        </fieldset>
        <Checkbox
          label="Needs refrigeration"
          description="The NGO should bring a cool box or collect quickly."
          checked={values.needsRefrigeration}
          onChange={(on) => update('needsRefrigeration', on)}
        />
        <TextField
          label="Prepared at"
          type="datetime-local"
          optional
          hint="For cooked food, when it was made."
          value={values.preparedAt}
          onChange={(value) => update('preparedAt', value)}
          error={errors.preparedAt}
          max={localInputFromNow()}
          className="sm:max-w-xs"
        />
      </Section>

      <Section title="When can it be collected?">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Available from"
            type="datetime-local"
            value={values.pickupFrom}
            onChange={(value) => update('pickupFrom', value)}
            error={errors.pickupFrom}
          />
          <FormField
            label="Collect by"
            error={errors.expiresAt}
            hint={`After this it is no longer safe to collect. At most ${MAX_EXPIRY_DAYS} days away.`}
          >
            {({ id, describedBy }) => (
              <>
                <input
                  id={id}
                  type="datetime-local"
                  className={inputClasses}
                  aria-invalid={errors.expiresAt ? true : undefined}
                  aria-describedby={describedBy}
                  value={values.expiresAt}
                  min={values.pickupFrom || localInputFromNow()}
                  max={localInputFromNow(MAX_EXPIRY_DAYS * 24)}
                  onChange={(event) => update('expiresAt', event.target.value)}
                  required
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {EXPIRY_PRESETS.map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => update('expiresAt', localInputFromNow(hours))}
                      className="rounded-full border border-forest/20 px-3 py-1 text-xs font-semibold text-forest hover:border-forest/50"
                    >
                      In {hours < 24 ? `${hours} h` : `${hours / 24} day`}
                    </button>
                  ))}
                </div>
              </>
            )}
          </FormField>
        </div>
      </Section>

      <Section title="Where is it?">
        <PickupLocationField
          address={values.pickupAddress}
          location={location}
          onAddressChange={(value) => update('pickupAddress', value)}
          onLocationChange={({ lat, lng }) => {
            setValues((current) => ({ ...current, pickupLat: lat, pickupLng: lng }));
            setErrors((current) => ({ ...current, pickupLat: undefined, pickupLng: undefined }));
          }}
          addressError={errors.pickupAddress}
          locationError={errors.pickupLat ?? errors.pickupLng}
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
      </Section>

      <div className="flex flex-col-reverse gap-3 border-t border-forest/10 pt-6 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" size="lg" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-5 rounded-3xl bg-surface p-5 shadow-soft sm:p-7">
      <h2 className="font-display text-xl text-forest">{title}</h2>
      {children}
    </section>
  );
}
