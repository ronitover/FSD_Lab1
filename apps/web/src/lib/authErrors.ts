import { AuthError } from '@supabase/supabase-js';

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'The email or password is incorrect.',
  email_not_confirmed: 'Confirm your email address first. The link is in your inbox.',
  user_already_exists: 'An account with this email already exists. Sign in instead.',
  email_exists: 'An account with this email already exists. Sign in instead.',
  weak_password: 'Choose a stronger password.',
  same_password: 'Choose a password you have not used here before.',
  over_email_send_rate_limit: 'Too many emails were sent. Wait a few minutes and try again.',
  over_request_rate_limit: 'Too many attempts. Wait a few minutes and try again.',
  signup_disabled: 'Sign-ups are closed right now.',
};

/** Turns a Supabase Auth error into a message for the person signing in. */
export function authErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    if (error.code && MESSAGES[error.code]) return MESSAGES[error.code]!;
    if (error.status === 0 || error.name === 'AuthRetryableFetchError') {
      return 'Could not reach RePlate. Check your connection.';
    }
  }
  return 'Something went wrong. Please try again.';
}
