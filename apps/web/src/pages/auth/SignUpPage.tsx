import {
  ArrowRight,
  Building2,
  ChefHat,
  FileBadge,
  HandHeart,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react';
import * as m from 'motion/react-m';
import { AnimatePresence } from 'motion/react';
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { PASSWORD_MIN_LENGTH, signUpSchema, type SignUpRole } from '@replate/shared';
import { AuthCard } from '../../components/layout/AuthCard.tsx';
import { AuthField } from '../../components/ui/AuthField.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Alert } from '../../components/ui/Feedback.tsx';
import { RadioGroup, type RadioOption } from '../../components/ui/RadioGroup.tsx';
import { authErrorMessage } from '../../lib/authErrors.ts';
import { fieldErrors, looksLikeEmail, type FieldErrors } from '../../lib/forms.ts';
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
    icon: <ChefHat />,
  },
  {
    value: 'ngo',
    label: 'I represent an NGO',
    description: 'Find and collect donations near you once we verify your organisation.',
    icon: <HandHeart />,
  },
];

const TITLES: Record<SignUpRole | '', string> = {
  '': 'Join RePlate',
  donor: 'Join as a donor',
  ngo: 'Register your NGO',
};

const EMPTY: SignUpValues = {
  role: '',
  displayName: '',
  email: '',
  password: '',
  phone: '',
  registrationNumber: '',
};

export function SignUpPage() {
  // The landing page's "Donate food" and "I represent an NGO" links say which role was chosen.
  const [params] = useSearchParams();
  const roleParam = params.get('role');
  const [values, setValues] = useState<SignUpValues>(() => ({
    ...EMPTY,
    role: roleParam === 'donor' || roleParam === 'ngo' ? roleParam : '',
  }));
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

  const isNgo = values.role === 'ngo';

  return (
    <AuthCard
      title={TITLES[values.role]}
      subtitle={
        values.role
          ? 'A few details and you are in. It takes about a minute.'
          : 'Good food deserves another plate. First, how will you use RePlate?'
      }
      error={formError ?? Object.values(errors).find(Boolean)}
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
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <Alert>{formError}</Alert>}
        <RadioGroup
          legend="How will you use RePlate?"
          name="role"
          options={ROLE_OPTIONS}
          value={values.role}
          onChange={(value) => update('role', value)}
          error={errors.role}
          className="[&_legend]:sr-only"
        />

        {/* The rest of the form slides in once a role is chosen. */}
        <AnimatePresence initial={false}>
          {values.role && (
            <m.div
              key="details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 28 }}
              className="-mx-1 overflow-hidden px-1"
            >
              <div className="space-y-4 pt-2">
                <AuthField
                  label={isNgo ? 'Organisation name' : 'Your name or business name'}
                  icon={isNgo ? Building2 : UserRound}
                  autoComplete="organization"
                  value={values.displayName}
                  onChange={(value) => update('displayName', value)}
                  error={errors.displayName}
                  valid={values.displayName.trim().length >= 2}
                  required
                />
                <AnimatePresence initial={false}>
                  {isNgo && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="-mx-1 overflow-hidden px-1"
                    >
                      <AuthField
                        label="Registration number"
                        icon={FileBadge}
                        optional
                        hint="Helps us verify your organisation faster, e.g. your NGO Darpan ID."
                        value={values.registrationNumber}
                        onChange={(value) => update('registrationNumber', value)}
                        error={errors.registrationNumber}
                      />
                    </m.div>
                  )}
                </AnimatePresence>
                <AuthField
                  label="Email"
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(value) => update('email', value)}
                  error={errors.email}
                  valid={looksLikeEmail(values.email)}
                  required
                />
                <AuthField
                  label="Phone"
                  icon={Phone}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  optional
                  hint="Shared only with the other side of a pickup, once a donation is claimed."
                  value={values.phone}
                  onChange={(value) => update('phone', value)}
                  error={errors.phone}
                  valid={values.phone.replace(/\D/g, '').length >= 10}
                />
                <AuthField
                  label="Password"
                  icon={LockKeyhole}
                  type="password"
                  autoComplete="new-password"
                  hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
                  value={values.password}
                  onChange={(value) => update('password', value)}
                  error={errors.password}
                  showStrength
                  required
                />
                <Button type="submit" size="lg" loading={submitting} className="group w-full">
                  {isNgo ? 'Register NGO' : 'Create account'}
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </form>
    </AuthCard>
  );
}
