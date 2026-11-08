/**
 * Geometry helpers.
 *
 * Inside the client a coordinate is a Leaflet-style tuple: [lat, lng].
 * On the wire (and in MongoDB) geometry is GeoJSON, where positions are [lng, lat]
 * and polygon rings are explicitly closed (first position === last position).
 */
import type { LatLng, PointGeometry, PolygonGeometry, Position } from '../types';

/** Converts an open ring of [lat, lng] vertices into a GeoJSON Polygon. */
export function toGeoJsonPolygon(latlngs: LatLng[]): PolygonGeometry {
  const ring: Position[] = latlngs.map(([lat, lng]) => [lng, lat]);
  const first = ring[0];
  if (first) ring.push([...first]); // GeoJSON rings must be closed
  return { type: 'Polygon', coordinates: [ring] };
}

/** Converts a GeoJSON Polygon (outer ring only) into an open ring of [lat, lng]. */
export function fromGeoJsonPolygon(geometry: PolygonGeometry): LatLng[] {
  const ring = geometry.coordinates[0] ?? [];
  const latlngs: LatLng[] = ring.map(([lng, lat]) => [lat, lng]);
  const first = latlngs[0];
  const last = latlngs[latlngs.length - 1];
  if (latlngs.length > 1 && first && last && first[0] === last[0] && first[1] === last[1]) {
    latlngs.pop(); // drop the closing position - Leaflet closes polygons itself
  }
  return latlngs;
}

/** Converts [lat, lng] into a GeoJSON Point. */
export function toGeoJsonPoint([lat, lng]: LatLng): PointGeometry {
  return { type: 'Point', coordinates: [lng, lat] };
}

/** Converts a GeoJSON Point into [lat, lng]. */
export function fromGeoJsonPoint(geometry: PointGeometry): LatLng {
  const [lng, lat] = geometry.coordinates;
  return [lat, lng];
}

/** Center of a polygon, computed as the average of its vertices. */
export function polygonCenter(latlngs: LatLng[]): LatLng {
  const [latSum, lngSum] = latlngs.reduce<LatLng>(
    (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
    [0, 0],
  );
  return [latSum / latlngs.length, lngSum / latlngs.length];
}

/** Formats a coordinate for display. */
export function formatCoord(value: number): string {
  return value.toFixed(5);
}
