import type { PathOptions } from 'leaflet';
import type { LatLng, SymbolId } from '../types';

/** Interaction modes of the map. Only one can be active at a time. */
export const MODES = {
  IDLE: 'idle',
  DRAW_POLYGON: 'draw-polygon',
  ADD_OBJECT: 'add-object',
} as const;

export type Mode = (typeof MODES)[keyof typeof MODES];

/** Symbols an object can be rendered with. */
export const SYMBOLS: ReadonlyArray<{ id: SymbolId; label: string }> = [
  { id: 'marker', label: 'Marker' },
  { id: 'jeep', label: 'Jeep' },
];

export const symbolLabel = (id: SymbolId): string => SYMBOLS.find((s) => s.id === id)?.label ?? 'Object';

/** Initial view: Tel Aviv area. */
export const DEFAULT_CENTER: LatLng = [32.0853, 34.7818];
export const DEFAULT_ZOOM = 12;

/** A polygon needs at least this many vertices before it can be closed. */
export const MIN_POLYGON_VERTICES = 3;

/** Distance (px) from the first vertex within which a click closes the polygon. */
export const CLOSE_TOLERANCE_PX = 12;

/** Path styles for polygons in their different states. */
export const POLYGON_STYLES = {
  saved: { color: '#2563eb', weight: 2, fillOpacity: 0.2 },
  draft: { color: '#d97706', weight: 2, dashArray: '6 4', fillOpacity: 0.15 },
  selected: { color: '#dc2626', weight: 4, fillOpacity: 0.3 },
  drawing: { color: '#d97706', weight: 3 },
} satisfies Record<string, PathOptions>;
