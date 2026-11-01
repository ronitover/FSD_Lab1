import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { PICKUP_ICON, TILE_ATTRIBUTION, TILE_URL } from './leaflet-setup.ts';

/** A small read-only map with one pin. */
export function LocationMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-forest/15">
      <MapContainer center={[lat, lng]} zoom={15} className="h-60 w-full" scrollWheelZoom={false}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <Marker position={[lat, lng]} icon={PICKUP_ICON} title={label} alt={label} />
      </MapContainer>
    </div>
  );
}
