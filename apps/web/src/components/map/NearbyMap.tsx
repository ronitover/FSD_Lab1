import { useEffect, type ReactNode } from 'react';
import { latLng } from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { groupByPosition } from './groupPoints.ts';
import {
  countPinIcon,
  HOME_ICON,
  PICKUP_ICON,
  TILE_ATTRIBUTION,
  TILE_URL,
} from './leaflet-setup.ts';
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

/**
 * The search area around an NGO, with a pin for each place that has donations.
 * Donations at the same address share one pin with a count, and its popup lists them all.
 */
export function NearbyMap({ origin, radiusKm, points, className = 'h-96' }: NearbyMapProps) {
  const groups = groupByPosition(points);
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
        {groups.map((group) => {
          const [first] = group.points;
          if (!first) return null;
          const many = group.points.length > 1;
          const label = many ? `${group.points.length} donations here` : first.label;
          return (
            <Marker
              key={first.id}
              position={[group.lat, group.lng]}
              icon={many ? countPinIcon(group.points.length) : PICKUP_ICON}
              title={label}
              alt={label}
            >
              <Popup>
                {many ? (
                  <div className="min-w-48">
                    <p className="mb-2 text-xs font-bold tracking-wider text-moss uppercase">
                      {label}
                    </p>
                    <ul className="max-h-56 divide-y divide-forest/10 overflow-y-auto">
                      {group.points.map((point) => (
                        <li key={point.id} className="py-2 first:pt-0 last:pb-0">
                          {point.popup}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  first.popup
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
