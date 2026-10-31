import type { GeocodeResult } from '@replate/shared';
import { env } from '../env.ts';
import { HttpError } from '../middleware/errors.ts';

/**
 * Address search through OpenStreetMap's Nominatim.
 * Their public server allows at most one request per second and asks clients to cache,
 * so every lookup here goes through a cache and a one-at-a-time queue.
 * Swapping to a paid provider later means replacing this file only.
 */

const MIN_INTERVAL_MS = 1100;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 1000;
const REQUEST_TIMEOUT_MS = 8000;

const cache = new Map<string, { expires: number; value: unknown }>();
let queue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

function fromCache<T>(key: string): T | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  // Re-insert so the Map's insertion order doubles as least-recently-used order.
  cache.delete(key);
  cache.set(key, hit);
  return hit.value as T;
}

function toCache(key: string, value: unknown) {
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value });
  if (cache.size > CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value!);
}

function throttled<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
    return task();
  });
  // Keep the queue going even when a request fails.
  queue = run.catch(() => undefined);
  return run;
}

async function nominatim<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(path, env.NOMINATIM_URL);
  for (const [key, value] of Object.entries({ format: 'jsonv2', ...params })) {
    url.searchParams.set(key, value);
  }
  const key = url.toString();
  const cached = fromCache<T>(key);
  if (cached !== undefined) return cached;

  const result = await throttled(async () => {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { 'User-Agent': env.NOMINATIM_CONTACT, 'Accept-Language': 'en' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new HttpError(502, 'GEOCODER_UNAVAILABLE', 'Address search is unavailable right now.');
    }
    if (!res.ok) {
      throw new HttpError(502, 'GEOCODER_UNAVAILABLE', 'Address search is unavailable right now.');
    }
    return (await res.json()) as T;
  });
  toCache(key, result);
  return result;
}

interface NominatimPlace {
  display_name: string;
  lat: string;
  lon: string;
}

function toResult(place: NominatimPlace): GeocodeResult {
  return { label: place.display_name, lat: Number(place.lat), lng: Number(place.lon) };
}

export async function searchAddress(q: string): Promise<GeocodeResult[]> {
  const params: Record<string, string> = { q: q.trim().toLowerCase(), limit: '5' };
  if (env.NOMINATIM_COUNTRY_CODES) params.countrycodes = env.NOMINATIM_COUNTRY_CODES;
  const places = await nominatim<NominatimPlace[]>('/search', params);
  return places.map(toResult);
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  // Rounded to ~11 m so nearby lookups share a cache entry.
  const place = await nominatim<NominatimPlace | { error: string }>('/reverse', {
    lat: lat.toFixed(4),
    lon: lng.toFixed(4),
  });
  return 'error' in place ? null : toResult(place);
}
