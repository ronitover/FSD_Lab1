import { useEffect, type ReactNode } from 'react';
import { latLng } from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { HOME_ICON, PICKUP_ICON, TILE_ATTRIBUTION, TILE_URL } from './leaflet-setup.ts';
import type { LatLng } from './LocationPicker.tsx';

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  /** Shown in the pin's popup. */
  popup: ReactNode;
  label: string;
}

interface NearbyMapProps {
  origin: LatLng;
  radiusKm: number;
  points: MapPoint[];
  className?: string;
}

/** Zooms to fit the search circle whenever the origin or radius changes. */
function FitRadius({ origin, radiusKm }: { origin: LatLng; radiusKm: number }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(latLng(origin.lat, origin.lng).toBounds(radiusKm * 2000), { padding: [16, 16] });
  }, [map, origin.lat, origin.lng, radiusKm]);
  return null;
}

/** The search area around an NGO, with a pin for each donation in it. */
export function NearbyMap({ origin, radiusKm, points, className = 'h-96' }: NearbyMapProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-forest/15">
      <MapContainer
        center={[origin.lat, origin.lng]}
        zoom={12}
        className={`w-full ${className}`}
        scrollWheelZoom={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <FitRadius origin={origin} radiusKm={radiusKm} />
        <Circle
          center={[origin.lat, origin.lng]}
          radius={radiusKm * 1000}
          pathOptions={{ color: '#496a4c', weight: 1.5, fillOpacity: 0.06 }}
        />
        <Marker
          position={[origin.lat, origin.lng]}
          icon={HOME_ICON}
          title="Searching from here"
          alt="Searching from here"
        />
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={PICKUP_ICON}
            title={point.label}
            alt={point.label}
          >
            <Popup>{point.popup}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
