using MapServer.Dtos;
using MapServer.Services;
using Microsoft.AspNetCore.Mvc;

namespace MapServer.Controllers;

/// <summary>
/// REST endpoints for polygons.
/// </summary>
[ApiController]
[Route("api/polygons")]
[Produces("application/json")]
public sealed class PolygonsController : ControllerBase
{
    private readonly IPolygonService _service;

    /// <summary>Creates the controller.</summary>
    public PolygonsController(IPolygonService service)
    {
        _service = service;
    }

    /// <summary>Returns every stored polygon.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<PolygonResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PolygonResponse>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _service.GetAllAsync(cancellationToken));

    /// <summary>Stores a new polygon and returns the full updated list.</summary>
    /// <param name="request">The polygon to store, without an id.</param>
    /// <param name="cancellationToken">Cancelled when the client disconnects.</param>
    /// <response code="200">The polygon was stored; the body is every stored polygon.</response>
    /// <response code="400">The polygon is invalid.</response>
    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType<IReadOnlyList<PolygonResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyList<PolygonResponse>>> Create(
        [FromBody] CreatePolygonRequest request, CancellationToken cancellationToken) =>
        Ok(await _service.CreateAsync(request, cancellationToken));

    /// <summary>Deletes one polygon.</summary>
    /// <param name="id">The polygon's ObjectId.</param>
    /// <param name="cancellationToken">Cancelled when the client disconnects.</param>
    /// <response code="204">The polygon was deleted.</response>
    /// <response code="400">The id is not a valid ObjectId.</response>
    /// <response code="404">No polygon has that id.</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken) =>
        await _service.DeleteAsync(id, cancellationToken)
            ? NoContent()
            : Problem(statusCode: StatusCodes.Status404NotFound, title: "Not found", detail: $"No polygon with id \"{id}\".");

    /// <summary>Deletes every polygon.</summary>
    /// <response code="204">All polygons were deleted.</response>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteAll(CancellationToken cancellationToken)
    {
        await _service.DeleteAllAsync(cancellationToken);
        return NoContent();
    }
}
