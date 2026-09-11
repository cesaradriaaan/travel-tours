import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, MapPin, Copy, GripVertical, Eye } from "lucide-react";
import { useTrip } from "../context/TripContext";
import { getTourById } from "../data/tours";
import ItineraryPreview from "../components/ItineraryPreview";
import "./PlanTrip.css";

const transportOptions = ["Van", "Bus", "Boat", "Flight", "Tricycle", "Other"];

export default function PlanTrip() {
  const {
    tripPlan,
    totalItems,
    totalPrice,
    removeItem,
    moveItem,
    addDay,
    removeDay,
    moveDayOrder,
    duplicateDay,
    updateDayMeals,
    updateDayAccommodation,
    updateDayTransportation,
  } = useTrip();

  const [dragIndex, setDragIndex] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const dayNumbers = tripPlan.days.map((d) => d.dayNumber);

  const hasContent = (day) =>
    day.items.length > 0 ||
    day.meals.breakfast ||
    day.meals.lunch ||
    day.meals.dinner ||
    day.accommodation.name ||
    day.accommodation.location ||
    day.transportation;

  const handleRemoveDay = (day) => {
    if (tripPlan.days.length === 1) return;
    if (hasContent(day)) {
      const ok = window.confirm(
        `Remove Day ${day.dayNumber}? This will delete its tours and details.`
      );
      if (!ok) return;
    }
    removeDay(day.dayNumber);
  };

  const handleDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    moveDayOrder(dragIndex, index);
    setDragIndex(null);
  };

  return (
    <div className="container plan-trip">
      <span className="eyebrow">Your itinerary</span>
      <h1>Plan Your Trip</h1>

      {totalItems === 0 ? (
        <div className="plan-trip__empty">
          <p>Your trip is empty. Browse tours to start planning.</p>
          <Link to="/tours" className="btn btn-primary">
            Browse Tours
          </Link>
        </div>
      ) : (
        <>
          <p className="plan-trip__intro">
            Drag the handle to reorder days. Move tours between days, add meals,
            accommodation, and transport details for each day.
          </p>

          <div className="plan-trip__days">
            {tripPlan.days.map((day, dayIndex) => (
              <div
                key={day.dayNumber}
                className={`trip-day ${dragIndex === dayIndex ? "is-dragging" : ""}`}
                draggable
                onDragStart={() => setDragIndex(dayIndex)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(dayIndex)}
                onDragEnd={() => setDragIndex(null)}
              >
                <div className="trip-day__header">
                  <span className="trip-day__drag" aria-label="Drag to reorder day">
                    <GripVertical size={18} />
                  </span>
                  <span className="trip-day__badge">Day {day.dayNumber}</span>
                  <div className="trip-day__header-actions">
                    <button
                      className="trip-day__icon-btn"
                      onClick={() => duplicateDay(day.dayNumber)}
                      aria-label={`Duplicate Day ${day.dayNumber}`}
                      title="Duplicate this day"
                    >
                      <Copy size={16} />
                    </button>
                    {tripPlan.days.length > 1 && (
                      <button
                        className="trip-day__icon-btn"
                        onClick={() => handleRemoveDay(day)}
                        aria-label={`Remove Day ${day.dayNumber}`}
                        title="Remove this day"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {day.items.length === 0 ? (
                  <p className="trip-day__empty">Nothing added to this day yet.</p>
                ) : (
                  <ul className="trip-day__items">
                    {day.items.map((item, index) => {
                      const tour = getTourById(item.tourId);
                      return (
                        <li key={`${item.tourId}-${index}`} className="trip-item">
                          {tour && (
                            <img
                              src={tour.images[0]}
                              alt=""
                              className="trip-item__thumb"
                            />
                          )}
                          <div className="trip-item__info">
                            <div className="trip-item__title">{item.title}</div>
                            {tour && (
                              <div className="trip-item__meta">
                                <span>
                                  <MapPin size={12} /> {tour.region}
                                </span>
                                <span>₱{tour.price.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="trip-item__actions">
                            <select
                              value={day.dayNumber}
                              onChange={(e) =>
                                moveItem(day.dayNumber, index, Number(e.target.value))
                              }
                              aria-label={`Move ${item.title} to a different day`}
                            >
                              {dayNumbers.map((n) => (
                                <option key={n} value={n}>
                                  Move to Day {n}
                                </option>
                              ))}
                            </select>
                            <button
                              className="trip-item__remove"
                              onClick={() => removeItem(day.dayNumber, index)}
                              aria-label={`Remove ${item.title}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="trip-day__extras">
                  <div className="trip-day__meals">
                    <span className="trip-day__extras-label">Meals</span>
                    {["breakfast", "lunch", "dinner"].map((meal) => (
                      <label key={meal} className="trip-day__checkbox">
                        <input
                          type="checkbox"
                          checked={day.meals[meal]}
                          onChange={(e) =>
                            updateDayMeals(day.dayNumber, meal, e.target.checked)
                          }
                        />
                        {meal[0].toUpperCase() + meal.slice(1)}
                      </label>
                    ))}
                  </div>

                  <div className="trip-day__accommodation">
                    <span className="trip-day__extras-label">Accommodation</span>
                    <input
                      type="text"
                      placeholder="Hotel / resort name"
                      value={day.accommodation.name}
                      onChange={(e) =>
                        updateDayAccommodation(day.dayNumber, "name", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={day.accommodation.location}
                      onChange={(e) =>
                        updateDayAccommodation(day.dayNumber, "location", e.target.value)
                      }
                    />
                  </div>

                  <div className="trip-day__transport">
                    <span className="trip-day__extras-label">Transportation</span>
                    <select
                      value={day.transportation}
                      onChange={(e) =>
                        updateDayTransportation(day.dayNumber, e.target.value)
                      }
                    >
                      <option value="">None selected</option>
                      {transportOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="plan-trip__toolbar">
            <button className="btn btn-secondary" onClick={addDay}>
              <Plus size={16} /> Add another day
            </button>
            <button className="btn btn-secondary" onClick={() => setShowPreview(true)}>
              <Eye size={16} /> Preview Itinerary
            </button>
          </div>

          <div className="plan-trip__summary">
            <div>
              <div className="plan-trip__summary-label">
                {totalItems} {totalItems === 1 ? "tour" : "tours"} across{" "}
                {tripPlan.days.length} {tripPlan.days.length === 1 ? "day" : "days"}
              </div>
              <div className="plan-trip__summary-total">
                ₱{totalPrice.toLocaleString()} <small>total</small>
              </div>
            </div>
            <Link to="/booking" className="btn btn-primary">
              Proceed to Booking
            </Link>
          </div>
        </>
      )}

      {showPreview && (
        <ItineraryPreview
          tripPlan={tripPlan}
          totalPrice={totalPrice}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
