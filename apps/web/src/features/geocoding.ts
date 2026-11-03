import { useQuery } from '@tanstack/react-query';
import type { GeocodeResult } from '@replate/shared';
import { api } from '../lib/api.ts';

/** Address search. Runs only for the submitted term: Nominatim's policy rules out search-as-you-type. */
export function useAddressSearch(term: string) {
  return useQuery({
    queryKey: ['geocode', term],
    queryFn: ({ signal }) =>
      api<GeocodeResult[]>(`/geocode?q=${encodeURIComponent(term)}`, { signal }),
    enabled: term.length >= 3,
    staleTime: Infinity,
  });
}

export function reverseGeocode(lat: number, lng: number) {
  return api<GeocodeResult>(`/geocode/reverse?lat=${lat}&lng=${lng}`);
}
