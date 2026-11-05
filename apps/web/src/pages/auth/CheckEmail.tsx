import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import * as m from 'motion/react-m';
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
        {/* The envelope drops in and wiggles, so it's clear something was sent. */}
        <m.div
          initial={{ y: -30, opacity: 0, rotate: -12 }}
          animate={{ y: 0, opacity: 1, rotate: [0, -8, 8, -4, 0] }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          className="flex size-16 items-center justify-center rounded-2xl bg-moss/15 text-moss"
          aria-hidden="true"
        >
          <MailCheck className="size-8" />
        </m.div>
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
