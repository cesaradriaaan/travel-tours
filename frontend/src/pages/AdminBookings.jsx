import { useEffect, useMemo, useState } from "react";
import {
  getBookings,
  getBookingById,
  updateBookingStatus,
} from "../services/api";

const STATUSES = [
  "Request Received",
  "Reviewing",
  "Confirmed",
  "Cancelled",
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const result = await getBookings();
      setBookings(result.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      setUpdatingId(id);
      setError("");

      await updateBookingStatus(id, status);

      setBookings((current) =>
        current.map((booking) =>
          booking.id === id
            ? { ...booking, status }
            : booking
        )
      );

      if (selectedBooking?.id === id) {
        setSelectedBooking((current) => ({
          ...current,
          status,
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleViewDetails(id) {
    try {
      setDetailsLoading(true);
      setError("");

      const result = await getBookingById(id);
      setSelectedBooking(result.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  }

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !keyword ||
        booking.bookingReference?.toLowerCase().includes(keyword) ||
        booking.travelerName?.toLowerCase().includes(keyword) ||
        booking.email?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  if (loading) {
    return (
      <div className="container">
        <h1>Loading bookings...</h1>
      </div>
    );
  }

  return (
    <div className="container">
      <span className="eyebrow">Admin</span>
      <h1>Booking Management</h1>

      <p>
        View, search, filter, and manage submitted trip requests.
      </p>

      {error && (
        <p style={{ marginTop: "1rem" }}>
          Error: {error}
        </p>
      )}

      {/* SEARCH + FILTER */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginTop: "2rem",
          marginBottom: "1.5rem",
        }}
      >
        <input
          type="search"
          placeholder="Search booking code, traveler, or email..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          style={{
            flex: "1",
            minWidth: "260px",
            padding: "0.8rem",
          }}
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          style={{
            padding: "0.8rem",
          }}
        >
          <option value="All">
            All Statuses
          </option>

          {STATUSES.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}
        </select>

        <button
          className="btn btn-secondary"
          type="button"
          onClick={loadBookings}
        >
          Refresh
        </button>
      </div>

      <p>
        Showing{" "}
        <strong>{filteredBookings.length}</strong>{" "}
        of <strong>{bookings.length}</strong> bookings
      </p>

      {/* BOOKINGS TABLE */}
      <div
        style={{
          overflowX: "auto",
          marginTop: "1rem",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th align="left">Booking Code</th>
              <th align="left">Traveler</th>
              <th align="left">Travel Date</th>
              <th align="left">Travelers</th>
              <th align="left">Total</th>
              <th align="left">Status</th>
              <th align="left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <strong>
                    {booking.bookingReference}
                  </strong>
                </td>

                <td>
                  {booking.travelerName}
                  <br />
                  <small>
                    {booking.email}
                  </small>
                </td>

                <td>
                  {booking.travelDate}
                </td>

                <td>
                  {booking.travelerCount}
                </td>

                <td>
                  ₱
                  {Number(
                    booking.estimatedTotal
                  ).toLocaleString()}
                </td>

                <td>
                  <select
                    value={booking.status}
                    disabled={
                      updatingId === booking.id
                    }
                    onChange={(event) =>
                      handleStatusChange(
                        booking.id,
                        event.target.value
                      )
                    }
                  >
                    {STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      handleViewDetails(
                        booking.id
                      )
                    }
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBookings.length === 0 && (
        <p style={{ marginTop: "2rem" }}>
          No matching bookings found.
        </p>
      )}

      {detailsLoading && (
        <p style={{ marginTop: "2rem" }}>
          Loading booking details...
        </p>
      )}

      {/* DETAILS MODAL */}
      {selectedBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 9999,
          }}
          onClick={() =>
            setSelectedBooking(null)
          }
        >
          <div
            style={{
              background: "white",
              width: "min(800px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "16px",
              padding: "2rem",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() =>
                setSelectedBooking(null)
              }
              style={{
                float: "right",
              }}
            >
              Close
            </button>

            <span className="eyebrow">
              Booking Details
            </span>

            <h2>
              {selectedBooking.bookingReference}
            </h2>

            <p>
              <strong>Status:</strong>{" "}
              {selectedBooking.status}
            </p>

            <hr />

            <h3>Traveler</h3>

            <p>
              <strong>Name:</strong>{" "}
              {selectedBooking.travelerName}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {selectedBooking.email}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {selectedBooking.phone}
            </p>

            <p>
              <strong>Nationality:</strong>{" "}
              {selectedBooking.nationality || "—"}
            </p>

            <h3>Travel</h3>

            <p>
              <strong>Dates:</strong>{" "}
              {selectedBooking.travelDate} →{" "}
              {selectedBooking.travelEndDate}
            </p>

            <p>
              <strong>Duration:</strong>{" "}
              {selectedBooking.tripDays} days /{" "}
              {selectedBooking.tripNights} nights
            </p>

            <p>
              <strong>Travelers:</strong>{" "}
              {selectedBooking.travelerCount}
            </p>

            <p>
              <strong>Estimated Total:</strong>{" "}
              ₱
              {Number(
                selectedBooking.estimatedTotal
              ).toLocaleString()}
            </p>

            <h3>Emergency Contact</h3>

            <p>
              {selectedBooking.traveler
                ?.emergencyName || "None"}

              {selectedBooking.traveler
                ?.emergencyPhone
                ? ` · ${selectedBooking.traveler.emergencyPhone}`
                : ""}
            </p>

            <h3>Special Requests</h3>

            <p>
              {selectedBooking.traveler
                ?.specialRequests || "None"}
            </p>

            <h3>Itinerary</h3>

            {selectedBooking.tripPlan?.days?.map(
              (day) => (
                <div
                  key={day.dayNumber}
                  style={{
                    marginBottom: "1rem",
                  }}
                >
                  <strong>
                    Day {day.dayNumber}
                  </strong>

                  {day.items?.length > 0 ? (
                    <ul>
                      {day.items.map(
                        (item, index) => (
                          <li
                            key={`${item.tourId}-${index}`}
                          >
                            {item.title}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p>No tours.</p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}