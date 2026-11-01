import { z } from 'zod';
import { PHONE_PATTERN } from './profiles.ts';

/** Roles a person can choose at sign-up. Admins are promoted by hand. */
export const SIGN_UP_ROLES = ['donor', 'ngo'] as const;

export type SignUpRole = (typeof SIGN_UP_ROLES)[number];

export const PASSWORD_MIN_LENGTH = 8;

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.'));

export const signUpSchema = z.object({
  role: z.enum(SIGN_UP_ROLES, 'Choose how you will use RePlate.'),
  displayName: z
    .string()
    .trim()
    .min(2, 'Enter at least 2 characters.')
    .max(120, 'Keep the name under 120 characters.'),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
    // Supabase hashes passwords with bcrypt, which ignores anything past 72 bytes.
    .max(72, 'Keep the password under 72 characters.'),
  phone: z
    .string()
    .trim()
    .transform((value) => value || null)
    .refine((value) => value === null || PHONE_PATTERN.test(value), 'Enter a valid phone number.'),
  registrationNumber: z
    .string()
    .trim()
    .max(60, 'Keep the registration number under 60 characters.')
    .transform((value) => value || null),
});

export type SignUpInput = z.input<typeof signUpSchema>;

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
});

export const passwordResetRequestSchema = z.object({ email });

export const newPasswordSchema = z
  .object({
    password: signUpSchema.shape.password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The passwords do not match.',
  });
