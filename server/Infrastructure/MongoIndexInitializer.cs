using MapServer.Repositories;

namespace MapServer.Infrastructure;

/// <summary>
/// Creates the 2dsphere indexes when the app starts.
/// Runs in the background so the API still starts (and reports clear errors)
/// if MongoDB is not reachable yet.
/// </summary>
public sealed class MongoIndexInitializer : BackgroundService
{
    private readonly IPolygonRepository _polygons;
    private readonly IMapObjectRepository _objects;
    private readonly ILogger<MongoIndexInitializer> _logger;

    /// <summary>Creates the initializer.</summary>
    public MongoIndexInitializer(
        IPolygonRepository polygons,
        IMapObjectRepository objects,
        ILogger<MongoIndexInitializer> logger)
    {
        _polygons = polygons;
        _objects = objects;
        _logger = logger;
    }

    /// <inheritdoc />
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await _polygons.EnsureIndexesAsync(stoppingToken);
            await _objects.EnsureIndexesAsync(stoppingToken);
            _logger.LogInformation("MongoDB 2dsphere indexes are in place.");
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Shutting down; nothing to report.
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Could not create MongoDB indexes. Is MongoDB running? Requests will fail until it is reachable.");
        }
    }
}
