using MapServer.Dtos;
using MapServer.Repositories;

namespace MapServer.Services;

/// <summary>
/// Default <see cref="IMapObjectService"/> backed by <see cref="IMapObjectRepository"/>.
/// </summary>
public sealed class MapObjectService : IMapObjectService
{
    private readonly IMapObjectRepository _repository;

    /// <summary>Creates the service.</summary>
    public MapObjectService(IMapObjectRepository repository)
    {
        _repository = repository;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<MapObjectResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var documents = await _repository.GetAllAsync(cancellationToken);
        return documents.Select(GeoJsonMapper.ToResponse).ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<MapObjectResponse>> CreateManyAsync(IReadOnlyList<CreateMapObjectRequest> requests, CancellationToken cancellationToken = default)
    {
        // Validate the whole batch first so an invalid item never leaves a half-saved batch behind.
        GeoJsonValidator.ValidateObjects(requests);

        var documents = requests.Select(GeoJsonMapper.ToDocument).ToList();
        await _repository.InsertManyAsync(documents, cancellationToken);
        return await GetAllAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        GeoJsonValidator.ValidateId(id);
        return _repository.DeleteAsync(id, cancellationToken);
    }
}
