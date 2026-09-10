import { createContext, useContext, useMemo, useState } from "react";
import { getTourById } from "../data/tours";

const TripContext = createContext(null);

// TripPlan shape: { days: [ { dayNumber, items: [ { tourId, title, notes } ] } ] }
const emptyPlan = { days: [{ dayNumber: 1, items: [] }] };

export function TripProvider({ children }) {
  const [tripPlan, setTripPlan] = useState(emptyPlan);

  const addTourToTrip = (tourId, dayNumber = 1) => {
    const tour = getTourById(tourId);
    if (!tour) return;

    setTripPlan((prev) => {
      const days = prev.days.some((d) => d.dayNumber === dayNumber)
        ? prev.days
        : [...prev.days, { dayNumber, items: [] }];

      return {
        days: days.map((d) =>
          d.dayNumber === dayNumber
            ? { ...d, items: [...d.items, { tourId: tour.id, title: tour.title }] }
            : d
        ),
      };
    });
  };

  const removeItem = (dayNumber, index) => {
    setTripPlan((prev) => ({
      days: prev.days.map((d) =>
        d.dayNumber === dayNumber
          ? { ...d, items: d.items.filter((_, i) => i !== index) }
          : d
      ),
    }));
  };

  const addDay = () => {
    setTripPlan((prev) => {
      const nextDayNumber =
        prev.days.length > 0
          ? Math.max(...prev.days.map((d) => d.dayNumber)) + 1
          : 1;
      return { days: [...prev.days, { dayNumber: nextDayNumber, items: [] }] };
    });
  };

  const clearTrip = () => setTripPlan(emptyPlan);

  const totalItems = useMemo(
    () => tripPlan.days.reduce((sum, d) => sum + d.items.length, 0),
    [tripPlan]
  );

  const totalPrice = useMemo(
    () =>
      tripPlan.days.reduce((sum, d) => {
        const dayTotal = d.items.reduce((s, item) => {
          const tour = getTourById(item.tourId);
          return s + (tour ? tour.price : 0);
        }, 0);
        return sum + dayTotal;
      }, 0),
    [tripPlan]
  );

  const value = {
    tripPlan,
    addTourToTrip,
    removeItem,
    addDay,
    clearTrip,
    totalItems,
    totalPrice,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used within a TripProvider");
  return ctx;
}
