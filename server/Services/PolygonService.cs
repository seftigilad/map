using MapServer.Dtos;
using MapServer.Repositories;

namespace MapServer.Services;

/// <summary>
/// Default <see cref="IPolygonService"/> backed by <see cref="IPolygonRepository"/>.
/// </summary>
public sealed class PolygonService : IPolygonService
{
    private readonly IPolygonRepository _repository;

    /// <summary>Creates the service.</summary>
    public PolygonService(IPolygonRepository repository)
    {
        _repository = repository;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<PolygonResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var documents = await _repository.GetAllAsync(cancellationToken);
        return documents.Select(GeoJsonMapper.ToResponse).ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<PolygonResponse>> CreateAsync(CreatePolygonRequest request, CancellationToken cancellationToken = default)
    {
        GeoJsonValidator.ValidatePolygon(request);
        await _repository.InsertAsync(GeoJsonMapper.ToDocument(request), cancellationToken);
        return await GetAllAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        GeoJsonValidator.ValidateId(id);
        return _repository.DeleteAsync(id, cancellationToken);
    }

    /// <inheritdoc />
    public Task DeleteAllAsync(CancellationToken cancellationToken = default) =>
        _repository.DeleteAllAsync(cancellationToken);
}
