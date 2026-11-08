using MapServer.Dtos;
using MapServer.Models;
using MongoDB.Driver.GeoJsonObjectModel;

namespace MapServer.Services;

/// <summary>
/// Converts between API DTOs (plain coordinate arrays) and MongoDB documents (driver GeoJSON types).
/// Inputs are expected to have passed <see cref="GeoJsonValidator"/>.
/// </summary>
public static class GeoJsonMapper
{
    /// <summary>Builds a polygon document from a validated create request.</summary>
    public static PolygonDocument ToDocument(CreatePolygonRequest request)
    {
        var rings = request.Geometry.Coordinates.Select(ToRing).ToList();
        var coordinates = new GeoJsonPolygonCoordinates<GeoJson2DGeographicCoordinates>(rings[0], rings.Skip(1));

        return new PolygonDocument
        {
            Name = request.Name.Trim(),
            Geometry = GeoJson.Polygon(coordinates),
        };
    }

    /// <summary>Builds an object document from a validated create request.</summary>
    public static MapObjectDocument ToDocument(CreateMapObjectRequest request) => new()
    {
        Name = request.Name.Trim(),
        Symbol = request.Symbol.Trim().ToLowerInvariant(),
        Geometry = GeoJson.Point(ToCoordinates(request.Geometry.Coordinates)),
    };

    /// <summary>Converts a stored polygon to its API shape.</summary>
    public static PolygonResponse ToResponse(PolygonDocument document)
    {
        var polygon = document.Geometry.Coordinates;
        var rings = new[] { polygon.Exterior }
            .Concat(polygon.Holes)
            .Select(ring => ring.Positions.Select(ToArray).ToArray())
            .ToArray();

        return new PolygonResponse(document.Id!, document.Name, new PolygonGeometryDto("Polygon", rings));
    }

    /// <summary>Converts a stored object to its API shape.</summary>
    public static MapObjectResponse ToResponse(MapObjectDocument document) => new(
        document.Id!,
        document.Name,
        document.Symbol,
        new PointGeometryDto("Point", ToArray(document.Geometry.Coordinates)));

    private static GeoJsonLinearRingCoordinates<GeoJson2DGeographicCoordinates> ToRing(double[][] ring) =>
        new(ring.Select(ToCoordinates));

    // GeoJSON order is [longitude, latitude].
    private static GeoJson2DGeographicCoordinates ToCoordinates(double[] position) =>
        new(longitude: position[0], latitude: position[1]);

    private static double[] ToArray(GeoJson2DGeographicCoordinates c) => [c.Longitude, c.Latitude];
}
