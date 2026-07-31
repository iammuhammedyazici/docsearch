import type { DocumentListItem } from "../types";
import { DocumentCard } from "./DocumentCard";

interface DocumentListProps {
  items: DocumentListItem[];
  isRefreshing: boolean;
}

export function DocumentList({ items, isRefreshing }: DocumentListProps) {
  return (
    <ul className={`list${isRefreshing ? " is-refreshing" : ""}`}>
      {items.map((document) => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </ul>
  );
}
