# Map Application (Client / Server)

Manage geographic objects (polygons and markers/symbols) on an interactive map.

| Part     | Tech                         | Folder    |
|----------|------------------------------|-----------|
| Client   | React 18 + TypeScript + Leaflet (Vite) | `client/` |
| Server   | ASP.NET Core REST API        | `server/` |
| Database | MongoDB (GeoJSON documents)  | –         |

## Running the client

```bash
cd client
npm install
npm run dev        # http://localhost:5173 – /api is proxied to http://localhost:5000
npm run dev:mock   # same UI, backed by an in-browser mock API (no server needed)
npm run typecheck  # TypeScript check (strict mode)
npm run build      # type-check + production build
```

To use a server on another address, set `API_TARGET` (dev proxy) or `VITE_API_URL` (see `client/.env.example`).

## UI

```
┌───────────────────────────┬──────────────────┐
│                           │ 2 Polygon        │
│                           ├──────────────────┤
│         1 Map             │ 3 Objects        │
│                           ├──────────────────┤
│                           │ 4 Map Data       │
└───────────────────────────┴──────────────────┘
```

- **Polygon** – *Add* enters drawing mode: click to add vertices, click the first vertex to close
  (Esc cancels). *Save* POSTs unsaved polygons. *Delete* removes the selected polygon,
  *Delete all* removes every polygon.
- **Objects** – choose *Marker* or *Jeep*, *Add* enters placement mode (click the map to place,
  drag unsaved objects to adjust). *Save* POSTs the list of unsaved objects. *Delete* removes the selected object.
- **Map Data** – saved items with Object / Lat / Lon (a polygon shows its center). Refreshed from the
  server response after every Save. Clicking a row selects the item and zooms to it.

Unsaved items are drawn dashed/translucent; the selected item is highlighted in red.

## Client structure

```
client/src/
├── api/
│   ├── types.ts          MapApi interface (the REST contract)
│   ├── httpApi.ts        REST calls to the server
│   ├── mockApi.ts        localStorage implementation of the same contract
│   ├── mappers.ts        DTO (GeoJSON) <-> view model conversion
│   └── index.ts          picks the http or mock implementation
├── components/
│   ├── map/              MapView, PolygonDrawer, PolygonsLayer, ObjectsLayer
│   ├── panels/           Panel, PolygonPanel, ObjectsPanel, MapDataPanel
│   ├── SymbolPreview.tsx
│   └── StatusToast.tsx
├── hooks/useMapData.ts   data state: saved items, drafts, save/delete operations
├── map/                  constants (modes, styles) and Leaflet icons (marker, jeep)
├── utils/geo.ts          GeoJSON helpers ([lat,lng] <-> [lng,lat])
├── types.ts              shared types: DTOs (match the server records) and view models
├── vite-env.d.ts         typed VITE_* environment variables
├── App.tsx               layout + UI state (mode, selection)
└── styles.css
```

## REST API contract

All geometry is GeoJSON (positions are `[lng, lat]`, polygon rings are closed).

```jsonc
// Polygon
{ "id": "665f…", "name": "Polygon 1",
  "geometry": { "type": "Polygon", "coordinates": [[[34.78, 32.08], [34.80, 32.08], [34.79, 32.10], [34.78, 32.08]]] } }

// Object
{ "id": "665f…", "name": "Jeep 1", "symbol": "jeep",          // "marker" | "jeep"
  "geometry": { "type": "Point", "coordinates": [34.78, 32.08] } }
```

| Method | Route                 | Body                       | Response                         |
|--------|-----------------------|----------------------------|----------------------------------|
| GET    | `/api/polygons`       | –                          | `Polygon[]`                      |
| POST   | `/api/polygons`       | `Polygon` (without `id`)   | `Polygon[]` – updated collection |
| DELETE | `/api/polygons/{id}`  | –                          | `204 No Content`                 |
| DELETE | `/api/polygons`       | –                          | `204 No Content` (delete all)    |
| GET    | `/api/objects`        | –                          | `Object[]`                       |
| POST   | `/api/objects`        | `Object[]` (without `id`)  | `Object[]` – updated collection  |
| DELETE | `/api/objects/{id}`   | –                          | `204 No Content`                 |
