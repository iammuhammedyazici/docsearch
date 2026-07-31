using DocSearch.Api.Models;
using DocSearch.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DocSearch.Api.Controllers;

[ApiController]
[Route("api/documents")]
public sealed class DocumentsController(IDocumentService documentService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<DocumentListItem>>> Get(
        [FromQuery] string? q,
        [FromQuery] string? type,
        [FromQuery] long? ownerId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new DocumentQuery(q, type, ownerId, from, to, page, pageSize);
        var result = await documentService.SearchAsync(query, cancellationToken);
        return Ok(result);
    }
}
