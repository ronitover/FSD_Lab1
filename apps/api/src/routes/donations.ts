import { Router, type Request } from 'express';
import { z } from 'zod';
import {
  claimedDonationsQuerySchema,
  donationCreateSchema,
  donationUpdateSchema,
  myDonationsQuerySchema,
  nearbyQuerySchema,
  type DonationDetail,
} from '@replate/shared';
import type { Database } from '../db/database.types.ts';
import { unwrap } from '../db/errors.ts';
import {
  definedOnly,
  DONATION_COLUMNS,
  toContact,
  toDonation,
  toDonationEvent,
  toNearbyDonation,
} from '../db/mappers.ts';
import { authOf, requireRole } from '../middleware/auth.ts';
import { HttpError } from '../middleware/errors.ts';

export const donationsRouter = Router();

const idParam = z.object({ id: z.uuid('Not a valid donation id.') });

const isDonor = requireRole('donor');
const isNgo = requireRole('ngo');

type DonationWrite = z.output<typeof donationCreateSchema>;
type DonationTable = Database['public']['Tables']['donations'];

/** Maps validated API fields to database columns, skipping fields that weren't sent. */
function toColumns(input: Partial<DonationWrite>): DonationTable['Update'] {
  return definedOnly({
    title: input.title,
    description: input.description,
    category: input.category,
    dietary_type: input.dietaryType,
    quantity: input.quantity,
    quantity_unit: input.quantityUnit,
    allergens: input.allergens,
    needs_refrigeration: input.needsRefrigeration,
    prepared_at: input.preparedAt,
    pickup_from: input.pickupFrom,
    expires_at: input.expiresAt,
    pickup_address: input.pickupAddress,
    pickup_lat: input.pickupLat,
    pickup_lng: input.pickupLng,
    pickup_notes: input.pickupNotes,
  });
}

function toInsert(input: DonationWrite, donorId: string): DonationTable['Insert'] {
  // The create schema requires every NOT NULL column, so the mapped columns are complete.
  return { ...(toColumns(input) as DonationTable['Insert']), donor_id: donorId };
}

// Search text is reduced to letters, numbers and simple punctuation before it reaches the
// PostgREST filter syntax, where commas, dots and parentheses have meaning.
function searchPattern(q: string) {
  const term = q
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return term ? `"*${term}*"` : null;
}

/** Explains why a donor's change matched no rows: it doesn't exist (for them) or it's past editing. */
async function explainNoMatch(req: Request, id: string, action: string): Promise<never> {
  const { db } = authOf(req);
  const existing = unwrap(await db.from('donations').select('status').eq('id', id).maybeSingle());
  if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Donation not found.');
  throw new HttpError(409, 'CONFLICT', `A ${existing.status} donation can't be ${action}.`);
}

// Create
donationsRouter.post('/', isDonor, async (req, res) => {
  const { db, userId } = authOf(req);
  const input = donationCreateSchema.parse(req.body);
  const row = unwrap(
    await db.from('donations').insert(toInsert(input, userId)).select(DONATION_COLUMNS).single(),
  );
  res.status(201).location(`/api/donations/${row.id}`).json(toDonation(row));
});

