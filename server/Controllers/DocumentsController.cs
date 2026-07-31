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

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload([FromForm] UploadDocumentForm form, CancellationToken cancellationToken)
    {
        await using var stream = form.File.OpenReadStream();
        using var buffer = new MemoryStream();
        await stream.CopyToAsync(buffer, cancellationToken);
        var contentHash = ContentHasher.ComputeSha256Hex(buffer.ToArray());

        var request = new UploadDocumentRequest(
            form.Title,
            form.DocType,
            form.OwnerId,
            form.OwnerName,
            form.File.FileName,
            buffer.Length,
            contentHash);

        var result = await documentService.UploadAsync(request, cancellationToken);

        return result switch
        {
            UploadDocumentResult.Duplicate d => Conflict(new { duplicate = true, existing = d.Existing }),
            UploadDocumentResult.Created c => Created($"/api/documents/{c.Id}", new { duplicate = false, id = c.Id, title = c.Title }),
            _ => Problem(),
        };
    }
}
