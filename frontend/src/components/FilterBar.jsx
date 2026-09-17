import "./FilterBar.css";

const durationOptions = [
  { value: "all", label: "Any length" },
  { value: "short", label: "1-2 days" },
  { value: "medium", label: "3-4 days" },
  { value: "long", label: "5+ days" },
];

const priceOptions = [
  { value: "all", label: "Any price" },
  { value: "under7000", label: "Under ₱7,000" },
  { value: "7000to10000", label: "₱7,000 - ₱10,000" },
  { value: "over10000", label: "₱10,000+" },
];

export default function FilterBar({ regions, tags, filters, onChange, onClear }) {
  const toggleTag = (tag) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: next });
  };

  return (
    <div className="filter-bar">
      <div className="filter-bar__row">
        <select
          value={filters.region}
          onChange={(e) => onChange({ ...filters, region: e.target.value })}
          aria-label="Filter by region"
        >
          <option value="all">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={filters.duration}
          onChange={(e) => onChange({ ...filters, duration: e.target.value })}
          aria-label="Filter by duration"
        >
          {durationOptions.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <select
          value={filters.price}
          onChange={(e) => onChange({ ...filters, price: e.target.value })}
          aria-label="Filter by price"
        >
          {priceOptions.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn btn-secondary filter-bar__clear"
          onClick={onClear}
        >
          Clear filters
        </button>
      </div>

      <div className="filter-bar__tags">
        {tags.map((tag) => (
          <button
            type="button"
            key={tag}
            className={`filter-bar__tag ${filters.tags.includes(tag) ? "is-active" : ""}`}
            onClick={() => toggleTag(tag)}
            aria-pressed={filters.tags.includes(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
