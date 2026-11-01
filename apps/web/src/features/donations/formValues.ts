import type {
  DietaryType,
  Donation,
  DonationCreateInput,
  FoodCategory,
  QuantityUnit,
} from '@replate/shared';
import { fromLocalInput, localInputFromNow, toLocalInput } from '../../lib/dates.ts';

/** What the inputs hold: text for text boxes, and '' for "nothing chosen yet". */
export interface DonationFormValues {
  title: string;
  description: string;
  category: FoodCategory | '';
  dietaryType: DietaryType | '';
  quantity: string;
  quantityUnit: QuantityUnit;
  allergens: string[];
  needsRefrigeration: boolean;
  preparedAt: string;
  pickupFrom: string;
  expiresAt: string;
  pickupAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  pickupNotes: string;
}

export function emptyDonationValues(defaults?: {
  address: string | null;
  lat: number | null;
  lng: number | null;
}): DonationFormValues {
  return {
    title: '',
    description: '',
    category: '',
    dietaryType: '',
    quantity: '',
    quantityUnit: 'servings',
    allergens: [],
    needsRefrigeration: false,
    preparedAt: '',
    pickupFrom: localInputFromNow(),
    expiresAt: '',
    // Start from the donor's saved address, if they have one.
    pickupAddress: defaults?.address ?? '',
    pickupLat: defaults?.lat ?? null,
    pickupLng: defaults?.lng ?? null,
    pickupNotes: '',
  };
}

export function donationToValues(donation: Donation): DonationFormValues {
  return {
    title: donation.title,
    description: donation.description ?? '',
    category: donation.category,
    dietaryType: donation.dietaryType,
    quantity: String(donation.quantity),
    quantityUnit: donation.quantityUnit,
    allergens: donation.allergens,
    needsRefrigeration: donation.needsRefrigeration,
    preparedAt: toLocalInput(donation.preparedAt),
    pickupFrom: toLocalInput(donation.pickupFrom),
    expiresAt: toLocalInput(donation.expiresAt),
    pickupAddress: donation.pickupAddress,
    pickupLat: donation.pickupLat,
    pickupLng: donation.pickupLng,
    pickupNotes: donation.pickupNotes ?? '',
  };
}

/** Converts the inputs to the API's shape. Blank or unchosen fields are left out for validation to flag. */
export function valuesToInput(values: DonationFormValues): Partial<DonationCreateInput> {
  return {
    title: values.title,
    description: values.description,
    category: values.category || undefined,
    dietaryType: values.dietaryType || undefined,
    quantity: values.quantity === '' ? undefined : Number(values.quantity),
    quantityUnit: values.quantityUnit,
    allergens: values.allergens,
    needsRefrigeration: values.needsRefrigeration,
    preparedAt: fromLocalInput(values.preparedAt) ?? null,
    pickupFrom: fromLocalInput(values.pickupFrom),
    expiresAt: fromLocalInput(values.expiresAt),
    pickupAddress: values.pickupAddress,
    pickupLat: values.pickupLat ?? undefined,
    pickupLng: values.pickupLng ?? undefined,
    pickupNotes: values.pickupNotes,
  };
}
