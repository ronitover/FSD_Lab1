import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/** Roughly the centre of India, where RePlate operates first. Used when there's no pin yet. */
export const DEFAULT_CENTER: L.LatLngTuple = [20.5937, 78.9629];
export const DEFAULT_ZOOM = 5;
export const PIN_ZOOM = 16;

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// An SVG pin in the RePlate colours. Leaflet's default icon relies on image paths that bundlers break.
const pinSvg = (fill: string) =>
  `<svg viewBox="0 0 32 42" width="32" height="42" aria-hidden="true"><path d="M16 1C7.7 1 1 7.6 1 15.8 1 27 16 41 16 41s15-14 15-25.2C31 7.6 24.3 1 16 1Z" fill="${fill}" stroke="#fff" stroke-width="2"/><circle cx="16" cy="15.5" r="5.5" fill="#fff"/></svg>`;

function pinIcon(fill: string) {
  return L.divIcon({
    html: pinSvg(fill),
    className: 'replate-pin',
    iconSize: [32, 42],
    iconAnchor: [16, 41],
    popupAnchor: [0, -36],
  });
}

export const PICKUP_ICON = pinIcon('#e8894f');
export const HOME_ICON = pinIcon('#173b2a');
