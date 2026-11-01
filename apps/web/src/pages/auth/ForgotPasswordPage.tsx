import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { passwordResetRequestSchema } from '@replate/shared';
import { AuthCard } from '../../components/layout/AuthCard.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Alert } from '../../components/ui/Feedback.tsx';
import { TextField } from '../../components/ui/FormField.tsx';
import { authErrorMessage } from '../../lib/authErrors.ts';
import { fieldErrors } from '../../lib/forms.ts';
import { auth } from '../../lib/supabase.ts';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = passwordResetRequestSchema.safeParse({ email });
    if (!parsed.success) {
      setEmailError(fieldErrors<{ email: string }>(parsed.error).email);
      return;
    }

    setSubmitting(true);
    const { error } = await auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) setFormError(authErrorMessage(error));
    else setSent(true);
  }

  const backToSignIn = (
    <Link to="/signin" className="font-semibold text-moss underline-offset-4 hover:underline">
      Back to sign in
    </Link>
  );

  if (sent) {
    return (
      <AuthCard title="Check your email" footer={backToSignIn}>
        <title>Reset your password · RePlate</title>
        {/* Same message whether or not the account exists, so this can't be used to probe emails. */}
        <p className="text-sm leading-6 text-forest/70">
          If an account exists for <strong className="text-forest">{email.trim()}</strong>, we have
          sent a link to reset its password.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your account's email and we'll send you a link to choose a new password."
      footer={backToSignIn}
    >
      <title>Reset your password · RePlate</title>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert>{formError}</Alert>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setEmailError(undefined);
          }}
          error={emailError}
          required
        />
        <Button type="submit" loading={submitting} className="w-full">
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
