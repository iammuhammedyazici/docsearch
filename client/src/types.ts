export interface DocumentListItem {
  id: number;
  title: string;
  fileName: string;
  docType: string;
  ownerId: number;
  ownerName: string;
  fileSize: number;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DocumentFilters {
  type: string;
  ownerId: string;
  from: string;
  to: string;
}

export interface OwnerOption {
  id: number;
  name: string;
}

export interface ExistingDocumentSummary {
  id: number;
  title: string;
  fileName: string;
  docType: string;
  ownerName: string;
  createdAt: string;
}

export type UploadDocumentResult =
  | { duplicate: false; id: number; title: string }
  | { duplicate: true; existing: ExistingDocumentSummary };
