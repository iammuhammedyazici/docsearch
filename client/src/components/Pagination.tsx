interface PaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function Pagination({ page, totalPages, onPrevious, onNext }: PaginationProps) {
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={onPrevious}>
        Önceki
      </button>
      <span>
        Sayfa {page} / {totalPages}
      </span>
      <button disabled={page >= totalPages} onClick={onNext}>
        Sonraki
      </button>
    </div>
  );
}
