import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getTourById } from "../data/tours";

const TripContext = createContext(null);

const STORAGE_KEY = "addyventure-trip-plan";
const SESSION_KEY = "addyventure-trip-session-v1";

function createSessionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `trip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadTripSessionId() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) return saved;
    const created = createSessionId();
    localStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return createSessionId();
  }
}

function makeDay(dayNumber, overrides = {}) {
  return {
    dayNumber,
    items: [],
    meals: { breakfast: false, lunch: false, dinner: false },
    accommodation: { name: "", location: "" },
    transportation: "",
    ...overrides,
  };
}

const emptyPlan = { days: [makeDay(1)] };

// Fills in any fields missing from older saved data so the app never
// crashes on a stale localStorage shape.
function sanitizePlan(raw) {
  if (!raw || !Array.isArray(raw.days) || raw.days.length === 0) return emptyPlan;
  return {
    days: raw.days.map((d, i) =>
      makeDay(d.dayNumber ?? i + 1, {
        items: Array.isArray(d.items) ? d.items : [],
        meals: { breakfast: false, lunch: false, dinner: false, ...(d.meals || {}) },
        accommodation: { name: "", location: "", ...(d.accommodation || {}) },
        transportation: d.transportation || "",
      })
    ),
  };
}

function loadInitialPlan() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyPlan;
    return sanitizePlan(JSON.parse(saved));
  } catch {
    return emptyPlan;
  }
}

function renumber(days) {
  return days.map((d, i) => ({ ...d, dayNumber: i + 1 }));
}

export function TripProvider({ children }) {
  const [tripPlan, setTripPlan] = useState(loadInitialPlan);
  const [tripSessionId, setTripSessionId] = useState(loadTripSessionId);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tripPlan));
    } catch {
      // localStorage unavailable (private browsing, etc.) — trip just won't persist
    }
  }, [tripPlan]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSION_KEY, tripSessionId);
    } catch {
      // Session identity is only used to keep booking drafts tied to the right trip.
    }
  }, [tripSessionId]);

  const isInTrip = (tourId) =>
    tripPlan.days.some((d) => d.items.some((item) => item.tourId === tourId));

  const findTourDay = (tourId) => {
    const day = tripPlan.days.find((d) => d.items.some((item) => item.tourId === tourId));
    return day ? day.dayNumber : null;
  };

  // Returns { success, reason, existingDay } so callers can give useful feedback.
  const addTourToTrip = (tourId, dayNumber = 1) => {
    const tour = getTourById(tourId);
    if (!tour) return { success: false, reason: "not-found" };

    if (isInTrip(tourId)) {
      return { success: false, reason: "duplicate", existingDay: findTourDay(tourId) };
    }

    setTripPlan((prev) => {
      const days = prev.days.some((d) => d.dayNumber === dayNumber)
        ? prev.days
        : [...prev.days, makeDay(dayNumber)];

      return {
        days: days.map((d) =>
          d.dayNumber === dayNumber
            ? { ...d, items: [...d.items, { tourId: tour.id, title: tour.title }] }
            : d
        ),
      };
    });

    return { success: true };
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

  const moveItem = (fromDay, index, toDay) => {
    if (fromDay === toDay) return;
    setTripPlan((prev) => {
      const source = prev.days.find((d) => d.dayNumber === fromDay);
      const item = source?.items[index];
      if (!item) return prev;

      return {
        days: prev.days.map((d) => {
          if (d.dayNumber === fromDay) {
            return { ...d, items: d.items.filter((_, i) => i !== index) };
          }
          if (d.dayNumber === toDay) {
            return { ...d, items: [...d.items, item] };
          }
          return d;
        }),
      };
    });
  };

  const addDay = () => {
    setTripPlan((prev) => ({
      days: [...prev.days, makeDay(prev.days.length + 1)],
    }));
  };

  // Removes a day and renumbers the rest sequentially, preserving their content and order.
  const removeDay = (dayNumber) => {
    setTripPlan((prev) => {
      const remaining = prev.days.filter((d) => d.dayNumber !== dayNumber);
      return { days: remaining.length > 0 ? renumber(remaining) : emptyPlan.days };
    });
  };

  // Reorders days by array position (drag-and-drop) and renumbers sequentially.
  const moveDayOrder = (fromIndex, toIndex) => {
    setTripPlan((prev) => {
      const days = [...prev.days];
      const [moved] = days.splice(fromIndex, 1);
      days.splice(toIndex, 0, moved);
      return { days: renumber(days) };
    });
  };

  // Copies a day's full content into a new day right after it, renumbering sequentially.
  const duplicateDay = (dayNumber) => {
    setTripPlan((prev) => {
      const index = prev.days.findIndex((d) => d.dayNumber === dayNumber);
      if (index === -1) return prev;
      const original = prev.days[index];
      const copy = makeDay(0, {
        items: original.items.map((item) => ({ ...item })),
        meals: { ...original.meals },
        accommodation: { ...original.accommodation },
        transportation: original.transportation,
      });
      const days = [...prev.days];
      days.splice(index + 1, 0, copy);
      return { days: renumber(days) };
    });
  };

  const updateDayMeals = (dayNumber, mealKey, value) => {
    setTripPlan((prev) => ({
      days: prev.days.map((d) =>
        d.dayNumber === dayNumber
          ? { ...d, meals: { ...d.meals, [mealKey]: value } }
          : d
      ),
    }));
  };

  const updateDayAccommodation = (dayNumber, field, value) => {
    setTripPlan((prev) => ({
      days: prev.days.map((d) =>
        d.dayNumber === dayNumber
          ? { ...d, accommodation: { ...d.accommodation, [field]: value } }
          : d
      ),
    }));
  };

  const updateDayTransportation = (dayNumber, value) => {
    setTripPlan((prev) => ({
      days: prev.days.map((d) =>
        d.dayNumber === dayNumber ? { ...d, transportation: value } : d
      ),
    }));
  };

  const clearTrip = () => {
    setTripPlan(emptyPlan);
    setTripSessionId(createSessionId());
  };

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
    tripSessionId,
    addTourToTrip,
    removeItem,
    moveItem,
    addDay,
    removeDay,
    moveDayOrder,
    duplicateDay,
    updateDayMeals,
    updateDayAccommodation,
    updateDayTransportation,
    clearTrip,
    isInTrip,
    findTourDay,
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
