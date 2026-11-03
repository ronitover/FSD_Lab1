import { describe, expect, it } from 'vitest';
import { donationCreateSchema, type Donation } from '@replate/shared';
import {
  donationToValues,
  emptyDonationValues,
  valuesToInput,
} from '../src/features/donations/formValues.ts';
import { formatRelative, fromLocalInput, toLocalInput } from '../src/lib/dates.ts';

const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
inOneHour.setSeconds(0, 0);

const donation: Donation = {
  id: '6c1d1f8e-8f2a-4a8e-9a53-0d0c1c7b1a11',
  donorId: '0b9f7c1e-2f5a-4c1e-8d7b-3a2e1f0c9d88',
  title: 'Veg biryani',
  description: null,
  category: 'cooked_meal',
  dietaryType: 'veg',
  quantity: 20,
  quantityUnit: 'servings',
  allergens: ['Nuts'],
  needsRefrigeration: false,
  preparedAt: null,
  pickupFrom: '2026-11-01T06:30:00.000Z',
  expiresAt: inOneHour.toISOString(),
  pickupAddress: '12 MG Road, Bengaluru',
  pickupLat: 12.9756,
  pickupLng: 77.6066,
  pickupNotes: null,
  status: 'available',
  claimedBy: null,
  claimedAt: null,
  collectedAt: null,
  cancelledAt: null,
  createdAt: '2026-11-01T06:30:00.000Z',
  updatedAt: '2026-11-01T06:30:00.000Z',
};

describe('date inputs', () => {
  it('round-trips a timestamp through a datetime-local value', () => {
    expect(fromLocalInput(toLocalInput(inOneHour.toISOString()))).toBe(inOneHour.toISOString());
  });

  it('treats blank inputs as missing', () => {
    expect(toLocalInput(null)).toBe('');
    expect(fromLocalInput('')).toBeUndefined();
  });

  it('describes times relative to now', () => {
    const now = Date.parse('2026-11-01T12:00:00Z');
    expect(formatRelative('2026-11-01T15:00:00Z', now)).toBe('in 3 hours');
    expect(formatRelative('2026-10-30T12:00:00Z', now)).toBe('2 days ago');
  });
});

describe('donation form values', () => {
  it('turns a stored donation back into the same input', () => {
    const input = valuesToInput(donationToValues(donation));
    expect(donationCreateSchema.parse(input)).toMatchObject({
      title: 'Veg biryani',
      quantity: 20,
      expiresAt: donation.expiresAt,
      pickupLat: donation.pickupLat,
      allergens: ['Nuts'],
      description: null,
    });
  });

  it('leaves unchosen fields out, so validation names each one', () => {
    const result = donationCreateSchema.safeParse(valuesToInput(emptyDonationValues()));
    expect(result.success).toBe(false);
    const messages = Object.fromEntries(
      result.error!.issues.map((issue) => [issue.path[0], issue.message]),
    );
    expect(messages).toMatchObject({
      category: 'Choose a category.',
      dietaryType: 'Choose veg, non-veg or vegan.',
      quantity: 'Enter how much food there is.',
      expiresAt: 'Choose when the food should be collected by.',
      pickupLat: 'Mark the pickup location on the map.',
    });
  });

  it("starts from the donor's saved address", () => {
    const values = emptyDonationValues({ address: 'Home', lat: 1, lng: 2 });
    expect(values).toMatchObject({ pickupAddress: 'Home', pickupLat: 1, pickupLng: 2 });
  });
});
