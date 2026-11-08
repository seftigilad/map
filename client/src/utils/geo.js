/**
 * Geometry helpers.
 *
 * Inside the client a coordinate is a Leaflet-style tuple: [lat, lng].
 * On the wire (and in MongoDB) geometry is GeoJSON, where positions are [lng, lat]
 * and polygon rings are explicitly closed (first position === last position).
 */

/** @typedef {[number, number]} LatLng */

/** Converts an open ring of [lat, lng] vertices into a GeoJSON Polygon. */
export function toGeoJsonPolygon(latlngs) {
  const ring = latlngs.map(([lat, lng]) => [lng, lat]);
  ring.push([...ring[0]]); // GeoJSON rings must be closed
  return { type: 'Polygon', coordinates: [ring] };
}

/** Converts a GeoJSON Polygon (outer ring only) into an open ring of [lat, lng]. */
export function fromGeoJsonPolygon(geometry) {
  const ring = geometry?.coordinates?.[0] ?? [];
  const latlngs = ring.map(([lng, lat]) => [lat, lng]);
  const first = latlngs[0];
  const last = latlngs[latlngs.length - 1];
  if (latlngs.length > 1 && first[0] === last[0] && first[1] === last[1]) {
    latlngs.pop(); // drop the closing position - Leaflet closes polygons itself
  }
  return latlngs;
}

/** Converts [lat, lng] into a GeoJSON Point. */
export function toGeoJsonPoint([lat, lng]) {
  return { type: 'Point', coordinates: [lng, lat] };
}

/** Converts a GeoJSON Point into [lat, lng]. */
export function fromGeoJsonPoint(geometry) {
  const [lng, lat] = geometry.coordinates;
  return [lat, lng];
}

/** Center of a polygon, computed as the average of its vertices. */
export function polygonCenter(latlngs) {
  const sum = latlngs.reduce((acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng], [0, 0]);
  return [sum[0] / latlngs.length, sum[1] / latlngs.length];
}

/** Formats a coordinate for display. */
export function formatCoord(value) {
  return Number(value).toFixed(5);
}
