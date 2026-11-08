/**
 * REST client for the ASP.NET Core server.
 *
 * Endpoints:
 *   GET    /api/polygons        -> PolygonDto[]
 *   POST   /api/polygons        body: PolygonDto (no id) -> PolygonDto[] (updated collection)
 *   DELETE /api/polygons/{id}   -> 204
 *   DELETE /api/polygons        -> 204 (deletes all)
 *
 *   GET    /api/objects         -> MapObjectDto[]
 *   POST   /api/objects         body: MapObjectDto[] (no ids) -> MapObjectDto[] (updated collection)
 *   DELETE /api/objects/{id}    -> 204
 */
import type { MapApi } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

type HttpMethod = 'GET' | 'POST' | 'DELETE';

async function request<T = void>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the API running?');
  }

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`${method} ${path} failed (${response.status})${details ? `: ${details}` : ''}`);
  }

  const isJson = response.headers.get('content-type')?.includes('json') ?? false;
  return (response.status === 204 || !isJson ? undefined : await response.json()) as T;
}

const idPath = (base: string, id: string) => `${base}/${encodeURIComponent(id)}`;

export const httpApi: MapApi = {
  getPolygons: () => request('/api/polygons'),
  createPolygon: (polygon) => request('/api/polygons', 'POST', polygon),
  deletePolygon: (id) => request(idPath('/api/polygons', id), 'DELETE'),
  deleteAllPolygons: () => request('/api/polygons', 'DELETE'),

  getObjects: () => request('/api/objects'),
  saveObjects: (objects) => request('/api/objects', 'POST', objects),
  deleteObject: (id) => request(idPath('/api/objects', id), 'DELETE'),
};
