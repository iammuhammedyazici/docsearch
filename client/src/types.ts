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
