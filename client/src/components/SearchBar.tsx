interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      className="search-input"
      type="text"
      placeholder="Başlık veya dosya adına göre ara…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
