using MapServer.Models;
using MapServer.Repositories;
using Microsoft.Extensions.Options;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;

namespace MapServer.Infrastructure;

/// <summary>
/// Registers MongoDB and the repositories with dependency injection.
/// </summary>
public static class MongoServiceCollectionExtensions
{
    /// <summary>
    /// Adds the MongoDB client, database, repositories, and the startup index initializer.
    /// </summary>
    public static IServiceCollection AddMongoPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        RegisterConventions();

        services.Configure<MongoDbSettings>(configuration.GetSection(MongoDbSettings.SectionName));

        // The client is thread-safe and pools connections, so one instance serves the whole app.
        services.AddSingleton<IMongoClient>(sp =>
        {
            var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
            var clientSettings = MongoClientSettings.FromConnectionString(settings.ConnectionString);
            clientSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(settings.ServerSelectionTimeoutSeconds);
            return new MongoClient(clientSettings);
        });

        services.AddSingleton(sp =>
        {
            var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
            return sp.GetRequiredService<IMongoClient>().GetDatabase(settings.DatabaseName);
        });

        services.AddSingleton<IPolygonRepository, MongoPolygonRepository>();
        services.AddSingleton<IMapObjectRepository, MongoMapObjectRepository>();
        services.AddHostedService<MongoIndexInitializer>();

        return services;
    }

    /// <summary>
    /// Stores our documents with camelCase field names (matching the API's JSON)
    /// and tolerates fields that the model no longer has.
    /// </summary>
    private static void RegisterConventions()
    {
        var pack = new ConventionPack
        {
            new CamelCaseElementNameConvention(),
            new IgnoreExtraElementsConvention(true),
        };
        var modelsNamespace = typeof(PolygonDocument).Namespace;
        ConventionRegistry.Register("MapServerModels", pack, type => type.Namespace == modelsNamespace);
    }
}
