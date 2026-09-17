import { X, MapPin, UtensilsCrossed, BedDouble, Car } from "lucide-react";
import { getTourById } from "../data/tours";
import "./ItineraryPreview.css";

export default function ItineraryPreview({ tripPlan, totalPrice, onClose }) {
  const mealLabel = (meals) => {
    const included = [];
    if (meals.breakfast) included.push("Breakfast");
    if (meals.lunch) included.push("Lunch");
    if (meals.dinner) included.push("Dinner");
    return included.length > 0 ? included.join(", ") : "Not included";
  };

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal__header">
          <h2>Itinerary Preview</h2>
          <button
            type="button"
            className="preview-modal__close"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X size={22} />
          </button>
        </div>

        <div className="preview-modal__body">
          {tripPlan.days.map((day) => (
            <div key={day.dayNumber} className="preview-day">
              <h3>Day {day.dayNumber}</h3>

              {day.items.length > 0 ? (
                <ul className="preview-day__tours">
                  {day.items.map((item, i) => {
                    const tour = getTourById(item.tourId);
                    return (
                      <li key={i}>
                        <span>{item.title}</span>
                        {tour && (
                          <span className="preview-day__meta">
                            <MapPin size={12} /> {tour.region} · ₱
                            {tour.price.toLocaleString()}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="preview-day__none">No tours scheduled.</p>
              )}

              <div className="preview-day__details">
                <span>
                  <UtensilsCrossed size={14} /> {mealLabel(day.meals)}
                </span>
                <span>
                  <BedDouble size={14} />{" "}
                  {day.accommodation.name
                    ? `${day.accommodation.name}${
                        day.accommodation.location ? ` — ${day.accommodation.location}` : ""
                      }`
                    : "No accommodation set"}
                </span>
                <span>
                  <Car size={14} /> {day.transportation || "No transport set"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="preview-modal__footer">
          <span>Estimated total</span>
          <strong>₱{totalPrice.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}
