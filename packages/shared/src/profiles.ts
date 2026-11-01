import { z } from 'zod';
import type { Role } from './roles.ts';

export const NGO_VERIFICATIONS = ['pending', 'verified', 'rejected'] as const;

export type NgoVerification = (typeof NGO_VERIFICATIONS)[number];

export const PHONE_PATTERN = /^\+?[0-9 ()-]{7,20}$/;

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullable();

export const profileUpdateSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Enter at least 2 characters.')
      .max(120, 'Keep the name under 120 characters.'),
    phone: z
      .string()
      .trim()
      .transform((value) => value || null)
      .refine((value) => value === null || PHONE_PATTERN.test(value), 'Enter a valid phone number.')
      .nullable(),
    address: nullableText(300),
    lat: z.number().min(-90).max(90).nullable(),
    lng: z.number().min(-180).max(180).nullable(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Send at least one field to change.')
  .refine(
    (value) => (value.lat === undefined) === (value.lng === undefined),
    'Send latitude and longitude together.',
  );

export type ProfileUpdateInput = z.input<typeof profileUpdateSchema>;

export const ngoSettingsUpdateSchema = z.object({
  serviceRadiusKm: z.number().int().min(1).max(100),
});

export const ngoVerificationUpdateSchema = z.object({
  verification: z.enum(NGO_VERIFICATIONS),
});

export const adminNgosQuerySchema = z.object({
  verification: z.enum(NGO_VERIFICATIONS).optional(),
});

export interface NgoDetails {
  registrationNumber: string | null;
  verification: NgoVerification;
  verifiedAt: string | null;
  serviceRadiusKm: number;
}

export interface Me {
  id: string;
  email: string | null;
  role: Role;
  displayName: string;
  phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  /** Present only for NGO accounts. */
  ngo: NgoDetails | null;
}

export interface AdminNgo extends NgoDetails {
  id: string;
  displayName: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
}
