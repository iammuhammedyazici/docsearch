const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function docTypeBadgeClass(docType: string): string {
  switch (docType) {
    case "sozlesme":
      return "badge badge-sozlesme";
    case "teklif":
      return "badge badge-teklif";
    case "fatura":
      return "badge badge-fatura";
    default:
      return "badge badge-default";
  }
}
