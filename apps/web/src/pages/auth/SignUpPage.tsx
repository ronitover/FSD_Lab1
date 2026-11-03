import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { PASSWORD_MIN_LENGTH, signUpSchema, type SignUpRole } from '@replate/shared';
import { AuthCard } from '../../components/layout/AuthCard.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Alert } from '../../components/ui/Feedback.tsx';
import { TextField } from '../../components/ui/FormField.tsx';
import { RadioGroup, type RadioOption } from '../../components/ui/RadioGroup.tsx';
import { authErrorMessage } from '../../lib/authErrors.ts';
import { fieldErrors, type FieldErrors } from '../../lib/forms.ts';
import { auth } from '../../lib/supabase.ts';
import { CheckEmail } from './CheckEmail.tsx';

interface SignUpValues {
  role: SignUpRole | '';
  displayName: string;
  email: string;
  password: string;
  phone: string;
  registrationNumber: string;
}

const ROLE_OPTIONS: RadioOption<SignUpRole>[] = [
  {
    value: 'donor',
    label: 'I have food to donate',
    description: 'Restaurants, stores, caterers, events and households.',
  },
  {
    value: 'ngo',
    label: 'I represent an NGO',
    description: 'Find and collect donations near you once we verify your organisation.',
  },
];

const EMPTY: SignUpValues = {
  role: '',
  displayName: '',
  email: '',
  password: '',
  phone: '',
  registrationNumber: '',
};

export function SignUpPage() {
  const [values, setValues] = useState<SignUpValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<SignUpValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  function update<K extends keyof SignUpValues>(field: K, value: SignUpValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = signUpSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    const { email, password, role, displayName, phone, registrationNumber } = parsed.data;
    setSubmitting(true);
    const { data, error } = await auth.signUp({
      email,
      password,
      options: {
        // Read by the database when it creates the profile (see handle_new_user).
        data: {
          role,
          display_name: displayName,
          phone,
          registration_number: role === 'ngo' ? registrationNumber : null,
        },
        emailRedirectTo: `${window.location.origin}/signin`,
      },
    });
    setSubmitting(false);

    if (error) {
      setFormError(authErrorMessage(error));
      return;
    }
    // With email confirmation on, Supabase doesn't reveal whether the address is already registered:
    // it returns a user with no identities instead of an error.
    if (data.user && data.user.identities?.length === 0) {
      setFormError('An account with this email already exists. Sign in instead.');
      return;
    }
    // No session means the email must be confirmed first. With a session, the auth state change
    // takes the new user straight to their dashboard.
    if (!data.session) setSentTo(email);
  }

  if (sentTo) return <CheckEmail email={sentTo} />;

  return (
    <AuthCard
      title="Join RePlate"
      subtitle="Good food deserves another plate. It takes a minute to get started."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/signin"
            className="inline-block py-1 font-semibold text-moss underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <title>Create an account · RePlate</title>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <RadioGroup
          legend="How will you use RePlate?"
          name="role"
          options={ROLE_OPTIONS}
          value={values.role}
          onChange={(value) => update('role', value)}
          error={errors.role}
        />
        <TextField
          label={values.role === 'ngo' ? 'Organisation name' : 'Your name or business name'}
          autoComplete="organization"
          value={values.displayName}
          onChange={(value) => update('displayName', value)}
          error={errors.displayName}
          required
        />
        {values.role === 'ngo' && (
          <TextField
            label="Registration number"
            optional
            hint="Helps us verify your organisation faster, e.g. your NGO Darpan ID."
            value={values.registrationNumber}
            onChange={(value) => update('registrationNumber', value)}
            error={errors.registrationNumber}
          />
        )}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(value) => update('email', value)}
          error={errors.email}
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
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          value={values.password}
          onChange={(value) => update('password', value)}
          error={errors.password}
          required
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
