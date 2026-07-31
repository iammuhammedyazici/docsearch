namespace DocSearch.Api.Models;

public sealed record DocumentQuery(
    string? Q,
    string? Type,
    long? OwnerId,
    DateTime? From,
    DateTime? To,
    int Page,
    int PageSize);

public sealed record DocumentListItem(
    long Id,
    string Title,
    string FileName,
    string DocType,
    long OwnerId,
    string OwnerName,
    long FileSize,
    DateTime CreatedAt);

public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Total,
    int Page,
    int PageSize);
