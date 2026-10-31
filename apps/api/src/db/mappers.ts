import type {
  AdminNgo,
  Donation,
  DonationContact,
  DonationEvent,
  Me,
  NearbyDonation,
  NgoDetails,
  QuantityUnit,
} from '@replate/shared';
import type { Database } from './database.types.ts';

// Database rows use snake_case; the API speaks camelCase. These are the only places that translate.

type Tables = Database['public']['Tables'];
type DonationRow = Omit<Tables['donations']['Row'], 'pickup_location'>;
type ProfileRow = Omit<Tables['profiles']['Row'], 'location'>;
type NgoRow = Tables['ngos']['Row'];
type NearbyRow = Database['public']['Functions']['nearby_donations']['Returns'][number];

/** Every donation column except the PostGIS point, which clients don't need (they get lat/lng). */
export const DONATION_COLUMNS =
  'id, donor_id, title, description, category, dietary_type, quantity, quantity_unit, allergens, needs_refrigeration, prepared_at, pickup_from, expires_at, pickup_address, pickup_lat, pickup_lng, pickup_notes, status, claimed_by, claimed_at, collected_at, cancelled_at, created_at, updated_at' as const;

export const PROFILE_COLUMNS =
  'id, role, display_name, phone, address, lat, lng, created_at, updated_at' as const;

/** Drops fields that weren't sent, so a partial update only touches the columns being changed. */
export function definedOnly<T extends object>(
  value: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined)) as {
    [K in keyof T]?: Exclude<T[K], undefined>;
  };
}

export function toDonation(row: DonationRow): Donation {
  return {
    id: row.id,
    donorId: row.donor_id,
    title: row.title,
    description: row.description,
    category: row.category,
    dietaryType: row.dietary_type,
    quantity: row.quantity,
    // Constrained to these values by a CHECK in the schema.
    quantityUnit: row.quantity_unit as QuantityUnit,
    allergens: row.allergens,
    needsRefrigeration: row.needs_refrigeration,
    preparedAt: row.prepared_at,
    pickupFrom: row.pickup_from,
    expiresAt: row.expires_at,
    pickupAddress: row.pickup_address,
    pickupLat: row.pickup_lat,
    pickupLng: row.pickup_lng,
    pickupNotes: row.pickup_notes,
    status: row.status,
    claimedBy: row.claimed_by,
    claimedAt: row.claimed_at,
    collectedAt: row.collected_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toNearbyDonation(row: NearbyRow): NearbyDonation {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    dietaryType: row.dietary_type,
    quantity: row.quantity,
    quantityUnit: row.quantity_unit as QuantityUnit,
    allergens: row.allergens,
    needsRefrigeration: row.needs_refrigeration,
    preparedAt: row.prepared_at,
    pickupFrom: row.pickup_from,
    expiresAt: row.expires_at,
    pickupAddress: row.pickup_address,
    pickupLat: row.pickup_lat,
    pickupLng: row.pickup_lng,
    donorName: row.donor_name,
    distanceKm: Math.round(row.distance_km * 10) / 10,
  };
}

export function toDonationEvent(row: {
  status: DonationEvent['status'];
  actor_id: string | null;
  created_at: string;
}): DonationEvent {
  return { status: row.status, actorId: row.actor_id, createdAt: row.created_at };
}

export function toContact(
  row: Pick<ProfileRow, 'id' | 'display_name' | 'phone' | 'address'>,
): DonationContact {
  return { id: row.id, displayName: row.display_name, phone: row.phone, address: row.address };
}

export function toNgoDetails(row: NgoRow): NgoDetails {
  return {
    registrationNumber: row.registration_number,
    verification: row.verification,
    verifiedAt: row.verified_at,
    serviceRadiusKm: row.service_radius_km,
  };
}

export function toMe(profile: ProfileRow, email: string | null, ngo: NgoRow | null): Me {
  return {
    id: profile.id,
    email,
    role: profile.role,
    displayName: profile.display_name,
    phone: profile.phone,
    address: profile.address,
    lat: profile.lat,
    lng: profile.lng,
    ngo: ngo ? toNgoDetails(ngo) : null,
  };
}

export function toAdminNgo(
  ngo: NgoRow,
  profile: Pick<ProfileRow, 'display_name' | 'phone' | 'address'>,
): AdminNgo {
  return {
    id: ngo.id,
    displayName: profile.display_name,
    phone: profile.phone,
    address: profile.address,
    createdAt: ngo.created_at,
    ...toNgoDetails(ngo),
  };
}
