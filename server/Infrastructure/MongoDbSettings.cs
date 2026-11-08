namespace MapServer.Infrastructure;

/// <summary>
/// MongoDB connection settings, bound from the <c>MongoDb</c> section of appsettings.json.
/// </summary>
public sealed class MongoDbSettings
{
    /// <summary>Name of the configuration section these settings are bound from.</summary>
    public const string SectionName = "MongoDb";

    /// <summary>MongoDB connection string.</summary>
    public string ConnectionString { get; set; } = "mongodb://localhost:27017";

    /// <summary>Database that holds the map collections.</summary>
    public string DatabaseName { get; set; } = "mapapp";

    /// <summary>Collection that stores polygons.</summary>
    public string PolygonsCollection { get; set; } = "polygons";

    /// <summary>Collection that stores map objects (markers and symbols).</summary>
    public string ObjectsCollection { get; set; } = "objects";

    /// <summary>
    /// How long the driver waits for a reachable server before failing a request.
    /// Kept short so an unavailable database surfaces as a quick, clear error.
    /// </summary>
    public int ServerSelectionTimeoutSeconds { get; set; } = 5;
}
