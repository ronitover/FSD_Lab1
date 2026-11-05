import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { PICKUP_ICON, TILE_ATTRIBUTION, TILE_URL } from './leaflet-setup.ts';

/** A small read-only map with one pin. */
export function LocationMap({
  lat,
  lng,
  label,
  className = 'h-60',
}: {
  lat: number;
  lng: number;
  label: string;
  /** Height of the map, e.g. "h-40". */
  className?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-forest/15">
      {/* Keyed on the position: the map only reads its centre when it first mounts. */}
      <MapContainer
        key={`${lat},${lng}`}
        center={[lat, lng]}
        zoom={15}
        className={`${className} w-full`}
        scrollWheelZoom={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <Marker position={[lat, lng]} icon={PICKUP_ICON} title={label} alt={label} />
      </MapContainer>
    </div>
  );
}
