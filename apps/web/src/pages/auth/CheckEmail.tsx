import { useState } from 'react';
import { Link } from 'react-router';
import { AuthCard } from '../../components/layout/AuthCard.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Alert } from '../../components/ui/Feedback.tsx';
import { authErrorMessage } from '../../lib/authErrors.ts';
import { auth } from '../../lib/supabase.ts';

export function CheckEmail({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setState('sending');
    setError(null);
    const { error: resendError } = await auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/signin` },
    });
    if (resendError) {
      setError(authErrorMessage(resendError));
      setState('idle');
    } else {
      setState('sent');
    }
  }

  return (
    <AuthCard
      title="Check your email"
      subtitle={
        <>
          We sent a confirmation link to <strong className="text-forest">{email}</strong>. Open it
          to finish creating your account.
        </>
      }
      footer={
        <Link
          to="/signin"
          className="inline-block py-1 font-semibold text-moss underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <title>Check your email · RePlate</title>
      <div className="space-y-4">
        {error && <Alert>{error}</Alert>}
        {state === 'sent' && (
          <Alert tone="success">Sent again. It can take a minute to arrive.</Alert>
        )}
        <p className="text-sm text-forest/65">Nothing yet? Check your spam folder, or</p>
        <Button variant="secondary" onClick={() => void resend()} loading={state === 'sending'}>
          Send the link again
        </Button>
      </div>
    </AuthCard>
  );
}
