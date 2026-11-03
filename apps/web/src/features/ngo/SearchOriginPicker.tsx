import { useState, type FormEvent } from 'react';
import type { LatLng } from '../../components/map/LocationPicker.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Alert } from '../../components/ui/Feedback.tsx';
import { inputClasses } from '../../components/ui/styles.ts';
import { errorMessage } from '../../lib/api.ts';
import { reverseGeocode, useAddressSearch } from '../geocoding.ts';

export interface SearchOrigin extends LatLng {
  label: string;
}

interface SearchOriginPickerProps {
  onPick: (origin: SearchOrigin) => void;
  onCancel?: () => void;
}

/** Choose where to search from: the device's location, or an address. */
export function SearchOriginPicker({ onPick, onCancel }: SearchOriginPickerProps) {
  const [text, setText] = useState('');
  const [term, setTerm] = useState('');
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const search = useAddressSearch(term);

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setLocateError('This browser cannot share its location. Search for an address instead.');
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const here = { lat: coords.latitude, lng: coords.longitude };
        const label = await reverseGeocode(here.lat, here.lng)
          .then((result) => result.label)
          .catch(() => 'Your current location');
        setLocating(false);
        onPick({ ...here, label });
      },
      (error) => {
        setLocating(false);
        setLocateError(
          error.code === error.PERMISSION_DENIED
            ? 'Location access was blocked. Search for an address instead.'
            : 'Could not find your location. Search for an address instead.',
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTerm(text.trim());
  }

  const results = search.data ?? [];

  return (
    <div className="space-y-4">
      <Button onClick={useMyLocation} loading={locating}>
        Use my current location
      </Button>
      {locateError && <Alert tone="info">{locateError}</Alert>}

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          aria-label="Search from an address"
          placeholder="Or search an address or area"
          className={inputClasses}
          value={text}
          maxLength={200}
          onChange={(event) => setText(event.target.value)}
        />
        <Button
          type="submit"
          variant="secondary"
          disabled={text.trim().length < 3}
          loading={search.isFetching}
        >
          Search
        </Button>
      </form>

      {term && !search.isFetching && (
        <div aria-live="polite">
          {search.isError ? (
            <Alert>{errorMessage(search.error)}</Alert>
          ) : results.length === 0 ? (
            <Alert tone="info">No matches. Try adding the area or city.</Alert>
          ) : (
            <ul className="divide-y divide-forest/10 overflow-hidden rounded-2xl border border-forest/15 bg-surface">
              {results.map((result) => (
                <li key={`${result.lat},${result.lng}`}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm text-forest hover:bg-forest/5"
                    onClick={() => onPick(result)}
                  >
                    {result.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {onCancel && (
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Keep the current location
        </Button>
      )}
    </div>
  );
}
