import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  ReceiptText,
} from "lucide-react";

import { getMyBookings } from "../services/api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyBookings();

        setBookings(data.bookings || []);
      } catch (error) {
        setError(
          error.message ||
            "Unable to load your bookings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  function formatDate(date) {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString(
      "en-PH",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  function getStatusStyle(status) {
    switch (status) {
      case "Confirmed":
        return {
          background: "#dcfce7",
          color: "#166534",
        };

      case "Reviewing":
        return {
          background: "#fef3c7",
          color: "#92400e",
        };

      case "Cancelled":
        return {
          background: "#fee2e2",
          color: "#991b1b",
        };

      default:
        return {
          background: "#e0f2fe",
          color: "#075985",
        };
    }
  }

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "4rem 0" }}
      >
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{
        paddingTop: "4rem",
        paddingBottom: "5rem",
      }}
    >
      <span className="eyebrow">
        Your Trips
      </span>

      <h1>My Bookings</h1>

      <p>
        View your AddyVenture booking
        requests and their current status.
      </p>

      {error && (
        <p
          role="alert"
          style={{
            marginTop: "2rem",
          }}
        >
          <strong>Error:</strong> {error}
        </p>
      )}

      {!error && bookings.length === 0 && (
        <div
          style={{
            marginTop: "2rem",
            padding: "2rem",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            background: "var(--white)",
          }}
        >
          <h3>No bookings yet</h3>

          <p>
            Start planning your next
            Philippine adventure.
          </p>

          <Link
            to="/tours"
            className="btn btn-primary"
          >
            Explore Tours
          </Link>
        </div>
      )}

      {bookings.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: "1.25rem",
            marginTop: "2rem",
          }}
        >
          {bookings.map((booking) => (
            <article
              key={booking.id}
              style={{
                background: "var(--white)",
                border:
                  "1px solid var(--line)",
                borderRadius:
                  "var(--radius-md)",
                padding: "1.5rem",
                boxShadow:
                  "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div>
                  <small>
                    Booking Reference
                  </small>

                  <h3
                    style={{
                      marginTop: "0.25rem",
                      marginBottom: 0,
                    }}
                  >
                    {booking.bookingReference}
                  </h3>
                </div>

                <span
                  style={{
                    ...getStatusStyle(
                      booking.status
                    ),
                    padding:
                      "0.4rem 0.8rem",
                    borderRadius: "999px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  {booking.status}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "1rem",
                  marginTop: "1.5rem",
                }}
              >
                <div>
                  <CalendarDays
                    size={18}
                  />

                  <strong
                    style={{
                      display: "block",
                      marginTop: "0.35rem",
                    }}
                  >
                    Travel Date
                  </strong>

                  <span>
                    {formatDate(
                      booking.travelDate
                    )}
                  </span>
                </div>

                <div>
                  <Users size={18} />

                  <strong
                    style={{
                      display: "block",
                      marginTop: "0.35rem",
                    }}
                  >
                    Travelers
                  </strong>

                  <span>
                    {booking.travelerCount}
                  </span>
                </div>

                <div>
                  <MapPin size={18} />

                  <strong
                    style={{
                      display: "block",
                      marginTop: "0.35rem",
                    }}
                  >
                    Duration
                  </strong>

                  <span>
                    {booking.tripDays} days /{" "}
                    {booking.tripNights} nights
                  </span>
                </div>

                <div>
                  <ReceiptText
                    size={18}
                  />

                  <strong
                    style={{
                      display: "block",
                      marginTop: "0.35rem",
                    }}
                  >
                    Estimated Total
                  </strong>

                  <span>
                    ₱
                    {Number(
                      booking.estimatedTotal ||
                        0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                }}
              >
                <Link
                  to={`/my-bookings/${booking.id}`}
                  className="btn btn-secondary"
                >
                  View Booking
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}