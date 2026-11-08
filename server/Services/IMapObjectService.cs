using MapServer.Dtos;

namespace MapServer.Services;

/// <summary>
/// Map object use cases: validation, mapping, and persistence.
/// </summary>
public interface IMapObjectService
{
    /// <summary>Returns every stored object.</summary>
    Task<IReadOnlyList<MapObjectResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates and stores a batch of new objects, then returns the full updated list.
    /// Nothing is stored if any object in the batch is invalid.
    /// </summary>
    /// <exception cref="RequestValidationException">An object is invalid.</exception>
    Task<IReadOnlyList<MapObjectResponse>> CreateManyAsync(IReadOnlyList<CreateMapObjectRequest> requests, CancellationToken cancellationToken = default);

    /// <summary>Deletes one object.</summary>
    /// <returns><c>false</c> if no object has that id.</returns>
    /// <exception cref="RequestValidationException">The id is not a valid ObjectId.</exception>
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
}
