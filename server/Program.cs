using System.Reflection;
using MapServer.Infrastructure;
using MapServer.Services;
using Microsoft.OpenApi;

const string ClientCorsPolicy = "Client";

var builder = WebApplication.CreateBuilder(args);

// --- Services ---------------------------------------------------------------

builder.Services.AddControllers();

builder.Services.AddMongoPersistence(builder.Configuration);
builder.Services.AddSingleton<IPolygonService, PolygonService>();
builder.Services.AddSingleton<IMapObjectService, MapObjectService>();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();

builder.Services.AddCors(options => options.AddPolicy(ClientCorsPolicy, policy =>
    policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
        .AllowAnyHeader()
        .AllowAnyMethod()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Map Server API",
        Version = "v1",
        Description = "Polygons and map objects stored as GeoJSON in MongoDB.",
    });
    var xmlFile = Path.Combine(AppContext.BaseDirectory, $"{Assembly.GetExecutingAssembly().GetName().Name}.xml");
    options.IncludeXmlComments(xmlFile);
});

// --- Pipeline ---------------------------------------------------------------

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(ClientCorsPolicy);
app.MapControllers();

app.Run();
