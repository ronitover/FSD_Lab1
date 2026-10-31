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
