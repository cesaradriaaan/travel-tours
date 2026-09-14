import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  X,
} from "lucide-react";

import {
  getBookings,
  getBookingById,
  updateBookingStatus,
  resolveBookingCancellation,
} from "../services/api";

import ConfirmModal from "../components/ConfirmModal";


const NORMAL_STATUSES = [
  "Request Received",
  "Reviewing",
  "Confirmed",
  "Cancelled",
];

const FILTER_STATUSES = [
  "Request Received",
  "Reviewing",
  "Confirmed",
  "Cancellation Requested",
  "Cancelled",
];


function formatCurrency(value) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value || 0)
  );
}


function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}


function getStatusColors(status) {
  switch (status) {
    case "Request Received":
      return {
        background:
          "rgba(14, 165, 233, 0.11)",
        color: "#036b91",
      };

    case "Reviewing":
      return {
        background:
          "rgba(139, 92, 246, 0.11)",
        color: "#6d3fc0",
      };

    case "Confirmed":
      return {
        background:
          "rgba(22, 163, 74, 0.11)",
        color: "#14783a",
      };

    case "Cancellation Requested":
      return {
        background:
          "rgba(245, 158, 11, 0.13)",
        color: "#915800",
      };

    case "Cancelled":
      return {
        background:
          "rgba(220, 38, 38, 0.09)",
        color: "#a11f1f",
      };

    default:
      return {
        background:
          "rgba(100, 116, 139, 0.1)",
        color: "#475569",
      };
  }
}


function StatusSelect({
  booking,
  disabled,
  onChange,
}) {
  const colors =
    getStatusColors(
      booking.status
    );

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <select
        value={booking.status}
        disabled={disabled}
        onChange={onChange}
        style={{
          appearance: "none",
          WebkitAppearance:
            "none",

          border: "none",
          outline: "none",

          borderRadius:
            "999px",

          padding:
            "0.55rem 2rem 0.55rem 0.85rem",

          background:
            colors.background,

          color:
            colors.color,

          font: "inherit",

          fontSize:
            "0.82rem",

          fontWeight: 800,

          cursor:
            disabled
              ? "wait"
              : "pointer",
        }}
      >
        {NORMAL_STATUSES.map(
          (status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          )
        )}
      </select>

      <ChevronDown
        size={15}
        pointerEvents="none"
        style={{
          position:
            "absolute",
          right: "0.65rem",
          color:
            colors.color,
        }}
      />
    </div>
  );
}


function StatusBadge({
  status,
}) {
  const colors =
    getStatusColors(status);

  return (
    <span
      style={{
        display:
          "inline-flex",

        alignItems:
          "center",

        padding:
          "0.55rem 0.85rem",

        borderRadius:
          "999px",

        background:
          colors.background,

        color:
          colors.color,

        fontSize:
          "0.82rem",

        fontWeight: 800,

        whiteSpace:
          "nowrap",
      }}
    >
      {status}
    </span>
  );
}


