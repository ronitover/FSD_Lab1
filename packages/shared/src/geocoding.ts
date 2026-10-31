import { z } from 'zod';

export const geocodeQuerySchema = z.object({
  q: z.string().trim().min(3, 'Type at least 3 characters to search.').max(200),
});

export const reverseGeocodeQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}
