namespace MapServer.Dtos;

/// <summary>
/// One item in the request body for <c>POST /api/objects</c>. The id is assigned by the server.
/// </summary>
/// <param name="Name">Display name, e.g. "Jeep 1".</param>
/// <param name="Symbol"><c>"marker"</c> or <c>"jeep"</c>.</param>
/// <param name="Geometry">GeoJSON Point geometry.</param>
public sealed record CreateMapObjectRequest(string Name, string Symbol, PointGeometryDto Geometry);

/// <summary>
/// A stored map object, as returned by the API.
/// </summary>
/// <param name="Id">MongoDB ObjectId as a string.</param>
/// <param name="Name">Display name.</param>
/// <param name="Symbol"><c>"marker"</c> or <c>"jeep"</c>.</param>
/// <param name="Geometry">GeoJSON Point geometry.</param>
public sealed record MapObjectResponse(string Id, string Name, string Symbol, PointGeometryDto Geometry);
