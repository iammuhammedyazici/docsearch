import { useEffect, useState } from "react";
import "./App.css";
import { DocumentList } from "./components/DocumentList";
import { Pagination } from "./components/Pagination";
import { SearchBar } from "./components/SearchBar";
import { useDebounce } from "./hooks/useDebounce";
import { useDocuments } from "./hooks/useDocuments";

const PAGE_SIZE = 20;

export default function App() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(searchInput, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const { data, isLoading, isError, error, isFetching, refetch } = useDocuments({
    q: debouncedQuery || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const total = data?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;
  const isRefreshing = isFetching && !isLoading;

  return (
    <main className="page">
      <h1>Doküman Arama</h1>

      <SearchBar value={searchInput} onChange={setSearchInput} />

      <div className="summary">
        {!isLoading && !isError && data && `${total} doküman`}
      </div>

      {isLoading && <div className="state-box">Yükleniyor…</div>}

      {isError && (
        <div className="state-box error">
          <div>{error instanceof Error ? error.message : "Bir hata oluştu."}</div>
          <button className="retry-button" onClick={() => refetch()}>
            Tekrar dene
          </button>
        </div>
      )}

      {!isLoading && !isError && data && total === 0 && (
        <div className="state-box">
          {debouncedQuery
            ? `"${debouncedQuery}" için sonuç bulunamadı.`
            : "Sonuç bulunamadı."}
        </div>
      )}

      {!isLoading && !isError && data && total > 0 && (
        <>
          <DocumentList items={data.items} isRefreshing={isRefreshing} />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrevious={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </>
      )}
    </main>
  );
}
