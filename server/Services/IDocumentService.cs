using DocSearch.Api.Models;

namespace DocSearch.Api.Services;

public interface IDocumentService
{
    Task<PagedResult<DocumentListItem>> SearchAsync(DocumentQuery query, CancellationToken cancellationToken);

    Task<UploadDocumentResult> UploadAsync(UploadDocumentRequest request, CancellationToken cancellationToken);
}
