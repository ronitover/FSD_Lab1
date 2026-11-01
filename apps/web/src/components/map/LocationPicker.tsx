import type { Marker as LeafletMarker } from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  PICKUP_ICON,
  PIN_ZOOM,
  TILE_ATTRIBUTION,
  TILE_URL,
} from './leaflet-setup.ts';

export interface LatLng {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: LatLng | null;
  onChange: (value: LatLng) => void;
  invalid?: boolean;
}

/** Moves the map to the pin when it is set from outside (an address search or "use my location"). */
function FollowPin({ value }: { value: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (!value) return;
    if (!map.getBounds().contains([value.lat, value.lng]) || map.getZoom() < PIN_ZOOM - 2) {
      map.setView([value.lat, value.lng], Math.max(map.getZoom(), PIN_ZOOM));
    }
  }, [map, value]);
  return null;
}

function ClickToPlace({ onChange }: { onChange: (value: LatLng) => void }) {
  useMapEvents({ click: (event) => onChange({ lat: event.latlng.lat, lng: event.latlng.lng }) });
  return null;
}

/** A map where clicking or dragging the pin sets the location. */
export function LocationPicker({ value, onChange, invalid = false }: LocationPickerProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border ${invalid ? 'border-danger' : 'border-forest/20'}`}
    >
      <MapContainer
        center={value ? [value.lat, value.lng] : DEFAULT_CENTER}
        zoom={value ? PIN_ZOOM : DEFAULT_ZOOM}
        className="h-72 w-full"
        scrollWheelZoom={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <ClickToPlace onChange={onChange} />
        <FollowPin value={value} />
        {value && (
          <Marker
            position={[value.lat, value.lng]}
            icon={PICKUP_ICON}
            draggable
            keyboard={false}
            eventHandlers={{
              dragend: (event) => {
                const { lat, lng } = (event.target as LeafletMarker).getLatLng();
                onChange({ lat, lng });
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
