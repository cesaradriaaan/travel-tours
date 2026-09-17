import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CalendarX2,
  MapPin,
  ReceiptText,
  Users,
} from "lucide-react";

import { getMyBookings } from "../services/api";
import "./MyBookings.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyBookings({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setBookings(data.bookings || []);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          loadError.message ||
            "Unable to load your bookings."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      controller.abort();
    };
  }, []);

  function formatDate(date) {
    if (!date) {
      return "Not set";
    }

    return new Date(date).toLocaleDateString(
      "en-PH",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  function getStatusClass(status) {
    switch (status) {
      case "Confirmed":
        return "is-confirmed";
      case "Reviewing":
        return "is-reviewing";
      case "Cancelled":
        return "is-cancelled";
      case "Cancellation Requested":
        return "is-cancellation-requested";
      default:
        return "is-received";
    }
  }

  if (loading) {
    return (
      <div className="route-state" role="status" aria-live="polite">
        <span className="route-state__pulse" aria-hidden="true" />
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="container bookings-list-page">
      <header className="bookings-list-hero">
        <span className="eyebrow">Your Trips</span>
        <h1>My Bookings</h1>
        <p>
          View your AddyVenture booking requests and their current status.
        </p>
      </header>

      {error && (
        <div className="page-alert page-alert--error" role="alert">
          <strong>Unable to load bookings</strong>
          <p>{error}</p>
        </div>
      )}

      {!error && bookings.length === 0 && (
        <section className="bookings-empty" aria-labelledby="bookings-empty-title">
          <span className="bookings-empty__icon" aria-hidden="true">
            <CalendarX2 size={29} />
          </span>
          <h2 id="bookings-empty-title">No bookings yet</h2>
          <p>Start planning your next Philippine adventure.</p>
          <Link to="/tours" className="btn btn-primary">
            Explore Tours
          </Link>
        </section>
      )}

      {bookings.length > 0 && (
        <div className="bookings-list" aria-label="Your booking requests">
          {bookings.map((booking) => (
            <article key={booking.id} className="booking-list-card">
              <div className="booking-list-card__header">
                <div>
                  <span className="booking-list-card__label">
                    Booking reference
                  </span>
                  <h2>{booking.bookingReference}</h2>
                </div>

                <span
                  className={`booking-list-status ${getStatusClass(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="booking-list-card__details">
                <div>
                  <CalendarDays size={19} aria-hidden="true" />
                  <span>
                    <small>Travel date</small>
                    <strong>{formatDate(booking.travelDate)}</strong>
                  </span>
                </div>

                <div>
                  <Users size={19} aria-hidden="true" />
                  <span>
                    <small>Travelers</small>
                    <strong>{booking.travelerCount}</strong>
                  </span>
                </div>

                <div>
                  <MapPin size={19} aria-hidden="true" />
                  <span>
                    <small>Duration</small>
                    <strong>
                      {booking.tripDays} days / {booking.tripNights} nights
                    </strong>
                  </span>
                </div>

                <div>
                  <ReceiptText size={19} aria-hidden="true" />
                  <span>
                    <small>Estimated total</small>
                    <strong>
                      ₱
                      {Number(
                        booking.estimatedTotal || 0
                      ).toLocaleString()}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="booking-list-card__footer">
                <Link
                  to={`/my-bookings/${booking.id}`}
                  className="btn btn-secondary"
                >
                  View Booking
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
