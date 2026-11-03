import type {
  DietaryType,
  DonationStatus,
  FoodCategory,
  NgoVerification,
  QuantityUnit,
  Role,
} from '@replate/shared';

export const ROLE_LABELS: Record<Role, string> = {
  donor: 'Donor',
  ngo: 'NGO',
  admin: 'Admin',
};

export const STATUS_LABELS: Record<DonationStatus, string> = {
  available: 'Available',
  claimed: 'Claimed',
  collected: 'Collected',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export const VERIFICATION_LABELS: Record<NgoVerification, string> = {
  pending: 'Awaiting verification',
  verified: 'Verified',
  rejected: 'Rejected',
};

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  cooked_meal: 'Cooked meal',
  produce: 'Fruit & vegetables',
  bakery: 'Bakery',
  packaged: 'Packaged food',
  dairy: 'Dairy',
};

export const DIETARY_LABELS: Record<DietaryType, string> = {
  veg: 'Veg',
  non_veg: 'Non-veg',
  vegan: 'Vegan',
};

export const UNIT_LABELS: Record<QuantityUnit, string> = {
  servings: 'servings',
  kg: 'kg',
  items: 'items',
};

/** Offered as quick picks on the donation form; donors can still list others. */
export const COMMON_ALLERGENS = [
  'Gluten',
  'Dairy',
  'Nuts',
  'Peanuts',
  'Soy',
  'Egg',
  'Fish',
  'Shellfish',
  'Sesame',
];

/** "12 servings", "1 kg". */
export function formatQuantity(quantity: number, unit: QuantityUnit) {
  return `${quantity} ${unit === 'servings' && quantity === 1 ? 'serving' : UNIT_LABELS[unit]}`;
}

/** Turns a label map into options for selects and radio groups, in the map's order. */
export function optionsFrom<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
