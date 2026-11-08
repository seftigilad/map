using System.Text.RegularExpressions;
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
    /// <summary>
    /// MongoDB error codes for geometry a 2dsphere index cannot accept (e.g. self-intersecting edges):
    /// 16755 on older servers, 510 (CannotBuildIndexKeys) on current ones.
    /// </summary>
    private static readonly HashSet<int> InvalidGeometryCodes = [16755, 510];

    /// <summary>Picks the crossing edges out of MongoDB's "Edges 0 and 2 cross" message.</summary>
    private static readonly Regex CrossingEdges = new(@"Edges (\d+) and (\d+) cross", RegexOptions.Compiled);

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

            MongoWriteException e when InvalidGeometryCodes.Contains(e.WriteError.Code) =>
                (StatusCodes.Status400BadRequest, "Invalid geometry", DescribeInvalidGeometry(e.WriteError.Message)),

            MongoBulkWriteException e when e.WriteErrors.Any(w => InvalidGeometryCodes.Contains(w.Code)) =>
                (StatusCodes.Status400BadRequest, "Invalid geometry",
                    DescribeInvalidGeometry(e.WriteErrors.First(w => InvalidGeometryCodes.Contains(w.Code)).Message)),

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

    /// <summary>
    /// Turns MongoDB's long geo-index error into a short message a user can act on.
    /// </summary>
    private static string DescribeInvalidGeometry(string mongoMessage)
    {
        var match = CrossingEdges.Match(mongoMessage);
        if (match.Success)
        {
            // MongoDB numbers edges from 0; people count from 1.
            var first = int.Parse(match.Groups[1].Value) + 1;
            var second = int.Parse(match.Groups[2].Value) + 1;
            return $"The polygon's edges cross each other (edges {first} and {second}). Draw it without overlapping lines.";
        }

        return "MongoDB could not index this geometry. Make sure the polygon's edges don't cross each other.";
    }
}
