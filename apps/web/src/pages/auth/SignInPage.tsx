import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { signInSchema } from '@replate/shared';
import { AuthCard } from '../../components/layout/AuthCard.tsx';
import { AuthField } from '../../components/ui/AuthField.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Alert } from '../../components/ui/Feedback.tsx';
import { authErrorMessage } from '../../lib/authErrors.ts';
import { fieldErrors, looksLikeEmail, type FieldErrors } from '../../lib/forms.ts';
import { auth } from '../../lib/supabase.ts';

interface SignInValues {
  email: string;
  password: string;
}

export function SignInPage() {
  const [values, setValues] = useState<SignInValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<SignInValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof SignInValues>(field: K, value: SignInValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = signInSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setSubmitting(true);
    const { error } = await auth.signInWithPassword(parsed.data);
    setSubmitting(false);
    // On success the auth state changes and <RedirectIfSignedIn> moves on to the dashboard.
    if (error) setFormError(authErrorMessage(error));
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to share food or find donations near you."
      error={formError ?? Object.values(errors).find(Boolean)}
      footer={
        <>
          New to RePlate?{' '}
          <Link
            to="/signup"
            className="inline-block py-1 font-semibold text-moss underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <title>Sign in · RePlate</title>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <Alert>{formError}</Alert>}
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
          label="Password"
          icon={LockKeyhole}
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(value) => update('password', value)}
          error={errors.password}
          required
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="inline-block py-1 text-sm font-semibold text-moss underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={submitting} className="group w-full">
          Sign in
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Button>
      </form>
    </AuthCard>
  );
}
