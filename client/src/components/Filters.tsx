import type { DocumentFilters, OwnerOption } from "../types";

interface FiltersProps {
  filters: DocumentFilters;
  owners: OwnerOption[];
  activeCount: number;
  onChange: (patch: Partial<DocumentFilters>) => void;
  onClear: () => void;
}

export function Filters({ filters, owners, activeCount, onChange, onClear }: FiltersProps) {
  return (
    <div className="filters">
      <label className="filter-field">
        Doküman tipi
        <select value={filters.type} onChange={(e) => onChange({ type: e.target.value })}>
          <option value="">Tümü</option>
          <option value="sozlesme">Sözleşme</option>
          <option value="teklif">Teklif</option>
          <option value="fatura">Fatura</option>
        </select>
      </label>

      <label className="filter-field">
        Sahip
        <select value={filters.ownerId} onChange={(e) => onChange({ ownerId: e.target.value })}>
          <option value="">Tümü</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        Başlangıç
        <input
          type="date"
          value={filters.from}
          onChange={(e) => onChange({ from: e.target.value })}
        />
      </label>

      <label className="filter-field">
        Bitiş
        <input type="date" value={filters.to} onChange={(e) => onChange({ to: e.target.value })} />
      </label>

      <div className="filters-footer">
        {activeCount > 0 && <span className="filters-count">{activeCount} filtre aktif</span>}
        <button
          type="button"
          className="clear-filters-button"
          disabled={activeCount === 0}
          onClick={onClear}
        >
          Filtreleri temizle
        </button>
      </div>
    </div>
  );
}
