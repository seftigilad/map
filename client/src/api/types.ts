import type { CreateMapObjectRequest, CreatePolygonRequest, MapObjectDto, PolygonDto } from '../types';

/**
 * The REST API contract. Implemented by the real HTTP client and by the in-browser mock.
 * Save operations resolve to the full, updated collection.
 */
export interface MapApi {
  getPolygons(): Promise<PolygonDto[]>;
  createPolygon(polygon: CreatePolygonRequest): Promise<PolygonDto[]>;
  deletePolygon(id: string): Promise<void>;
  deleteAllPolygons(): Promise<void>;

  getObjects(): Promise<MapObjectDto[]>;
  saveObjects(objects: CreateMapObjectRequest[]): Promise<MapObjectDto[]>;
  deleteObject(id: string): Promise<void>;
}
