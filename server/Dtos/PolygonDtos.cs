namespace MapServer.Dtos;

/// <summary>
/// Request body for <c>POST /api/polygons</c>. The id is assigned by the server.
/// </summary>
/// <param name="Name">Display name, e.g. "Polygon 1".</param>
/// <param name="Geometry">GeoJSON Polygon geometry.</param>
public sealed record CreatePolygonRequest(string Name, PolygonGeometryDto Geometry);

/// <summary>
/// A stored polygon, as returned by the API.
/// </summary>
/// <param name="Id">MongoDB ObjectId as a string.</param>
/// <param name="Name">Display name.</param>
/// <param name="Geometry">GeoJSON Polygon geometry.</param>
public sealed record PolygonResponse(string Id, string Name, PolygonGeometryDto Geometry);
