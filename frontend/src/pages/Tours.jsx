import { useMemo, useState } from "react";
import TourCard from "../components/TourCard";
import FilterBar from "../components/FilterBar";
import { tours } from "../data/tours";
import "./Tours.css";

const emptyFilters = { region: "all", tags: [], duration: "all", price: "all" };

export default function Tours() {
  const [filters, setFilters] = useState(emptyFilters);

  const regions = useMemo(
    () => [...new Set(tours.map((t) => t.region))].sort(),
    []
  );
  const allTags = useMemo(
    () => [...new Set(tours.flatMap((t) => t.tags))].sort(),
    []
  );

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      if (filters.region !== "all" && t.region !== filters.region) return false;
      if (
        filters.tags.length > 0 &&
        !filters.tags.every((tag) => t.tags.includes(tag))
      )
        return false;
      if (filters.duration === "short" && t.durationDays > 2) return false;
      if (
        filters.duration === "medium" &&
        (t.durationDays < 3 || t.durationDays > 4)
      )
        return false;
      if (filters.duration === "long" && t.durationDays < 5) return false;
      if (filters.price === "under7000" && t.price >= 7000) return false;
      if (
        filters.price === "7000to10000" &&
        (t.price < 7000 || t.price > 10000)
      )
        return false;
      if (filters.price === "over10000" && t.price <= 10000) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="container tours-page">
      <span className="eyebrow">All tours</span>
      <h1>Browse every Philippine tour</h1>
      <p>Filter by region, trip length, price, or tags to find your fit.</p>

      <FilterBar
        regions={regions}
        tags={allTags}
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(emptyFilters)}
      />

      {filtered.length === 0 ? (
        <div className="tours-empty">
          <p>No tours match these filters.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setFilters(emptyFilters)}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="tours-grid">
          {filtered.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}
