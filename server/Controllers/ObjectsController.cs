using MapServer.Dtos;
using MapServer.Services;
using Microsoft.AspNetCore.Mvc;

namespace MapServer.Controllers;

/// <summary>
/// REST endpoints for map objects (standard markers and custom symbols such as a jeep).
/// </summary>
[ApiController]
[Route("api/objects")]
[Produces("application/json")]
public sealed class ObjectsController : ControllerBase
{
    private readonly IMapObjectService _service;

    /// <summary>Creates the controller.</summary>
    public ObjectsController(IMapObjectService service)
    {
        _service = service;
    }

    /// <summary>Returns every stored object.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<MapObjectResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MapObjectResponse>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _service.GetAllAsync(cancellationToken));

    /// <summary>Stores a batch of new objects and returns the full updated list.</summary>
    /// <param name="requests">The objects to store, without ids.</param>
    /// <param name="cancellationToken">Cancelled when the client disconnects.</param>
    /// <response code="200">The objects were stored; the body is every stored object.</response>
    /// <response code="400">At least one object is invalid; nothing was stored.</response>
    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType<IReadOnlyList<MapObjectResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyList<MapObjectResponse>>> CreateMany(
        [FromBody] List<CreateMapObjectRequest> requests, CancellationToken cancellationToken) =>
        Ok(await _service.CreateManyAsync(requests, cancellationToken));

    /// <summary>Deletes one object.</summary>
    /// <param name="id">The object's ObjectId.</param>
    /// <param name="cancellationToken">Cancelled when the client disconnects.</param>
    /// <response code="204">The object was deleted.</response>
    /// <response code="400">The id is not a valid ObjectId.</response>
    /// <response code="404">No object has that id.</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken) =>
        await _service.DeleteAsync(id, cancellationToken)
            ? NoContent()
            : Problem(statusCode: StatusCodes.Status404NotFound, title: "Not found", detail: $"No object with id \"{id}\".");
}
