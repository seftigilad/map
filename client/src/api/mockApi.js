/**
 * In-browser implementation of the same API contract as httpApi, backed by localStorage.
 * Enabled with VITE_USE_MOCK=true (`npm run dev:mock`) to demo the UI without the server.
 */

const KEYS = { polygons: 'map-app.polygons', objects: 'map-app.objects' };
const LATENCY_MS = 150;

const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? [];
  } catch {
    return [];
  }
}

function write(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
  return items;
}

export const mockApi = {
  async getPolygons() {
    await delay();
    return read(KEYS.polygons);
  },
  async createPolygon(polygon) {
    await delay();
    return write(KEYS.polygons, [...read(KEYS.polygons), { ...polygon, id: newId() }]);
  },
  async deletePolygon(id) {
    await delay();
    write(KEYS.polygons, read(KEYS.polygons).filter((p) => p.id !== id));
    return null;
  },
  async deleteAllPolygons() {
    await delay();
    write(KEYS.polygons, []);
    return null;
  },

  async getObjects() {
    await delay();
    return read(KEYS.objects);
  },
  async saveObjects(objects) {
    await delay();
    const created = objects.map((o) => ({ ...o, id: newId() }));
    return write(KEYS.objects, [...read(KEYS.objects), ...created]);
  },
  async deleteObject(id) {
    await delay();
    write(KEYS.objects, read(KEYS.objects).filter((o) => o.id !== id));
    return null;
  },
};
