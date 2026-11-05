import { PASSWORD_MIN_LENGTH } from '@replate/shared';

export interface PasswordStrength {
  /** 0 (too short) to 4 (great). */
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

const LABELS = ['Too short', 'Weak', 'Okay', 'Strong', 'Great'] as const;

/**
 * A rough guide shown while someone picks a password. Below the minimum length it is always
 * "Too short"; after that, length and a mix of character types add points. It only advises: the
 * real rule is the minimum length the shared schema enforces.
 */
export function passwordStrength(password: string): PasswordStrength {
  if (password.length < PASSWORD_MIN_LENGTH) return { score: 0, label: LABELS[0] };
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((kind) =>
    kind.test(password),
  ).length;
  let score = 1;
  if (kinds >= 2) score += 1;
  if (kinds >= 3) score += 1;
  if (password.length >= 12 && kinds >= 2) score += 1;
  const clamped = Math.min(score, 4) as PasswordStrength['score'];
  return { score: clamped, label: LABELS[clamped] };
}
