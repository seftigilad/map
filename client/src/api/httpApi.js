/**
 * REST client for the ASP.NET Core server.
 *
 * Endpoints:
 *   GET    /api/polygons        -> PolygonDto[]
 *   POST   /api/polygons        body: PolygonDto (no id) -> PolygonDto[] (updated collection)
 *   DELETE /api/polygons/{id}   -> 204
 *   DELETE /api/polygons        -> 204 (deletes all)
 *
 *   GET    /api/objects         -> ObjectDto[]
 *   POST   /api/objects         body: ObjectDto[] (no ids) -> ObjectDto[] (updated collection)
 *   DELETE /api/objects/{id}    -> 204
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request(path, { method = 'GET', body } = {}) {
  let response;
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

  const isJson = response.headers.get('content-type')?.includes('application/json');
  return response.status === 204 || !isJson ? null : response.json();
}

export const httpApi = {
  getPolygons: () => request('/api/polygons'),
  createPolygon: (polygon) => request('/api/polygons', { method: 'POST', body: polygon }),
  deletePolygon: (id) => request(`/api/polygons/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  deleteAllPolygons: () => request('/api/polygons', { method: 'DELETE' }),

  getObjects: () => request('/api/objects'),
  saveObjects: (objects) => request('/api/objects', { method: 'POST', body: objects }),
  deleteObject: (id) => request(`/api/objects/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
