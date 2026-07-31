using Microsoft.AspNetCore.Http;

namespace DocSearch.Api.Models;

public sealed class UploadDocumentForm
{
    public IFormFile File { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string DocType { get; set; } = string.Empty;
    public long OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
}

public sealed record UploadDocumentRequest(
    string Title,
    string DocType,
    long OwnerId,
    string OwnerName,
    string FileName,
    long FileSize,
    string ContentHash);

public sealed record ExistingDocumentSummary(
    long Id,
    string Title,
    string FileName,
    string DocType,
    string OwnerName,
    DateTime CreatedAt);

public abstract record UploadDocumentResult
{
    private UploadDocumentResult() { }

    public sealed record Duplicate(ExistingDocumentSummary Existing) : UploadDocumentResult;

    public sealed record Created(long Id, string Title) : UploadDocumentResult;
}