export default function AdminBookings() {
  const [
    bookings,
    setBookings,
  ] = useState([]);

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  const [
    resolvingCancellation,
    setResolvingCancellation,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    actionMessage,
    setActionMessage,
  ] = useState("");

  const [
    confirmDecision,
    setConfirmDecision,
  ] = useState(null);


  useEffect(() => {
    loadBookings();
  }, []);


  async function loadBookings() {
    try {
      setLoading(true);
      setError("");
      setActionMessage("");

      const result =
        await getBookings();

      setBookings(
        result.bookings || []
      );
    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleStatusChange(
    id,
    status
  ) {
    try {
      setUpdatingId(id);
      setError("");
      setActionMessage("");

      const result =
        await updateBookingStatus(
          id,
          status
        );

      const updatedBooking =
        result.booking;

      setBookings(
        (current) =>
          current.map(
            (booking) =>
              booking.id === id
                ? updatedBooking
                : booking
          )
      );

      if (
        selectedBooking?.id === id
      ) {
        setSelectedBooking(
          updatedBooking
        );
      }

      setActionMessage(
        "Booking status updated successfully."
      );
    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setUpdatingId(null);
    }
  }


  async function handleViewDetails(
    id
  ) {
    try {
      setDetailsLoading(true);
      setError("");
      setActionMessage("");

      const result =
        await getBookingById(
          id
        );

      setSelectedBooking(
        result.booking
      );
    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setDetailsLoading(false);
    }
  }


  async function handleCancellationDecision() {
    if (
      !selectedBooking ||
      !confirmDecision ||
      resolvingCancellation
    ) {
      return;
    }

    try {
      setResolvingCancellation(
        true
      );

      setError("");
      setActionMessage("");

      const result =
        await resolveBookingCancellation(
          selectedBooking.id,
          confirmDecision
        );

      const updatedBooking =
        result.booking;

      setSelectedBooking(
        updatedBooking
      );

      setBookings(
        (current) =>
          current.map(
            (booking) =>
              booking.id ===
              updatedBooking.id
                ? updatedBooking
                : booking
          )
      );

      let message =
        result.message ||
        "Cancellation request resolved.";

      if (
        result.voucherRestored
      ) {
        message +=
          " The client's voucher was restored to their wallet.";
      } else if (
        result.voucherRestorationMessage
      ) {
        message +=
          ` ${result.voucherRestorationMessage}`;
      }

      setActionMessage(
        message
      );

      setConfirmDecision(
        null
      );
    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setResolvingCancellation(
        false
      );
    }
  }


  const filteredBookings =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return bookings.filter(
        (booking) => {
          const matchesSearch =
            !keyword ||
            booking.bookingReference
              ?.toLowerCase()
              .includes(
                keyword
              ) ||
            booking.travelerName
              ?.toLowerCase()
              .includes(
                keyword
              ) ||
            booking.email
              ?.toLowerCase()
              .includes(
                keyword
              );

          const matchesStatus =
            statusFilter ===
              "All" ||
            booking.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      bookings,
      search,
      statusFilter,
    ]);


  const pendingCancellations =
    bookings.filter(
      (booking) =>
        booking.status ===
        "Cancellation Requested"
    ).length;


  if (loading) {
    return (
      <div className="container">
        <h1>
          Loading bookings...
        </h1>
      </div>
    );
  }


  return (
    <>
      <div
        className="container"
        style={{
          paddingTop:
            "3rem",

          paddingBottom:
            "3rem",
        }}
      >
        <span className="eyebrow">
          Admin
        </span>

        <h1>
          Booking Management
        </h1>

        <p>
          View, search, filter, and
          manage submitted trip
          requests.
        </p>


        {pendingCancellations >
          0 && (
          <div
            style={{
              marginTop:
                "1.5rem",

              padding:
                "1rem 1.2rem",

              border:
                "1px solid rgba(245, 158, 11, 0.32)",

              borderRadius:
                "14px",

              background:
                "rgba(245, 158, 11, 0.08)",

              color:
                "#7a4a00",
            }}
          >
            <strong>
              {
                pendingCancellations
              }{" "}
              cancellation
              {pendingCancellations ===
              1
                ? ""
                : "s"}{" "}
              awaiting review.
            </strong>
          </div>
        )}


        {actionMessage && (
          <div
            style={{
              marginTop:
                "1rem",

              padding:
                "0.9rem 1rem",

              borderRadius:
                "10px",

              border:
                "1px solid rgba(18, 184, 199, 0.28)",

              background:
                "rgba(18, 184, 199, 0.07)",

              color:
                "var(--deep-water)",

              fontWeight:
                600,
            }}
          >
            {actionMessage}
          </div>
        )}


        {error && (
          <div
            style={{
              marginTop:
                "1rem",

              padding:
                "0.9rem 1rem",

              borderRadius:
                "10px",

              background:
                "rgba(220, 38, 38, 0.07)",

              color:
                "#a11",
            }}
          >
            Error: {error}
          </div>
        )}


        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",

            marginTop:
              "2rem",

            marginBottom:
              "1.5rem",
          }}
        >
          <input
            type="search"
            placeholder="Search booking code, traveler, or email..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            style={{
              flex: "1",
              minWidth:
                "260px",

              padding:
                "0.85rem 1rem",

              border:
                "1px solid var(--line)",

              borderRadius:
                "12px",

              font: "inherit",
            }}
          />

          <select
            value={
              statusFilter
            }
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            style={{
              padding:
                "0.85rem 1rem",

              border:
                "1px solid var(--line)",

              borderRadius:
                "12px",

              background:
                "white",

              font: "inherit",
            }}
          >
            <option value="All">
              All Statuses
            </option>

            {FILTER_STATUSES.map(
              (status) => (
                <option
                  key={
                    status
                  }
                  value={
                    status
                  }
                >
                  {status}
                </option>
              )
            )}
          </select>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={
              loadBookings
            }
          >
            Refresh
          </button>
        </div>


        <p>
          Showing{" "}
          <strong>
            {
              filteredBookings.length
            }
          </strong>{" "}
          of{" "}
          <strong>
            {bookings.length}
          </strong>{" "}
          bookings
        </p>


        <div
          style={{
            overflowX:
              "auto",

            marginTop:
              "1rem",
          }}
        >
          <table
            style={{
              width:
                "100%",

              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr>
                <th align="left">
                  Booking Code
                </th>

                <th align="left">
                  Traveler
                </th>

                <th align="left">
                  Travel Date
                </th>

                <th align="left">
                  Travelers
                </th>

                <th align="left">
                  Total
                </th>

                <th align="left">
                  Status
                </th>

                <th align="left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map(
                (
                  booking
                ) => {
                  const cancellationPending =
                    booking.status ===
                    "Cancellation Requested";

                  return (
                    <tr
                      key={
                        booking.id
                      }
                    >
                      <td>
                        <strong>
                          {
                            booking.bookingReference
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          booking.travelerName
                        }

                        <br />

                        <small>
                          {
                            booking.email
                          }
                        </small>
                      </td>

                      <td>
                        {
                          booking.travelDate
                        }
                      </td>

                      <td>
                        {
                          booking.travelerCount
                        }
                      </td>

                      <td>
                        {formatCurrency(
                          booking.estimatedTotal
                        )}
                      </td>

                      <td>
                        {cancellationPending ? (
                          <StatusBadge
                            status={
                              booking.status
                            }
                          />
                        ) : (
                          <StatusSelect
                            booking={
                              booking
                            }
                            disabled={
                              updatingId ===
                              booking.id
                            }
                            onChange={(
                              event
                            ) =>
                              handleStatusChange(
                                booking.id,
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        )}
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
                          {cancellationPending
                            ? "Review Request"
                            : "View Details"}
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>


        {filteredBookings.length ===
          0 && (
          <p
            style={{
              marginTop:
                "2rem",
            }}
          >
            No matching bookings
            found.
          </p>
        )}


        {detailsLoading && (
          <p
            style={{
              marginTop:
                "2rem",
            }}
          >
            Loading booking
            details...
          </p>
        )}


        {selectedBooking && (
          <div
            style={{
              position:
                "fixed",

              inset: 0,

              background:
                "rgba(3, 24, 32, 0.58)",

              backdropFilter:
                "blur(4px)",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              padding:
                "1rem",

              zIndex:
                9999,
            }}
            onClick={() =>
              setSelectedBooking(
                null
              )
            }
          >
            <div
              style={{
                position:
                  "relative",

                background:
                  "white",

                width:
                  "min(820px, 100%)",

                maxHeight:
                  "90vh",

                overflowY:
                  "auto",

                borderRadius:
                  "22px",

                padding:
                  "2.25rem",

                boxShadow:
                  "0 25px 70px rgba(3, 24, 32, 0.28)",
              }}
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                aria-label="Close booking details"
                onClick={() =>
                  setSelectedBooking(
                    null
                  )
                }
                style={{
                  position:
                    "absolute",

                  top:
                    "1.25rem",

                  right:
                    "1.25rem",

                  width:
                    "42px",

                  height:
                    "42px",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  border:
                    "1px solid var(--line)",

                  borderRadius:
                    "50%",

                  background:
                    "white",

                  color:
                    "var(--deep-water)",

                  cursor:
                    "pointer",
                }}
              >
                <X size={20} />
              </button>


              <span className="eyebrow">
                Booking Details
              </span>

              <h2
                style={{
                  paddingRight:
                    "3rem",
                }}
              >
                {
                  selectedBooking.bookingReference
                }
              </h2>

              <div
                style={{
                  marginTop:
                    "0.8rem",
                }}
              >
                <StatusBadge
                  status={
                    selectedBooking.status
                  }
                />
              </div>


              {selectedBooking.status ===
                "Cancellation Requested" && (
                <div
                  style={{
                    margin:
                      "1.5rem 0",

                    padding:
                      "1.4rem",

                    border:
                      "1px solid rgba(245, 158, 11, 0.35)",

                    borderRadius:
                      "16px",

                    background:
                      "rgba(245, 158, 11, 0.07)",
                  }}
                >
                  <h3
                    style={{
                      marginTop:
                        0,

                      color:
                        "#805000",
                    }}
                  >
                    Cancellation
                    Request
                  </h3>

                  <p>
                    <strong>
                      Previous status:
                    </strong>{" "}
                    {selectedBooking
                      .statusBeforeCancellation ||
                      "—"}
                  </p>

                  <p>
                    <strong>
                      Requested:
                    </strong>{" "}
                    {formatDateTime(
                      selectedBooking
                        .cancellationRequestedAt
                    )}
                  </p>

                  <p>
                    <strong>
                      Reason:
                    </strong>{" "}
                    {selectedBooking
                      .cancellationReason ||
                      "No reason provided."}
                  </p>

                  <p
                    style={{
                      color:
                        "var(--ink-soft)",

                      lineHeight:
                        1.55,
                    }}
                  >
                    This booking
                    remains active
                    until you approve
                    the cancellation.
                  </p>

                  <div
                    style={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap:
                        "0.75rem",

                      marginTop:
                        "1rem",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        setConfirmDecision(
                          "reject"
                        )
                      }
                    >
                      Reject Cancellation
                    </button>

                    <button
                      type="button"
                      className="btn"
                      onClick={() =>
                        setConfirmDecision(
                          "approve"
                        )
                      }
                      style={{
                        border:
                          "1px solid #a72b2b",

                        background:
                          "#a72b2b",

                        color:
                          "white",
                      }}
                    >
                      Approve Cancellation
                    </button>
                  </div>
                </div>
              )}


              {selectedBooking
                .cancellationResolution && (
                <div
                  style={{
                    margin:
                      "1rem 0",

                    padding:
                      "0.9rem 1rem",

                    borderRadius:
                      "10px",

                    background:
                      selectedBooking
                        .cancellationResolution ===
                      "Approved"
                        ? "rgba(220, 38, 38, 0.06)"
                        : "rgba(100, 116, 139, 0.07)",
                  }}
                >
                  <strong>
                    Cancellation
                    Resolution:
                  </strong>{" "}
                  {
                    selectedBooking.cancellationResolution
                  }

                  {selectedBooking
                    .cancellationResolvedAt && (
                    <div
                      style={{
                        marginTop:
                          "0.3rem",

                        color:
                          "var(--ink-soft)",

                        fontSize:
                          "0.85rem",
                      }}
                    >
                      {formatDateTime(
                        selectedBooking
                          .cancellationResolvedAt
                      )}
                    </div>
                  )}
                </div>
              )}


              <hr />

              <h3>
                Traveler
              </h3>

              <p>
                <strong>
                  Name:
                </strong>{" "}
                {
                  selectedBooking.travelerName
                }
              </p>

              <p>
                <strong>
                  Email:
                </strong>{" "}
                {
                  selectedBooking.email
                }
              </p>

              <p>
                <strong>
                  Phone:
                </strong>{" "}
                {
                  selectedBooking.phone
                }
              </p>

              <p>
                <strong>
                  Nationality:
                </strong>{" "}
                {selectedBooking
                  .nationality ||
                  "—"}
              </p>


              <h3>
                Travel
              </h3>

              <p>
                <strong>
                  Dates:
                </strong>{" "}
                {
                  selectedBooking.travelDate
                }{" "}
                →{" "}
                {selectedBooking
                  .travelEndDate ||
                  "—"}
              </p>

              <p>
                <strong>
                  Duration:
                </strong>{" "}
                {
                  selectedBooking.tripDays
                }{" "}
                days /{" "}
                {
                  selectedBooking.tripNights
                }{" "}
                nights
              </p>

              <p>
                <strong>
                  Travelers:
                </strong>{" "}
                {
                  selectedBooking.travelerCount
                }
              </p>


              <h3>
                Price
              </h3>

              <p>
                <strong>
                  Subtotal:
                </strong>{" "}
                {formatCurrency(
                  selectedBooking.subtotal
                )}
              </p>

              {Number(
                selectedBooking.discountAmount ||
                  0
              ) >
                0 && (
                <>
                  <p>
                    <strong>
                      Voucher:
                    </strong>{" "}
                    {selectedBooking
                      .voucherCode ||
                      "Applied"}
                  </p>

                  <p>
                    <strong>
                      Discount:
                    </strong>{" "}
                    -
                    {formatCurrency(
                      selectedBooking.discountAmount
                    )}
                  </p>
                </>
              )}

              <p>
                <strong>
                  Estimated Total:
                </strong>{" "}
                {formatCurrency(
                  selectedBooking.estimatedTotal
                )}
              </p>


              <h3>
                Emergency Contact
              </h3>

              <p>
                {selectedBooking
                  .traveler
                  ?.emergencyName ||
                  "None"}

                {selectedBooking
                  .traveler
                  ?.emergencyPhone
                  ? ` · ${selectedBooking.traveler.emergencyPhone}`
                  : ""}
              </p>


              <h3>
                Special Requests
              </h3>

              <p>
                {selectedBooking
                  .traveler
                  ?.specialRequests ||
                  "None"}
              </p>


              <h3>
                Itinerary
              </h3>

              {selectedBooking
                .tripPlan
                ?.days?.length >
              0 ? (
                selectedBooking.tripPlan.days.map(
                  (day) => (
                    <div
                      key={
                        day.dayNumber
                      }
                      style={{
                        marginBottom:
                          "1rem",
                      }}
                    >
                      <strong>
                        Day{" "}
                        {
                          day.dayNumber
                        }
                      </strong>

                      {day.items
                        ?.length >
                      0 ? (
                        <ul>
                          {day.items.map(
                            (
                              item,
                              index
                            ) => (
                              <li
                                key={`${item.tourId}-${index}`}
                              >
                                {
                                  item.title
                                }
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>
                          No tours.
                        </p>
                      )}
                    </div>
                  )
                )
              ) : (
                <p>
                  No itinerary
                  available.
                </p>
              )}
            </div>
          </div>
        )}
      </div>


      <ConfirmModal
        open={
          Boolean(
            confirmDecision
          )
        }
        danger={
          confirmDecision ===
          "approve"
        }
        loading={
          resolvingCancellation
        }
        title={
          confirmDecision ===
          "approve"
            ? "Approve cancellation?"
            : "Reject cancellation?"
        }
        message={
          confirmDecision ===
          "approve"
            ? "This booking will be cancelled after approval. If an eligible voucher was used, it will be returned to the client's wallet."
            : "The cancellation request will be declined and the booking will return to its previous active status."
        }
        confirmText={
          confirmDecision ===
          "approve"
            ? "Approve Cancellation"
            : "Reject Request"
        }
        cancelText="Go Back"
        onCancel={() => {
          if (
            !resolvingCancellation
          ) {
            setConfirmDecision(
              null
            );
          }
        }}
        onConfirm={
          handleCancellationDecision
        }
      />
    </>
  );
}