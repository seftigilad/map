using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver.GeoJsonObjectModel;

namespace MapServer.Models;

/// <summary>
/// A polygon as stored in the <c>polygons</c> collection.
/// The geometry is a native GeoJSON Polygon, so MongoDB can index and query it (2dsphere).
/// </summary>
public sealed class PolygonDocument
{
    /// <summary>MongoDB ObjectId, exposed to the application as a string.</summary>
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    /// <summary>Display name, e.g. "Polygon 1".</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>GeoJSON Polygon geometry; positions are [longitude, latitude].</summary>
    public GeoJsonPolygon<GeoJson2DGeographicCoordinates> Geometry { get; set; } = null!;
}
