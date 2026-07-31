import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { DocumentList } from "./components/DocumentList";
import { Filters } from "./components/Filters";
import { Pagination } from "./components/Pagination";
import { SearchBar } from "./components/SearchBar";
import { useDebounce } from "./hooks/useDebounce";
import { useDocuments } from "./hooks/useDocuments";
import type { DocumentFilters } from "./types";

const PAGE_SIZE = 20;

const EMPTY_FILTERS: DocumentFilters = { type: "", ownerId: "", from: "", to: "" };

export default function App() {
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<DocumentFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(searchInput, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filters.type, filters.ownerId, filters.from, filters.to]);

  const { data, isLoading, isError, error, isFetching, refetch } = useDocuments({
    q: debouncedQuery || undefined,
    type: filters.type || undefined,
    ownerId: filters.ownerId ? Number(filters.ownerId) : undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  // Owner options are accumulated from documents we've actually fetched,
  // not hardcoded — there's no /api/owners endpoint yet, so this is a
  // stand-in. Owners are kept once seen so the dropdown doesn't shrink to
  // "only the currently filtered owner" after you pick one. Replace with a
  // real /api/owners endpoint when one exists.
  const [knownOwners, setKnownOwners] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!data) return;
    setKnownOwners((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const item of data.items) {
        if (next[item.ownerId] !== item.ownerName) {
          next[item.ownerId] = item.ownerName;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [data]);

  const owners = useMemo(
    () =>
      Object.entries(knownOwners)
        .map(([id, name]) => ({ id: Number(id), name }))
        .sort((a, b) => a.name.localeCompare(b.name, "tr")),
    [knownOwners]
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const total = data?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;
  const isRefreshing = isFetching && !isLoading;

  return (
    <main className="page">
      <h1>Doküman Arama</h1>

      <SearchBar value={searchInput} onChange={setSearchInput} />

      <Filters
        filters={filters}
        owners={owners}
        activeCount={activeFilterCount}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

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
