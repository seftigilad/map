/**
 * Maps between server DTOs (GeoJSON geometry) and the client view models.
 * View models carry `saved` to distinguish persisted items from local drafts.
 */
import type {
  CreateMapObjectRequest,
  CreatePolygonRequest,
  MapObject,
  MapObjectDto,
  MapPolygon,
  PolygonDto,
} from '../types';
import { fromGeoJsonPoint, fromGeoJsonPolygon, toGeoJsonPoint, toGeoJsonPolygon } from '../utils/geo';

export function polygonFromDto(dto: PolygonDto): MapPolygon {
  return { id: dto.id, name: dto.name, latlngs: fromGeoJsonPolygon(dto.geometry), saved: true };
}

export function polygonToDto(polygon: MapPolygon): CreatePolygonRequest {
  return { name: polygon.name, geometry: toGeoJsonPolygon(polygon.latlngs) };
}

export function objectFromDto(dto: MapObjectDto): MapObject {
  return {
    id: dto.id,
    name: dto.name,
    symbol: dto.symbol,
    latlng: fromGeoJsonPoint(dto.geometry),
    saved: true,
  };
}

export function objectToDto(object: MapObject): CreateMapObjectRequest {
  return { name: object.name, symbol: object.symbol, geometry: toGeoJsonPoint(object.latlng) };
}
