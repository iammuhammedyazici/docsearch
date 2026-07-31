import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchDocuments, type FetchDocumentsParams } from "../api/documents";

export function useDocuments(params: FetchDocumentsParams) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () => fetchDocuments(params),
    placeholderData: keepPreviousData,
  });
}
