using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver.GeoJsonObjectModel;

namespace MapServer.Models;

/// <summary>
/// A map object (standard marker or custom symbol) as stored in the <c>objects</c> collection.
/// </summary>
public sealed class MapObjectDocument
{
    /// <summary>MongoDB ObjectId, exposed to the application as a string.</summary>
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    /// <summary>Display name, e.g. "Jeep 1".</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>How the object is drawn on the map; one of <see cref="MapSymbols.All"/>.</summary>
    public string Symbol { get; set; } = MapSymbols.Marker;

    /// <summary>GeoJSON Point geometry; position is [longitude, latitude].</summary>
    public GeoJsonPoint<GeoJson2DGeographicCoordinates> Geometry { get; set; } = null!;
}