// Read: the donor's own donations, newest first, with optional search and status filter.
donationsRouter.get('/mine', isDonor, async (req, res) => {
  const { db, userId } = authOf(req);
  const { q, status } = myDonationsQuerySchema.parse(req.query);

  let query = db
    .from('donations')
    .select(DONATION_COLUMNS)
    .eq('donor_id', userId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (status) query = query.eq('status', status);
  const pattern = q ? searchPattern(q) : null;
  if (pattern) {
    query = query.or(
      `title.ilike.${pattern},description.ilike.${pattern},pickup_address.ilike.${pattern}`,
    );
  }

  res.json(unwrap(await query).map(toDonation));
});

// Read: an NGO's pickups (donations it has claimed), most recent claim first.
donationsRouter.get('/claimed', isNgo, async (req, res) => {
  const { db, userId } = authOf(req);
  const { status } = claimedDonationsQuerySchema.parse(req.query);

  let query = db
    .from('donations')
    .select(DONATION_COLUMNS)
    .eq('claimed_by', userId)
    .order('claimed_at', { ascending: false })
    .limit(200);
  if (status) query = query.eq('status', status);

  res.json(unwrap(await query).map(toDonation));
});

// Read: open donations near a point, for NGOs browsing. Search and filters run in the database.
donationsRouter.get('/nearby', isNgo, async (req, res) => {
  const { db } = authOf(req);
  const query = nearbyQuerySchema.parse(req.query);
  const rows = unwrap(
    await db.rpc('nearby_donations', {
      p_lat: query.lat,
      p_lng: query.lng,
      p_radius_km: query.radiusKm,
      p_search: query.q,
      p_category: query.category,
      p_dietary_type: query.dietaryType,
      p_limit: query.limit,
    }),
  );
  res.json(rows.map(toNearbyDonation));
});

// Read: one donation with its status history and, once claimed, the other party's contact details.
donationsRouter.get('/:id', async (req, res) => {
  const { db, userId } = authOf(req);
  const { id } = idParam.parse(req.params);

  const row = unwrap(
    await db.from('donations').select(DONATION_COLUMNS).eq('id', id).maybeSingle(),
  );
  if (!row) throw new HttpError(404, 'NOT_FOUND', 'Donation not found.');

  const events = unwrap(
    await db
      .from('donation_events')
      .select('status, actor_id, created_at')
      .eq('donation_id', id)
      .order('id'),
  );

  // Row Level Security decides whether the contact is visible; it is only once the donation is claimed.
  const counterpartId = row.donor_id === userId ? row.claimed_by : row.donor_id;
  const contact = counterpartId
    ? unwrap(
        await db
          .from('profiles')
          .select('id, display_name, phone, address')
          .eq('id', counterpartId)
          .maybeSingle(),
      )
    : null;

  const detail: DonationDetail = {
    ...toDonation(row),
    events: events.map(toDonationEvent),
    contact: contact ? toContact(contact) : null,
  };
  res.json(detail);
});

// Update: donors edit their own donation while it is still available.
donationsRouter.patch('/:id', isDonor, async (req, res) => {
  const { db } = authOf(req);
  const { id } = idParam.parse(req.params);
  const input = donationUpdateSchema.parse(req.body);

  const rows = unwrap(
    await db.from('donations').update(toColumns(input)).eq('id', id).select(DONATION_COLUMNS),
  );
  const row = rows[0];
  if (!row) return explainNoMatch(req, id, 'edited');
  res.json(toDonation(row));
});

// Delete: donors remove a donation that was never claimed (or was cancelled or expired).
donationsRouter.delete('/:id', isDonor, async (req, res) => {
  const { db } = authOf(req);
  const { id } = idParam.parse(req.params);

  const rows = unwrap(await db.from('donations').delete().eq('id', id).select('id'));
  if (rows.length === 0) return explainNoMatch(req, id, 'deleted');
  res.status(204).end();
});

// Status changes. Each is a single database function that checks the caller and the current status.
const STATUS_ACTIONS = {
  cancel: { fn: 'cancel_donation', guard: isDonor },
  claim: { fn: 'claim_donation', guard: isNgo },
  release: { fn: 'release_claim', guard: isNgo },
  collect: { fn: 'mark_collected', guard: isNgo },
} as const;

for (const [action, { fn, guard }] of Object.entries(STATUS_ACTIONS)) {
  donationsRouter.post(`/:id/${action}`, guard, async (req, res) => {
    const { db } = authOf(req);
    const { id } = idParam.parse(req.params);
    const row = unwrap(await db.rpc(fn, { p_donation_id: id }));
    res.json(toDonation(row));
  });
}
