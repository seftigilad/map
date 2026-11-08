using MapServer.Infrastructure;
using MapServer.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace MapServer.Repositories;

/// <summary>
/// MongoDB implementation of <see cref="IMapObjectRepository"/>.
/// </summary>
public sealed class MongoMapObjectRepository : IMapObjectRepository
{
    private readonly IMongoCollection<MapObjectDocument> _collection;

    /// <summary>Creates the repository over the configured objects collection.</summary>
    public MongoMapObjectRepository(IMongoDatabase database, IOptions<MongoDbSettings> settings)
    {
        _collection = database.GetCollection<MapObjectDocument>(settings.Value.ObjectsCollection);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<MapObjectDocument>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _collection.Find(FilterDefinition<MapObjectDocument>.Empty)
            .SortBy(o => o.Id) // ObjectIds grow over time, so this is creation order.
            .ToListAsync(cancellationToken);

    /// <inheritdoc />
    public Task InsertManyAsync(IReadOnlyCollection<MapObjectDocument> objects, CancellationToken cancellationToken = default) =>
        // The driver rejects an empty batch, and there is nothing to do anyway.
        objects.Count == 0
            ? Task.CompletedTask
            : _collection.InsertManyAsync(objects, cancellationToken: cancellationToken);

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var result = await _collection.DeleteOneAsync(o => o.Id == id, cancellationToken);
        return result.DeletedCount > 0;
    }

    /// <inheritdoc />
    public Task EnsureIndexesAsync(CancellationToken cancellationToken = default) =>
        _collection.Indexes.CreateOneAsync(
            new CreateIndexModel<MapObjectDocument>(Builders<MapObjectDocument>.IndexKeys.Geo2DSphere(o => o.Geometry)),
            cancellationToken: cancellationToken);
}
