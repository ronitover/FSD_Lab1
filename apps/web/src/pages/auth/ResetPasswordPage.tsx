import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { newPasswordSchema, PASSWORD_MIN_LENGTH } from '@replate/shared';
import { HOME_BY_ROLE, useAuth } from '../../auth/context.ts';
import { AuthCard } from '../../components/layout/AuthCard.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Alert, FullPageSpinner } from '../../components/ui/Feedback.tsx';
import { TextField } from '../../components/ui/FormField.tsx';
import { useToast } from '../../components/ui/toast-context.ts';
import { authErrorMessage } from '../../lib/authErrors.ts';
import { fieldErrors, type FieldErrors } from '../../lib/forms.ts';
import { auth as authClient } from '../../lib/supabase.ts';

interface NewPasswordValues {
  password: string;
  confirmPassword: string;
}

/** Where the reset email lands. The link signs the person in, so they can set a new password. */
export function ResetPasswordPage() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState<NewPasswordValues>({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FieldErrors<NewPasswordValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (auth.status === 'loading') return <FullPageSpinner />;

  if (auth.status === 'signed-out') {
    return (
      <AuthCard
        title="This link has expired"
        subtitle="Password reset links work once and only for a short time."
      >
        <title>Reset your password · RePlate</title>
        <Link
          to="/forgot-password"
          className="inline-block py-1 font-semibold text-moss underline-offset-4 hover:underline"
        >
          Send a new link
        </Link>
      </AuthCard>
    );
  }

  function update<K extends keyof NewPasswordValues>(field: K, value: string) {
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

    setSubmitting(true);
    const { error } = await authClient.updateUser({ password: parsed.data.password });
    setSubmitting(false);
    if (error) {
      setFormError(authErrorMessage(error));
      return;
    }
    toast.show('Your password has been changed.');
    void navigate(auth.status === 'signed-in' ? HOME_BY_ROLE[auth.me.role] : '/', {
      replace: true,
    });
  }

  return (
    <AuthCard title="Choose a new password">
      <title>Reset your password · RePlate</title>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          value={values.password}
          onChange={(value) => update('password', value)}
          error={errors.password}
          required
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(value) => update('confirmPassword', value)}
          error={errors.confirmPassword}
          required
        />
        <Button type="submit" loading={submitting} className="w-full">
          Save password
        </Button>
      </form>
    </AuthCard>
  );
}
