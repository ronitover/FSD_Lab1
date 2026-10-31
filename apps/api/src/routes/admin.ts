import { Router } from 'express';
import { z } from 'zod';
import { adminNgosQuerySchema, ngoVerificationUpdateSchema } from '@replate/shared';
import { unwrap } from '../db/errors.ts';
import { toAdminNgo } from '../db/mappers.ts';
import { authOf, requireRole } from '../middleware/auth.ts';
import { HttpError } from '../middleware/errors.ts';

export const adminRouter = Router();

adminRouter.use(requireRole('admin'));

const NGO_WITH_PROFILE = '*, profiles!inner(display_name, phone, address)' as const;

// NGOs waiting for review come first, oldest first, so none sit in the queue unnoticed.
adminRouter.get('/ngos', async (req, res) => {
  const { db } = authOf(req);
  const { verification } = adminNgosQuerySchema.parse(req.query);

  let query = db.from('ngos').select(NGO_WITH_PROFILE).order('created_at').limit(200);
  if (verification) query = query.eq('verification', verification);

  res.json(unwrap(await query).map(({ profiles, ...ngo }) => toAdminNgo(ngo, profiles)));
});

adminRouter.post('/ngos/:id/verification', async (req, res) => {
  const { db } = authOf(req);
  const { id } = z.object({ id: z.uuid('Not a valid NGO id.') }).parse(req.params);
  const { verification } = ngoVerificationUpdateSchema.parse(req.body);

  unwrap(await db.rpc('set_ngo_verification', { p_ngo_id: id, p_verification: verification }));
  const row = unwrap(await db.from('ngos').select(NGO_WITH_PROFILE).eq('id', id).maybeSingle());
  if (!row) throw new HttpError(404, 'NOT_FOUND', 'NGO not found.');
  const { profiles, ...ngo } = row;
  res.json(toAdminNgo(ngo, profiles));
});
