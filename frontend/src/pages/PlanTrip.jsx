import { Link } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import "./Placeholder.css";

// Full drag-to-reorder day timeline arrives in Phase 3 per
// docs/PROJECT_PLAN.md. This confirms TripContext state is readable here.
export default function PlanTrip() {
  const { tripPlan, totalItems, totalPrice, removeItem } = useTrip();

  return (
    <div className="container placeholder">
      <span className="placeholder__tag">Phase 3 will build this out</span>
      <h1>Plan Your Trip</h1>

      {totalItems === 0 ? (
        <>
          <p>Your trip is empty. Browse tours to start planning.</p>
          <Link to="/tours" className="btn btn-primary">Browse Tours</Link>
        </>
      ) : (
        <>
          {tripPlan.days.map((day) => (
            <div key={day.dayNumber} style={{ marginBottom: "1.5rem" }}>
              <h3>Day {day.dayNumber}</h3>
              {day.items.length === 0 ? (
                <p>Nothing added yet.</p>
              ) : (
                <ul>
                  {day.items.map((item, i) => (
                    <li key={i} style={{ marginBottom: "0.4rem" }}>
                      {item.title}{" "}
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem" }}
                        onClick={() => removeItem(day.dayNumber, i)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <p><strong>Total: ₱{totalPrice.toLocaleString()}</strong></p>
          <Link to="/booking" className="btn btn-primary">Proceed to Booking</Link>
        </>
      )}
    </div>
  );
}
