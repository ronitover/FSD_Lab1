import { z } from 'zod';

/**
 * Lifecycle of a donation:
 * available -> claimed -> collected, with cancelled (by the donor) and expired (by the scheduler)
 * as the other ways out. An NGO releasing a claim moves it from claimed back to available.
 */
export const DONATION_STATUSES = [
  'available',
  'claimed',
  'collected',
  'cancelled',
  'expired',
] as const;

export type DonationStatus = (typeof DONATION_STATUSES)[number];

export const DIETARY_TYPES = ['veg', 'non_veg', 'vegan'] as const;

export type DietaryType = (typeof DIETARY_TYPES)[number];

export const FOOD_CATEGORIES = ['cooked_meal', 'produce', 'bakery', 'packaged', 'dairy'] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export const QUANTITY_UNITS = ['servings', 'kg', 'items'] as const;

export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

/** How far ahead a donation's expiry can be set. Long enough for packaged food, short enough to keep listings fresh. */
export const MAX_EXPIRY_DAYS = 7;

// Optional text fields: blank input is stored as null rather than an empty string.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullish();

const timestamp = (message = 'Enter a valid date and time.') =>
  z.iso.datetime({ offset: true, message });

const donationFields = z.object({
  title: z.string().trim().min(3, 'Describe the food in at least 3 characters.').max(120),
  description: optionalText(1000),
  category: z.enum(FOOD_CATEGORIES, 'Choose a category.'),
  dietaryType: z.enum(DIETARY_TYPES, 'Choose veg, non-veg or vegan.'),
  quantity: z
    .number('Enter how much food there is.')
    .int('Use a whole number.')
    .min(1, 'Must be at least 1.')
    .max(100_000, 'That is more than one listing can hold.'),
  quantityUnit: z.enum(QUANTITY_UNITS).default('servings'),
  allergens: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  needsRefrigeration: z.boolean().default(false),
  preparedAt: timestamp().nullish(),
  pickupFrom: timestamp().optional(),
  expiresAt: timestamp('Choose when the food should be collected by.'),
  pickupAddress: z.string().trim().min(5, 'Add a pickup address so NGOs can find you.').max(300),
  pickupLat: z.number('Mark the pickup location on the map.').min(-90).max(90),
  pickupLng: z.number('Mark the pickup location on the map.').min(-180).max(180),
  pickupNotes: optionalText(500),
});

type TimeFields = {
  preparedAt?: string | null;
  pickupFrom?: string;
  expiresAt?: string;
};

// Cross-field time rules. On updates only the fields being changed are checked here;
// the database's own constraints compare them against the stored values.
function checkTimes(value: TimeFields, ctx: z.RefinementCtx) {
  const now = Date.now();
  const expires = value.expiresAt ? Date.parse(value.expiresAt) : undefined;
  const from = value.pickupFrom ? Date.parse(value.pickupFrom) : undefined;
  const prepared = value.preparedAt ? Date.parse(value.preparedAt) : undefined;

  if (expires !== undefined) {
    if (expires <= now) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiresAt'],
        message: 'Expiry must be in the future.',
      });
    } else if (expires > now + MAX_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiresAt'],
        message: `Expiry can be at most ${MAX_EXPIRY_DAYS} days away.`,
      });
    }
    if (from !== undefined && expires <= from) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiresAt'],
        message: 'Expiry must be after the pickup start time.',
      });
    }
  }
  if (prepared !== undefined && prepared > now) {
    ctx.addIssue({
      code: 'custom',
      path: ['preparedAt'],
      message: 'Preparation time cannot be in the future.',
    });
  }
}

export const donationCreateSchema = donationFields.superRefine(checkTimes);

export type DonationCreateInput = z.input<typeof donationCreateSchema>;

// Defaults are dropped so a partial update never resets fields the donor didn't touch.
export const donationUpdateSchema = z
  .object({
    ...donationFields.shape,
    quantityUnit: z.enum(QUANTITY_UNITS),
    allergens: z.array(z.string().trim().min(1).max(40)).max(20),
    needsRefrigeration: z.boolean(),
  })
  .partial()
  .superRefine(checkTimes)
  .refine((value) => Object.keys(value).length > 0, 'Send at least one field to change.');

export type DonationUpdateInput = z.input<typeof donationUpdateSchema>;

// Query strings arrive as text, so numbers are coerced and blanks treated as missing.
const searchText = z
  .string()
  .trim()
  .max(100)
  .transform((value) => value || undefined)
  .optional();

export const myDonationsQuerySchema = z.object({
  q: searchText,
  status: z.enum(DONATION_STATUSES).optional(),
});

export const claimedDonationsQuerySchema = z.object({
  status: z.enum(DONATION_STATUSES).optional(),
});

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().int().min(1).max(100).optional(),
  q: searchText,
  category: z.enum(FOOD_CATEGORIES).optional(),
  dietaryType: z.enum(DIETARY_TYPES).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type NearbyQuery = z.input<typeof nearbyQuerySchema>;

export interface Donation {
  id: string;
  donorId: string;
  title: string;
  description: string | null;
  category: FoodCategory;
  dietaryType: DietaryType;
  quantity: number;
  quantityUnit: QuantityUnit;
  allergens: string[];
  needsRefrigeration: boolean;
  preparedAt: string | null;
  pickupFrom: string;
  expiresAt: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupNotes: string | null;
  status: DonationStatus;
  claimedBy: string | null;
  claimedAt: string | null;
  collectedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DonationEvent {
  status: DonationStatus;
  actorId: string | null;
  createdAt: string;
}

/** The other side of a claim: the NGO for a donor, the donor for an NGO. Only present once claimed. */
export interface DonationContact {
  id: string;
  displayName: string;
  phone: string | null;
  address: string | null;
}

export interface DonationDetail extends Donation {
  events: DonationEvent[];
  contact: DonationContact | null;
}

/** What an NGO sees while browsing: no donor contact details until it claims. */
export interface NearbyDonation {
  id: string;
  title: string;
  description: string | null;
  category: FoodCategory;
  dietaryType: DietaryType;
  quantity: number;
  quantityUnit: QuantityUnit;
  allergens: string[];
  needsRefrigeration: boolean;
  preparedAt: string | null;
  pickupFrom: string;
  expiresAt: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  donorName: string;
  distanceKm: number;
}
