import { describe, expect, it } from 'vitest';
import {
  donationCreateSchema,
  donationUpdateSchema,
  MAX_EXPIRY_DAYS,
  myDonationsQuerySchema,
  nearbyQuerySchema,
} from '../src/donations.ts';

const hours = (n: number) => new Date(Date.now() + n * 60 * 60 * 1000).toISOString();

const valid = {
  title: 'Vegetable biryani',
  category: 'cooked_meal',
  dietaryType: 'veg',
  quantity: 20,
  expiresAt: hours(3),
  pickupAddress: 'MG Road, Bengaluru',
  pickupLat: 12.9756,
  pickupLng: 77.6066,
};

function issuesFor(result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) {
  return result.error?.issues.map((issue) => issue.path.join('.')) ?? [];
}

describe('donationCreateSchema', () => {
  it('accepts a minimal donation and fills in defaults', () => {
    const parsed = donationCreateSchema.parse(valid);
    expect(parsed.quantityUnit).toBe('servings');
    expect(parsed.allergens).toEqual([]);
    expect(parsed.needsRefrigeration).toBe(false);
  });

  it('trims text and turns blank optional text into null', () => {
    const parsed = donationCreateSchema.parse({ ...valid, title: '  Rice  ', description: '   ' });
    expect(parsed.title).toBe('Rice');
    expect(parsed.description).toBeNull();
  });

  it.each([
    ['title', { title: 'ab' }],
    ['category', { category: 'pizza' }],
    ['dietaryType', { dietaryType: 'keto' }],
    ['quantity', { quantity: 0 }],
    ['quantity', { quantity: 2.5 }],
    ['pickupAddress', { pickupAddress: 'x' }],
    ['pickupLat', { pickupLat: 91 }],
    ['expiresAt', { expiresAt: 'tomorrow' }],
  ])('rejects a bad %s', (field, change) => {
    const result = donationCreateSchema.safeParse({ ...valid, ...change });
    expect(issuesFor(result)).toContain(field);
  });

  it('rejects an expiry in the past', () => {
    expect(issuesFor(donationCreateSchema.safeParse({ ...valid, expiresAt: hours(-1) }))).toContain(
      'expiresAt',
    );
  });

  it(`rejects an expiry more than ${MAX_EXPIRY_DAYS} days away`, () => {
    const result = donationCreateSchema.safeParse({
      ...valid,
      expiresAt: hours(MAX_EXPIRY_DAYS * 24 + 1),
    });
    expect(issuesFor(result)).toContain('expiresAt');
  });

  it('rejects an expiry before the pickup start', () => {
    const result = donationCreateSchema.safeParse({
      ...valid,
      pickupFrom: hours(5),
      expiresAt: hours(3),
    });
    expect(issuesFor(result)).toContain('expiresAt');
  });

  it('rejects a preparation time in the future', () => {
    const result = donationCreateSchema.safeParse({ ...valid, preparedAt: hours(1) });
    expect(issuesFor(result)).toContain('preparedAt');
  });
});

describe('donationUpdateSchema', () => {
  it('accepts a single changed field without adding defaults', () => {
    expect(donationUpdateSchema.parse({ quantity: 5 })).toEqual({ quantity: 5 });
  });

  it('rejects an empty update', () => {
    expect(donationUpdateSchema.safeParse({}).success).toBe(false);
  });

  it('still checks the expiry when it is changed', () => {
    expect(donationUpdateSchema.safeParse({ expiresAt: hours(-1) }).success).toBe(false);
  });
});

describe('query schemas', () => {
  it('coerces numbers from the query string', () => {
    expect(nearbyQuerySchema.parse({ lat: '12.97', lng: '77.6', radiusKm: '5' })).toMatchObject({
      lat: 12.97,
      lng: 77.6,
      radiusKm: 5,
    });
  });

  it('treats a blank search as no search', () => {
    expect(myDonationsQuerySchema.parse({ q: '   ' }).q).toBeUndefined();
  });

  it('rejects an unknown status filter', () => {
    expect(myDonationsQuerySchema.safeParse({ status: 'lost' }).success).toBe(false);
  });
});
