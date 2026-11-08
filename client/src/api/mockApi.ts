/**
 * In-browser implementation of the same API contract as httpApi, backed by localStorage.
 * Enabled with VITE_USE_MOCK=true (`npm run dev:mock`) to demo the UI without the server.
 */
import type { MapObjectDto, PolygonDto } from '../types';
import type { MapApi } from './types';

const KEYS = { polygons: 'map-app.polygons', objects: 'map-app.objects' } as const;
const LATENCY_MS = 150;

const delay = () => new Promise<void>((resolve) => setTimeout(resolve, LATENCY_MS));

const newId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;

function read<T>(key: string): T[] {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? 'null') as T[] | null) ?? [];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]): T[] {
  localStorage.setItem(key, JSON.stringify(items));
  return items;
}

export const mockApi: MapApi = {
  async getPolygons() {
    await delay();
    return read<PolygonDto>(KEYS.polygons);
  },
  async createPolygon(polygon) {
    await delay();
    return write(KEYS.polygons, [...read<PolygonDto>(KEYS.polygons), { ...polygon, id: newId() }]);
  },
  async deletePolygon(id) {
    await delay();
    write(KEYS.polygons, read<PolygonDto>(KEYS.polygons).filter((p) => p.id !== id));
  },
  async deleteAllPolygons() {
    await delay();
    write(KEYS.polygons, []);
  },

  async getObjects() {
    await delay();
    return read<MapObjectDto>(KEYS.objects);
  },
  async saveObjects(objects) {
    await delay();
    const created = objects.map((o) => ({ ...o, id: newId() }));
    return write(KEYS.objects, [...read<MapObjectDto>(KEYS.objects), ...created]);
  },
  async deleteObject(id) {
    await delay();
    write(KEYS.objects, read<MapObjectDto>(KEYS.objects).filter((o) => o.id !== id));
  },
};
