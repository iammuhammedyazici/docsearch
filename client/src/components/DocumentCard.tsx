import type { DocumentListItem } from "../types";
import { docTypeBadgeClass, formatDate, formatFileSize } from "../utils/format";

interface DocumentCardProps {
  document: DocumentListItem;
}

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <li className="card">
      <div className="card-title-row">
        <span className="card-title">{document.title}</span>
        <span className={docTypeBadgeClass(document.docType)}>{document.docType}</span>
      </div>
      <div className="card-meta">
        <span>{document.ownerName}</span>
        <span>·</span>
        <span>{formatDate(document.createdAt)}</span>
        <span>·</span>
        <span>{formatFileSize(document.fileSize)}</span>
      </div>
    </li>
  );
}
