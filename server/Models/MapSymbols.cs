namespace MapServer.Models;

/// <summary>
/// The symbols a map object can be drawn with. Must stay in sync with the client.
/// </summary>
public static class MapSymbols
{
    /// <summary>A standard map pin.</summary>
    public const string Marker = "marker";

    /// <summary>A custom jeep icon.</summary>
    public const string Jeep = "jeep";

    /// <summary>Every supported symbol.</summary>
    public static readonly IReadOnlyList<string> All = [Marker, Jeep];
}
