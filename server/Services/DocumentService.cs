using System.Text;
using Dapper;
using DocSearch.Api.Models;
using Npgsql;

namespace DocSearch.Api.Services;

public sealed class DocumentService(NpgsqlDataSource dataSource) : IDocumentService
{
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    public async Task<PagedResult<DocumentListItem>> SearchAsync(DocumentQuery query, CancellationToken cancellationToken)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize switch
        {
            < 1 => DefaultPageSize,
            > MaxPageSize => MaxPageSize,
            var n => n,
        };
        var hasQuery = !string.IsNullOrWhiteSpace(query.Q);

        var parameters = new DynamicParameters();
        var where = new StringBuilder("WHERE 1=1");

        if (!string.IsNullOrWhiteSpace(query.Type))
        {
            where.Append(" AND d.doc_type = @Type");
            parameters.Add("Type", query.Type);
        }

        if (query.OwnerId is not null)
        {
            where.Append(" AND d.owner_id = @OwnerId");
            parameters.Add("OwnerId", query.OwnerId);
        }

        if (query.From is not null)
        {
            where.Append(" AND d.created_at >= @From");
            parameters.Add("From", query.From);
        }

        if (query.To is not null)
        {
            where.Append(" AND d.created_at <= @To");
            parameters.Add("To", query.To);
        }

        if (hasQuery)
        {
            where.Append(" AND (s.search_text LIKE '%' || unaccent(lower(@Q)) || '%' OR s.search_text % unaccent(lower(@Q)))");
            parameters.Add("Q", query.Q);
        }

        var join = hasQuery ? "JOIN document_search s ON s.document_id = d.id" : "";
        var orderBy = hasQuery
            ? "ORDER BY similarity(s.search_text, unaccent(lower(@Q))) DESC, d.created_at DESC"
            : "ORDER BY d.created_at DESC";

        var sql = $"""
            SELECT d.id AS "Id", d.title AS "Title", d.file_name AS "FileName", d.doc_type AS "DocType",
                   d.owner_id AS "OwnerId", d.owner_name AS "OwnerName", d.file_size AS "FileSize", d.created_at AS "CreatedAt"
            FROM documents d
            {join}
            {where}
            {orderBy}
            LIMIT @PageSize OFFSET @Offset
            """;

        var countSql = $"""
            SELECT COUNT(*)
            FROM documents d
            {join}
            {where}
            """;

        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);

        var total = await connection.ExecuteScalarAsync<int>(new CommandDefinition(countSql, parameters, cancellationToken: cancellationToken));

        parameters.Add("PageSize", pageSize);
        parameters.Add("Offset", (page - 1) * pageSize);
        var items = await connection.QueryAsync<DocumentListItem>(new CommandDefinition(sql, parameters, cancellationToken: cancellationToken));

        return new PagedResult<DocumentListItem>(items.AsList(), total, page, pageSize);
    }

    public async Task<UploadDocumentResult> UploadAsync(UploadDocumentRequest request, CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);

        var existing = await connection.QuerySingleOrDefaultAsync<ExistingDocumentSummary>(
            new CommandDefinition("""
                SELECT d.id AS "Id", d.title AS "Title", d.file_name AS "FileName", d.doc_type AS "DocType",
                       d.owner_name AS "OwnerName", d.created_at AS "CreatedAt"
                FROM document_search s
                JOIN documents d ON d.id = s.document_id
                WHERE s.content_hash = @ContentHash
                """,
                new { request.ContentHash },
                cancellationToken: cancellationToken));

        if (existing is not null)
        {
            return new UploadDocumentResult.Duplicate(existing);
        }

        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        var storagePath = $"/store/uploads/{request.FileName}";

        var id = await connection.ExecuteScalarAsync<long>(new CommandDefinition("""
            INSERT INTO documents (title, file_name, doc_type, owner_id, owner_name, file_size, storage_path, created_at)
            VALUES (@Title, @FileName, @DocType, @OwnerId, @OwnerName, @FileSize, @StoragePath, now())
            RETURNING id
            """,
            new
            {
                request.Title,
                request.FileName,
                request.DocType,
                request.OwnerId,
                request.OwnerName,
                request.FileSize,
                StoragePath = storagePath,
            },
            transaction,
            cancellationToken: cancellationToken));

        await connection.ExecuteAsync(new CommandDefinition("""
            INSERT INTO document_search (document_id, search_text, content_hash)
            VALUES (@DocumentId, unaccent(lower(@SearchText)), @ContentHash)
            """,
            new
            {
                DocumentId = id,
                SearchText = $"{request.Title} {request.FileName}",
                request.ContentHash,
            },
            transaction,
            cancellationToken: cancellationToken));

        await transaction.CommitAsync(cancellationToken);

        return new UploadDocumentResult.Created(id, request.Title);
    }
}
