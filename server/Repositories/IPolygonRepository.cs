using MapServer.Models;

namespace MapServer.Repositories;

/// <summary>
/// Persistence for polygons.
/// </summary>
public interface IPolygonRepository
{
    /// <summary>Returns every stored polygon.</summary>
    Task<IReadOnlyList<PolygonDocument>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Inserts a polygon; its <see cref="PolygonDocument.Id"/> is filled in by MongoDB.</summary>
    Task InsertAsync(PolygonDocument polygon, CancellationToken cancellationToken = default);

    /// <summary>Deletes one polygon by id.</summary>
    /// <returns><c>true</c> if a polygon was deleted; <c>false</c> if none had that id.</returns>
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);

    /// <summary>Deletes every polygon.</summary>
    Task DeleteAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Creates the collection's indexes (a 2dsphere index on the geometry) if missing.</summary>
    Task EnsureIndexesAsync(CancellationToken cancellationToken = default);
}
