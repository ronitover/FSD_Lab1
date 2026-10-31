import { Router, type Request } from 'express';
import { ngoSettingsUpdateSchema, profileUpdateSchema } from '@replate/shared';
import { unwrap } from '../db/errors.ts';
import { definedOnly, PROFILE_COLUMNS, toMe } from '../db/mappers.ts';
import { authOf, requireRole } from '../middleware/auth.ts';

export const meRouter = Router();

async function loadMe(req: Request) {
  const { db, userId, email, role } = authOf(req);
  const profile = unwrap(
    await db.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).single(),
  );
  const ngo =
    role === 'ngo' ? unwrap(await db.from('ngos').select('*').eq('id', userId).single()) : null;
  return toMe(profile, email, ngo);
}

meRouter.get('/', async (req, res) => {
  res.json(await loadMe(req));
});

meRouter.patch('/', async (req, res) => {
  const { db, userId } = authOf(req);
  const input = profileUpdateSchema.parse(req.body);
  const columns = definedOnly({
    display_name: input.displayName,
    phone: input.phone,
    address: input.address,
    lat: input.lat,
    lng: input.lng,
  });
  unwrap(await db.from('profiles').update(columns).eq('id', userId).select('id').single());
  res.json(await loadMe(req));
});

meRouter.patch('/ngo', requireRole('ngo'), async (req, res) => {
  const { db, userId } = authOf(req);
  const { serviceRadiusKm } = ngoSettingsUpdateSchema.parse(req.body);
  unwrap(
    await db
      .from('ngos')
      .update({ service_radius_km: serviceRadiusKm })
      .eq('id', userId)
      .select('id')
      .single(),
  );
  res.json(await loadMe(req));
});
