using MapServer.Dtos;
using MapServer.Models;
using MongoDB.Bson;

namespace MapServer.Services;

/// <summary>
/// Validates incoming requests. Every method throws <see cref="RequestValidationException"/>
/// with a readable message on the first problem it finds.
/// </summary>
public static class GeoJsonValidator
{
    private const int MinRingPositions = 4;

    /// <summary>Validates a polygon create request.</summary>
    public static void ValidatePolygon(CreatePolygonRequest? request)
    {
        if (request is null)
            throw new RequestValidationException("The polygon is missing.");

        ValidateName(request.Name, "Polygon");

        var geometry = request.Geometry
            ?? throw new RequestValidationException("Polygon geometry is missing.");

        if (geometry.Type != "Polygon")
            throw new RequestValidationException($"Polygon geometry type must be \"Polygon\" (got \"{geometry.Type}\").");

        if (geometry.Coordinates is null || geometry.Coordinates.Length == 0)
            throw new RequestValidationException("A polygon needs at least one ring of coordinates.");

        for (var r = 0; r < geometry.Coordinates.Length; r++)
            ValidateRing(geometry.Coordinates[r], ringLabel: geometry.Coordinates.Length == 1 ? "The polygon ring" : $"Ring {r + 1}");
    }

    /// <summary>Validates a batch of objects; messages name the offending item.</summary>
    public static void ValidateObjects(IReadOnlyList<CreateMapObjectRequest?>? requests)
    {
        if (requests is null)
            throw new RequestValidationException("The list of objects is missing.");

        for (var i = 0; i < requests.Count; i++)
        {
            try
            {
                ValidateObject(requests[i]);
            }
            catch (RequestValidationException ex) when (requests.Count > 1)
            {
                throw new RequestValidationException($"Object {i + 1}: {ex.Message}");
            }
        }
    }

    /// <summary>Validates a single object.</summary>
    public static void ValidateObject(CreateMapObjectRequest? request)
    {
        if (request is null)
            throw new RequestValidationException("The object is missing.");

        ValidateName(request.Name, "Object");

        if (!MapSymbols.All.Contains(request.Symbol?.Trim().ToLowerInvariant()))
            throw new RequestValidationException(
                $"Symbol must be one of: {string.Join(", ", MapSymbols.All)} (got \"{request.Symbol}\").");

        var geometry = request.Geometry
            ?? throw new RequestValidationException("Object geometry is missing.");

        if (geometry.Type != "Point")
            throw new RequestValidationException($"Object geometry type must be \"Point\" (got \"{geometry.Type}\").");

        ValidatePosition(geometry.Coordinates, "The object position");
    }

    /// <summary>Validates that <paramref name="id"/> is a MongoDB ObjectId.</summary>
    public static void ValidateId(string? id)
    {
        if (!ObjectId.TryParse(id, out _))
            throw new RequestValidationException($"\"{id}\" is not a valid id (expected a 24-character hex ObjectId).");
    }

    private static void ValidateName(string? name, string kind)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new RequestValidationException($"{kind} name is required.");
    }

    private static void ValidateRing(double[][]? ring, string ringLabel)
    {
        if (ring is null || ring.Length < MinRingPositions)
            throw new RequestValidationException(
                $"{ringLabel} needs at least {MinRingPositions} positions (3 corners plus the closing point); got {ring?.Length ?? 0}.");

        for (var p = 0; p < ring.Length; p++)
            ValidatePosition(ring[p], $"{ringLabel}, position {p + 1}");

        var first = ring[0];
        var last = ring[^1];
        if (first[0] != last[0] || first[1] != last[1])
            throw new RequestValidationException($"{ringLabel} is not closed: the last position must equal the first.");
    }

    private static void ValidatePosition(double[]? position, string label)
    {
        if (position is null || position.Length != 2)
            throw new RequestValidationException($"{label} must be [longitude, latitude].");

        var (lng, lat) = (position[0], position[1]);

        if (lng is < -180 or > 180)
            throw new RequestValidationException($"{label}: longitude {lng} is out of range (must be between -180 and 180).");

        if (lat is < -90 or > 90)
            throw new RequestValidationException($"{label}: latitude {lat} is out of range (must be between -90 and 90).");
    }
}
