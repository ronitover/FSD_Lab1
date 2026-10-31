import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { geocodeQuerySchema, reverseGeocodeQuerySchema } from '@replate/shared';
import { authOf } from '../middleware/auth.ts';
import { HttpError } from '../middleware/errors.ts';
import { reverseGeocode, searchAddress } from '../services/nominatim.ts';

export const geocodeRouter = Router();

// Nominatim is shared by everyone using the API, so one user can't use up the capacity.
geocodeRouter.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req) => authOf(req).userId,
  }),
);

geocodeRouter.get('/', async (req, res) => {
  const { q } = geocodeQuerySchema.parse(req.query);
  res.json(await searchAddress(q));
});

geocodeRouter.get('/reverse', async (req, res) => {
  const { lat, lng } = reverseGeocodeQuerySchema.parse(req.query);
  const result = await reverseGeocode(lat, lng);
  if (!result) throw new HttpError(404, 'NOT_FOUND', 'No address found at that location.');
  res.json(result);
});
