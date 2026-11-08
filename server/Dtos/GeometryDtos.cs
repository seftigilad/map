namespace MapServer.Dtos;

/// <summary>
/// GeoJSON Point geometry as exchanged with the client.
/// </summary>
/// <param name="Type">Must be <c>"Point"</c>.</param>
/// <param name="Coordinates">A single position: <c>[longitude, latitude]</c>.</param>
public sealed record PointGeometryDto(string Type, double[] Coordinates);

/// <summary>
/// GeoJSON Polygon geometry as exchanged with the client.
/// </summary>
/// <param name="Type">Must be <c>"Polygon"</c>.</param>
/// <param name="Coordinates">
/// Linear rings of <c>[longitude, latitude]</c> positions. The first ring is the outer boundary,
/// any further rings are holes. Each ring is closed (first position equals last position).
/// </param>
public sealed record PolygonGeometryDto(string Type, double[][][] Coordinates);
