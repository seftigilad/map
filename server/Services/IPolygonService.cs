using MapServer.Dtos;

namespace MapServer.Services;

/// <summary>
/// Polygon use cases: validation, mapping, and persistence.
/// </summary>
public interface IPolygonService
{
    /// <summary>Returns every stored polygon.</summary>
    Task<IReadOnlyList<PolygonResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Validates and stores a polygon, then returns the full updated list.</summary>
    /// <exception cref="RequestValidationException">The polygon is invalid.</exception>
    Task<IReadOnlyList<PolygonResponse>> CreateAsync(CreatePolygonRequest request, CancellationToken cancellationToken = default);

    /// <summary>Deletes one polygon.</summary>
    /// <returns><c>false</c> if no polygon has that id.</returns>
    /// <exception cref="RequestValidationException">The id is not a valid ObjectId.</exception>
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);

    /// <summary>Deletes every polygon.</summary>
    Task DeleteAllAsync(CancellationToken cancellationToken = default);
}
