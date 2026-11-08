using MapServer.Models;

namespace MapServer.Repositories;

/// <summary>
/// Persistence for map objects (markers and symbols).
/// </summary>
public interface IMapObjectRepository
{
    /// <summary>Returns every stored object.</summary>
    Task<IReadOnlyList<MapObjectDocument>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Inserts several objects; their ids are filled in by MongoDB.</summary>
    Task InsertManyAsync(IReadOnlyCollection<MapObjectDocument> objects, CancellationToken cancellationToken = default);

    /// <summary>Deletes one object by id.</summary>
    /// <returns><c>true</c> if an object was deleted; <c>false</c> if none had that id.</returns>
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);

    /// <summary>Creates the collection's indexes (a 2dsphere index on the geometry) if missing.</summary>
    Task EnsureIndexesAsync(CancellationToken cancellationToken = default);
}
