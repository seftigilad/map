/**
 * Maps between server DTOs (GeoJSON geometry) and the client view models.
 *
 * PolygonDto: { id, name, geometry: { type: 'Polygon', coordinates: [[[lng, lat], ...]] } }
 * ObjectDto:  { id, name, symbol: 'marker' | 'jeep', geometry: { type: 'Point', coordinates: [lng, lat] } }
 *
 * View models carry `saved` to distinguish persisted items from local drafts.
 */
import { fromGeoJsonPoint, fromGeoJsonPolygon, toGeoJsonPoint, toGeoJsonPolygon } from '../utils/geo';

export function polygonFromDto(dto) {
  return { id: dto.id, name: dto.name, latlngs: fromGeoJsonPolygon(dto.geometry), saved: true };
}

export function polygonToDto(polygon) {
  return { name: polygon.name, geometry: toGeoJsonPolygon(polygon.latlngs) };
}

export function objectFromDto(dto) {
  return {
    id: dto.id,
    name: dto.name,
    symbol: dto.symbol,
    latlng: fromGeoJsonPoint(dto.geometry),
    saved: true,
  };
}

export function objectToDto(object) {
  return { name: object.name, symbol: object.symbol, geometry: toGeoJsonPoint(object.latlng) };
}
