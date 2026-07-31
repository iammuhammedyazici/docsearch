import type { DocumentListItem, PagedResult } from "../types";

export interface FetchDocumentsParams {
  q?: string;
  type?: string;
  ownerId?: number;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchDocuments(
  params: FetchDocumentsParams
): Promise<PagedResult<DocumentListItem>> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.type) searchParams.set("type", params.type);
  if (params.ownerId != null) searchParams.set("ownerId", String(params.ownerId));
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.pageSize != null) searchParams.set("pageSize", String(params.pageSize));

  const response = await fetch(`/api/documents?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Dokümanlar yüklenemedi (HTTP ${response.status})`);
  }

  return (await response.json()) as PagedResult<DocumentListItem>;
}
