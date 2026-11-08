/**
 * Leaflet icons for objects: the standard Leaflet marker and a custom Jeep symbol.
 * Icons are cached per (symbol, selected, draft) combination.
 */
import L from 'leaflet';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import type { SymbolId } from '../types';

export { markerIconUrl };

/** Side-view jeep drawing used by the custom symbol (also reused in the UI previews). */
export const JEEP_SVG = `
<svg viewBox="0 0 64 38" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="1" y="13" width="5" height="11" rx="2" fill="#1f2937"/>
  <path d="M4 26 V16 Q4 14 6 14 H24 L28 5 H37 L40 14 H56 Q60 14 60 18 V26 Z"
        fill="#4d5d2e" stroke="#1f2610" stroke-width="2" stroke-linejoin="round"/>
  <path d="M29.5 7 H35.5 L37.5 14 H26.5 Z" fill="#bfdbfe" stroke="#1f2610" stroke-width="1.2"/>
  <circle cx="57" cy="19" r="1.8" fill="#fde047"/>
  <path d="M18 17.5 l1.2 2.5 2.7 .3 -2 1.8 .6 2.6 -2.5 -1.4 -2.5 1.4 .6 -2.6 -2 -1.8 2.7 -.3 Z" fill="#f8fafc"/>
  <circle cx="16" cy="28" r="7" fill="#111827"/><circle cx="16" cy="28" r="3" fill="#9ca3af"/>
  <circle cx="48" cy="28" r="7" fill="#111827"/><circle cx="48" cy="28" r="3" fill="#9ca3af"/>
</svg>`;

export interface IconState {
  selected?: boolean;
  draft?: boolean;
}

const cache = new Map<string, L.Icon | L.DivIcon>();

function stateClasses({ selected, draft }: IconState): string {
  return [selected && 'is-selected', draft && 'is-draft'].filter(Boolean).join(' ');
}

function createMarkerIcon(state: IconState): L.Icon {
  return new L.Icon({
    iconUrl: markerIconUrl,
    iconRetinaUrl: markerIconRetinaUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    tooltipAnchor: [12, -28],
    shadowSize: [41, 41],
    className: `object-icon object-icon--marker ${stateClasses(state)}`,
  });
}

function createJeepIcon(state: IconState): L.DivIcon {
  return L.divIcon({
    html: `<div class="jeep-badge">${JEEP_SVG}</div>`,
    iconSize: [46, 34],
    iconAnchor: [23, 17],
    tooltipAnchor: [23, 0],
    className: `object-icon object-icon--jeep ${stateClasses(state)}`,
  });
}

/** Returns the (cached) Leaflet icon for an object symbol in the given state. */
export function getObjectIcon(symbol: SymbolId, state: IconState = {}): L.Icon | L.DivIcon {
  const key = `${symbol}|${Boolean(state.selected)}|${Boolean(state.draft)}`;
  let icon = cache.get(key);
  if (!icon) {
    icon = symbol === 'jeep' ? createJeepIcon(state) : createMarkerIcon(state);
    cache.set(key, icon);
  }
  return icon;
}
