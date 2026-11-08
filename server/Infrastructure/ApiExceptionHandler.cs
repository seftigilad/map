using MapServer.Services;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace MapServer.Infrastructure;

/// <summary>
/// Turns known exceptions into ProblemDetails responses with a readable <c>detail</c> message.
/// Anything not handled here falls through to the default 500 response.
/// </summary>
public sealed class ApiExceptionHandler : IExceptionHandler
{
    /// <summary>MongoDB error code for geometry a 2dsphere index cannot accept (e.g. self-intersecting edges).</summary>
    private const int CannotExtractGeoKeys = 16755;

    private readonly IProblemDetailsService _problemDetails;
    private readonly ILogger<ApiExceptionHandler> _logger;

    /// <summary>Creates the handler.</summary>
    public ApiExceptionHandler(IProblemDetailsService problemDetails, ILogger<ApiExceptionHandler> logger)
    {
        _problemDetails = problemDetails;
        _logger = logger;
    }

    /// <inheritdoc />
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, title, detail) = exception switch
        {
            RequestValidationException e =>
                (StatusCodes.Status400BadRequest, "Invalid request", e.Message),

            MongoWriteException { WriteError.Code: CannotExtractGeoKeys } e =>
                (StatusCodes.Status400BadRequest, "Invalid geometry", $"MongoDB rejected the geometry: {e.WriteError.Message}"),

            MongoBulkWriteException e when e.WriteErrors.Any(w => w.Code == CannotExtractGeoKeys) =>
                (StatusCodes.Status400BadRequest, "Invalid geometry", $"MongoDB rejected the geometry: {e.WriteErrors[0].Message}"),

            TimeoutException or MongoConnectionException =>
                (StatusCodes.Status503ServiceUnavailable, "Database unavailable", "Cannot reach MongoDB. Is it running?"),

            _ => (0, string.Empty, string.Empty),
        };

        if (status == 0)
            return false;

        if (status >= 500)
            _logger.LogError(exception, "{Title}", title);

        httpContext.Response.StatusCode = status;
        return await _problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails { Status = status, Title = title, Detail = detail },
        });
    }
}
