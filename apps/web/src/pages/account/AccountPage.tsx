import { Building2, KeyRound, UserRound, type LucideIcon } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import {
  newPasswordSchema,
  PASSWORD_MIN_LENGTH,
  profileUpdateSchema,
  type Me,
  type ProfileUpdateInput,
} from '@replate/shared';
import { useMe } from '../../auth/context.ts';
import { Avatar } from '../../components/ui/Avatar.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Alert } from '../../components/ui/Feedback.tsx';
import { TextField } from '../../components/ui/FormField.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { VerificationBadge } from '../../components/ui/StatusBadge.tsx';
import { useToast } from '../../components/ui/toast-context.ts';
import { PickupLocationField } from '../../features/donations/PickupLocationField.tsx';
import { useUpdateNgoSettings, useUpdateProfile } from '../../features/profile/queries.ts';
import { errorMessage } from '../../lib/api.ts';
import { authErrorMessage } from '../../lib/authErrors.ts';
import { fieldErrors, type FieldErrors } from '../../lib/forms.ts';
import { ROLE_LABELS } from '../../lib/labels.ts';
import { auth } from '../../lib/supabase.ts';

const RADIUS_CHOICES = [2, 5, 10, 20, 50, 100];

export function AccountPage() {
  const me = useMe();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <title>Your profile · RePlate</title>
      <h1 className="font-display text-4xl tracking-tight text-forest">Your profile</h1>
      <div className="mt-6 flex items-center gap-4 rounded-3xl bg-surface p-5 shadow-soft motion-safe:animate-fade-up sm:p-6">
        <Avatar name={me.displayName} size="lg" />
        <div className="min-w-0">
          <p className="font-display text-2xl break-words text-forest">{me.displayName}</p>
          <p className="truncate text-sm text-forest/65">{me.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-forest/10 px-2.5 py-1 text-xs font-bold text-forest">
              {ROLE_LABELS[me.role]}
            </span>
          </div>
        </div>
      </div>
      <div className="stagger mt-6 space-y-6">
        {/* Keyed by the saved profile, so the form restarts from fresh values after each save. */}
        <ProfileForm
          key={JSON.stringify([me.displayName, me.phone, me.address, me.lat, me.lng])}
          me={me}
        />
        {me.ngo && <NgoSettings me={me} />}
        <PasswordForm />
      </div>
    </div>
  );
}

interface ProfileValues {
  displayName: string;
  phone: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

function ProfileForm({ me }: { me: Me }) {
  const toast = useToast();
  const save = useUpdateProfile();
  const initial: ProfileValues = {
    displayName: me.displayName,
    phone: me.phone ?? '',
    address: me.address ?? '',
    lat: me.lat,
    lng: me.lng,
  };
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors<ProfileValues>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof ProfileValues>(field: K, value: ProfileValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // Send only what changed. The location is sent as a pair, since one without the other means nothing.
    const changes: ProfileUpdateInput = {};
    if (values.displayName !== initial.displayName) changes.displayName = values.displayName;
    if (values.phone !== initial.phone) changes.phone = values.phone;
    if (values.address !== initial.address) changes.address = values.address;
    if (values.lat !== initial.lat || values.lng !== initial.lng) {
      changes.lat = values.lat;
      changes.lng = values.lng;
    }
    if (Object.keys(changes).length === 0) {
      toast.show('Nothing to save.', 'info');
      return;
    }

    const parsed = profileUpdateSchema.safeParse(changes);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    try {
      await save.mutateAsync(changes);
      toast.show('Profile saved.');
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  const location =
    values.lat !== null && values.lng !== null ? { lat: values.lat, lng: values.lng } : null;

  return (
    <Section title="Details">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <TextField
          label={me.role === 'ngo' ? 'Organisation name' : 'Name'}
          autoComplete="organization"
          value={values.displayName}
          onChange={(value) => update('displayName', value)}
          error={errors.displayName}
          required
        />
        <TextField
          label="Phone"
          type="tel"
          autoComplete="tel"
          optional
          hint="Shared only with the other side of a pickup, once a donation is claimed."
          value={values.phone}
          onChange={(value) => update('phone', value)}
          error={errors.phone}
        />
        <PickupLocationField
          label={me.role === 'ngo' ? 'Base address' : 'Usual pickup address'}
          hint={
            me.role === 'ngo'
              ? 'Where you bring food back to. Searches for donations start here.'
              : 'Filled in for you on new donations. You can change it each time.'
          }
          required={false}
          address={values.address}
          location={location}
          onAddressChange={(value) => update('address', value)}
          onLocationChange={({ lat, lng }) => setValues((current) => ({ ...current, lat, lng }))}
          addressError={errors.address}
          locationError={errors.lat ?? errors.lng}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={save.isPending}>
            Save details
          </Button>
        </div>
      </form>
    </Section>
  );
}

function NgoSettings({ me }: { me: Me }) {
  const toast = useToast();
  const save = useUpdateNgoSettings();
  const saved = me.ngo?.serviceRadiusKm ?? 10;
  const [radius, setRadius] = useState(String(saved));
  const choices = RADIUS_CHOICES.includes(saved)
    ? RADIUS_CHOICES
    : [...RADIUS_CHOICES, saved].sort((a, b) => a - b);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await save.mutateAsync({ serviceRadiusKm: Number(radius) });
      toast.show(`Your default search area is now ${radius} km.`);
    } catch (error) {
      toast.show(errorMessage(error), 'error');
    }
  }

  return (
    <Section title="Organisation">
      {me.ngo && (
        <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-forest/70">
          <VerificationBadge verification={me.ngo.verification} />
          {me.ngo.registrationNumber && <span>Registration {me.ngo.registrationNumber}</span>}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <SelectField
          label="Default search distance"
          className="w-48"
          options={choices.map((km) => ({ value: String(km), label: `${km} km` }))}
          value={radius}
          onChange={(value) => setRadius(value || String(saved))}
        />
        <Button
          type="submit"
          variant="secondary"
          loading={save.isPending}
          disabled={Number(radius) === saved}
        >
          Save
        </Button>
      </form>
    </Section>
  );
}

interface PasswordValues {
  password: string;
  confirmPassword: string;
}

function PasswordForm() {
  const toast = useToast();
  const [values, setValues] = useState<PasswordValues>({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FieldErrors<PasswordValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(field: keyof PasswordValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = newPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setSaving(true);
    const { error } = await auth.updateUser({ password: parsed.data.password });
    setSaving(false);
    if (error) {
      setFormError(authErrorMessage(error));
      return;
    }
    setValues({ password: '', confirmPassword: '' });
    toast.show('Your password has been changed.');
  }

  return (
    <Section title="Password">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
            value={values.password}
            onChange={(value) => update('password', value)}
            error={errors.password}
          />
          <TextField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(value) => update('confirmPassword', value)}
            error={errors.confirmPassword}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" loading={saving}>
            Change password
          </Button>
        </div>
      </form>
    </Section>
  );
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  Details: UserRound,
  Organisation: Building2,
  Password: KeyRound,
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  const Icon = SECTION_ICONS[title] ?? UserRound;
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-soft sm:p-7">
      <h2 className="mb-5 flex items-center gap-3 font-display text-xl text-forest">
        <span
          className="flex size-9 items-center justify-center rounded-xl bg-moss/15 text-moss"
          aria-hidden="true"
        >
          <Icon className="size-4.5" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
