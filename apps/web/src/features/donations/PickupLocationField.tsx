import { useState } from 'react';
import { LocationPicker, type LatLng } from '../../components/map/LocationPicker.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Alert } from '../../components/ui/Feedback.tsx';
import { TextField } from '../../components/ui/FormField.tsx';
import { errorMessage } from '../../lib/api.ts';
import { reverseGeocode, useAddressSearch } from '../geocoding.ts';

const MAX_ADDRESS_LENGTH = 300;

interface PickupLocationFieldProps {
  address: string;
  location: LatLng | null;
  onAddressChange: (address: string) => void;
  onLocationChange: (location: LatLng) => void;
  addressError?: string;
  locationError?: string;
}

/**
 * The pickup address and its pin. The address is free text the NGO will read; the pin is what
 * distance search uses. Searching fills both, and the pin can then be dragged to the exact spot.
 */
export function PickupLocationField({
  address,
  location,
  onAddressChange,
  onLocationChange,
  addressError,
  locationError,
}: PickupLocationFieldProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const search = useAddressSearch(searchTerm);

  function findAddress() {
    setLocateError(null);
    setSearchTerm(address.trim());
    setShowResults(true);
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setLocateError('This browser cannot share its location. Search for the address instead.');
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const here = { lat: position.coords.latitude, lng: position.coords.longitude };
        onLocationChange(here);
        try {
          const result = await reverseGeocode(here.lat, here.lng);
          onAddressChange(result.label.slice(0, MAX_ADDRESS_LENGTH));
        } catch {
          // The pin is set; the donor can still type the address themselves.
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        setLocateError(
          error.code === error.PERMISSION_DENIED
            ? 'Location access was blocked. Search for the address instead.'
            : 'Could not find your location. Search for the address instead.',
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  const results = search.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <TextField
          className="flex-1"
          label="Pickup address"
          autoComplete="street-address"
          value={address}
          onChange={onAddressChange}
          onKeyDown={(event) => {
            // Enter searches instead of submitting the whole form.
            if (event.key === 'Enter') {
              event.preventDefault();
              if (address.trim().length >= 3) findAddress();
            }
          }}
          error={addressError}
          hint="Type the address, then find it on the map."
          maxLength={MAX_ADDRESS_LENGTH}
          required
        />
        <Button
          variant="secondary"
          className="sm:mt-7"
          onClick={findAddress}
          disabled={address.trim().length < 3}
          loading={search.isFetching}
        >
          Find on map
        </Button>
      </div>

      {showResults && searchTerm && !search.isFetching && (
        <div aria-live="polite">
          {search.isError ? (
            <Alert>{errorMessage(search.error)}</Alert>
          ) : results.length === 0 ? (
            <Alert tone="info">
              No matches. Try adding the area or city, or place the pin on the map yourself.
            </Alert>
          ) : (
            <ul className="divide-y divide-forest/10 overflow-hidden rounded-2xl border border-forest/15 bg-surface">
              {results.map((result) => (
                <li key={`${result.lat},${result.lng}`}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm text-forest hover:bg-forest/5"
                    onClick={() => {
                      onAddressChange(result.label.slice(0, MAX_ADDRESS_LENGTH));
                      onLocationChange({ lat: result.lat, lng: result.lng });
                      setShowResults(false);
                    }}
                  >
                    {result.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-forest/60">
          {location
            ? 'Drag the pin or click the map to adjust.'
            : 'Or click the map to drop a pin.'}
        </p>
        <Button variant="ghost" size="sm" onClick={useMyLocation} loading={locating}>
          Use my current location
        </Button>
      </div>
      {locateError && <Alert tone="info">{locateError}</Alert>}

      <LocationPicker
        value={location}
        onChange={onLocationChange}
        invalid={Boolean(locationError)}
      />
      {locationError && <p className="text-xs font-medium text-danger">{locationError}</p>}
    </div>
  );
}
