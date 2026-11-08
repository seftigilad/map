/**
 * Shared types: server DTOs (GeoJSON, positions are [lng, lat]) and client view models
 * (Leaflet-style coordinates, [lat, lng]).
 */

/** A coordinate as used by Leaflet and the UI: [latitude, longitude]. */
export type LatLng = [lat: number, lng: number];

/** A GeoJSON position: [longitude, latitude]. */
export type Position = [lng: number, lat: number];

// ---------- Server DTOs ----------

export interface PointGeometry {
  type: 'Point';
  coordinates: Position;
}

export interface PolygonGeometry {
  type: 'Polygon';
  /** Linear rings; the first is the outer boundary. Each ring is closed. */
  coordinates: Position[][];
}

export type SymbolId = 'marker' | 'jeep';

export interface PolygonDto {
  id: string;
  name: string;
  geometry: PolygonGeometry;
}

export interface MapObjectDto {
  id: string;
  name: string;
  symbol: SymbolId;
  geometry: PointGeometry;
}

/** Request bodies omit the id - the server assigns it. */
export type CreatePolygonRequest = Omit<PolygonDto, 'id'>;
export type CreateMapObjectRequest = Omit<MapObjectDto, 'id'>;

// ---------- View models ----------

export interface MapPolygon {
  id: string;
  name: string;
  /** Open ring of vertices (not closed). */
  latlngs: LatLng[];
  /** False for local drafts that have not been sent to the server yet. */
  saved: boolean;
}

export interface MapObject {
  id: string;
  name: string;
  symbol: SymbolId;
  latlng: LatLng;
  saved: boolean;
}

export type ItemKind = 'polygon' | 'object';

/** The item currently selected on the map / in the table. */
export interface Selection {
  kind: ItemKind;
  id: string;
}

/** Where the map should fly to: a polygon's vertices or an object's position. */
export type FocusTarget = { latlngs: LatLng[] } | { latlng: LatLng };
