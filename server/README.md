# Map Server

ASP.NET Core Web API (.NET 8) that stores the map app's polygons and objects as GeoJSON in MongoDB.

## Run it

1. **Start MongoDB** on `localhost:27017`, using either option:
   - Docker: `docker run -d -p 27017:27017 --name mapapp-mongo mongo`
   - Local install: install [MongoDB Community Server](https://www.mongodb.com/try/download/community). It runs as a Windows service by default. You can also start it by hand with `mongod --dbpath <some-folder>`.
2. **Start the API** from this folder:
   ```
   dotnet run
   ```
   It listens on http://localhost:5000. Swagger UI is at http://localhost:5000/swagger (Development environment, which `dotnet run` uses).
3. **Start the client** from the repo root: `cd client && npm run dev`, then open http://localhost:5173.

The project targets `net8.0`. It sets `RollForward=Major`, so it also runs on a machine that only has a newer runtime (.NET 9 or 10).

If MongoDB is not running, the API still starts. It logs a warning, and every data request returns `503 Database unavailable` until MongoDB is reachable. The database, collections and 2dsphere indexes are created automatically.

## Configuration (`appsettings.json`)

| Key | Default |
| --- | --- |
| `MongoDb:ConnectionString` | `mongodb://localhost:27017` |
| `MongoDb:DatabaseName` | `mapapp` |
| `MongoDb:PolygonsCollection` / `ObjectsCollection` | `polygons` / `objects` |
| `Cors:AllowedOrigins` | `["http://localhost:5173"]` |

You can override any key with an environment variable, e.g. `MongoDb__ConnectionString=mongodb://otherhost:27017`.

## API

| Method | Route | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/polygons` | – | `Polygon[]` |
| POST | `/api/polygons` | one Polygon (no id) | full updated `Polygon[]` |
| DELETE | `/api/polygons/{id}` | – | 204, or 404 if not found |
| DELETE | `/api/polygons` | – | 204, deletes all |
| GET | `/api/objects` | – | `Object[]` |
| POST | `/api/objects` | array of Objects (no ids) | full updated `Object[]` |
| DELETE | `/api/objects/{id}` | – | 204, or 404 if not found |

```jsonc
// Polygon: positions are [lng, lat] and the ring is closed
{ "id": "665f...", "name": "Polygon 1",
  "geometry": { "type": "Polygon", "coordinates": [[[34.78,32.08],[34.80,32.08],[34.79,32.10],[34.78,32.08]]] } }

// Object: symbol is "marker" or "jeep"
{ "id": "665f...", "name": "Jeep 1", "symbol": "jeep",
  "geometry": { "type": "Point", "coordinates": [34.78, 32.08] } }
```

Errors are returned as [ProblemDetails](https://www.rfc-editor.org/rfc/rfc9457) with a readable `detail`. The API returns `400` when:
- a polygon ring has fewer than 4 positions or is not closed,
- a symbol is not `marker` or `jeep`,
- a latitude is outside [-90, 90] or a longitude is outside [-180, 180],
- an id is not a valid ObjectId,
- MongoDB rejects a geometry, e.g. a self-intersecting polygon.

An objects batch is validated as a whole, so if any item is invalid, none of the batch is saved.

## Project layout

```
Controllers/     PolygonsController, ObjectsController (HTTP only)
Services/        Use cases, GeoJsonValidator (rules), GeoJsonMapper (DTO <-> document)
Repositories/    IPolygonRepository / IMapObjectRepository + MongoDB implementations
Models/          MongoDB documents (driver GeoJSON types: GeoJsonPolygon / GeoJsonPoint)
Dtos/            Request and response shapes
Infrastructure/  Mongo DI setup, startup index creation, exception -> ProblemDetails mapping
```

All of these are registered with dependency injection in `Program.cs`.
