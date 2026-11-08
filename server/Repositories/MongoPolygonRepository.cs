using MapServer.Infrastructure;
using MapServer.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace MapServer.Repositories;

/// <summary>
/// MongoDB implementation of <see cref="IPolygonRepository"/>.
/// </summary>
public sealed class MongoPolygonRepository : IPolygonRepository
{
    private readonly IMongoCollection<PolygonDocument> _collection;

    /// <summary>Creates the repository over the configured polygons collection.</summary>
    public MongoPolygonRepository(IMongoDatabase database, IOptions<MongoDbSettings> settings)
    {
        _collection = database.GetCollection<PolygonDocument>(settings.Value.PolygonsCollection);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<PolygonDocument>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _collection.Find(FilterDefinition<PolygonDocument>.Empty)
            .SortBy(p => p.Id) // ObjectIds grow over time, so this is creation order.
            .ToListAsync(cancellationToken);

    /// <inheritdoc />
    public Task InsertAsync(PolygonDocument polygon, CancellationToken cancellationToken = default) =>
        _collection.InsertOneAsync(polygon, cancellationToken: cancellationToken);

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var result = await _collection.DeleteOneAsync(p => p.Id == id, cancellationToken);
        return result.DeletedCount > 0;
    }

    /// <inheritdoc />
    public Task DeleteAllAsync(CancellationToken cancellationToken = default) =>
        _collection.DeleteManyAsync(FilterDefinition<PolygonDocument>.Empty, cancellationToken);

    /// <inheritdoc />
    public Task EnsureIndexesAsync(CancellationToken cancellationToken = default) =>
        _collection.Indexes.CreateOneAsync(
            new CreateIndexModel<PolygonDocument>(Builders<PolygonDocument>.IndexKeys.Geo2DSphere(p => p.Geometry)),
            cancellationToken: cancellationToken);
}
