import Button from './Button.jsx';

export default function SearchFilterBar({ search, onSearch, filters = [], sort, onClear, placeholder = 'Search…' }) {
  const hasActive =
    !!search ||
    filters.some((f) => f.value && f.value !== 'all') ||
    (sort && sort.value && sort.value !== sort.defaultValue);

  return (
    <div className="search-bar">
      <div className="search-bar__row">
        <div>
          <label htmlFor="filter-search">Search</label>
          <input
            id="filter-search"
            type="search"
            value={search}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder={placeholder}
          />
        </div>
        {filters.map((f) => (
          <div key={f.name}>
            <label htmlFor={`filter-${f.name}`}>{f.label}</label>
            <select
              id={`filter-${f.name}`}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        {sort && (
          <div>
            <label htmlFor="filter-sort">Sort</label>
            <select
              id="filter-sort"
              value={sort.value}
              onChange={(e) => sort.onChange(e.target.value)}
            >
              {sort.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={onClear}
          disabled={!hasActive}
          aria-label="Clear filters"
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
