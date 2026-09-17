import {
  useEffect,
  useMemo,
  useRef,
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
import "./Admin.css";


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
  const bookingsAbortRef =
    useRef(null);

  const detailsAbortRef =
    useRef(null);

  const statusLockRef =
    useRef(false);

  const cancellationLockRef =
    useRef(false);

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

    return () => {
      bookingsAbortRef
        .current
        ?.abort();

      bookingsAbortRef.current =
        null;

      detailsAbortRef
        .current
        ?.abort();

      detailsAbortRef.current =
        null;
    };
  }, []);


  useEffect(() => {
    if (!selectedBooking) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(event) {
      if (
        event.key === "Escape" &&
        !resolvingCancellation
      ) {
        setSelectedBooking(null);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedBooking,
    resolvingCancellation,
  ]);


  async function loadBookings() {
    if (bookingsAbortRef.current) {
      return;
    }

    const controller =
      new AbortController();

    bookingsAbortRef.current =
      controller;

    try {
      setLoading(true);
      setError("");
      setActionMessage("");

      const result =
        await getBookings({
          signal:
            controller.signal,
        });

      if (
        controller.signal.aborted
      ) {
        return;
      }

      setBookings(
        result.bookings || []
      );
    } catch (err) {
      if (
        controller.signal.aborted
      ) {
        return;
      }

      setError(
        err.message
      );
    } finally {
      if (
        bookingsAbortRef.current ===
        controller
      ) {
        bookingsAbortRef.current =
          null;

        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }
  }


  async function handleStatusChange(
    id,
    status
  ) {
    if (statusLockRef.current) {
      return;
    }

    const currentBooking =
      bookings.find(
        (booking) =>
          booking.id === id
      );

    if (
      currentBooking?.status ===
      status
    ) {
      return;
    }

    statusLockRef.current =
      true;

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
      statusLockRef.current =
        false;

      setUpdatingId(null);
    }
  }


  async function handleViewDetails(
    id
  ) {
    if (detailsAbortRef.current) {
      return;
    }

    const controller =
      new AbortController();

    detailsAbortRef.current =
      controller;

    try {
      setDetailsLoading(true);
      setError("");
      setActionMessage("");
      setSelectedBooking(null);

      const result =
        await getBookingById(
          id,
          {
            signal:
              controller.signal,
          }
        );

      if (
        controller.signal.aborted
      ) {
        return;
      }

      setSelectedBooking(
        result.booking
      );
    } catch (err) {
      if (
        controller.signal.aborted
      ) {
        return;
      }

      setError(
        err.message
      );
    } finally {
      if (
        detailsAbortRef.current ===
        controller
      ) {
        detailsAbortRef.current =
          null;

        if (
          !controller.signal.aborted
        ) {
          setDetailsLoading(false);
        }
      }
    }
  }


  async function handleCancellationDecision() {
    if (
      !selectedBooking ||
      !confirmDecision ||
      cancellationLockRef.current
    ) {
      return;
    }

    cancellationLockRef.current =
      true;

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
      cancellationLockRef.current =
        false;

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
      <div className="route-state" role="status" aria-live="polite">
        <span className="route-state__pulse" aria-hidden="true" />
        <p>Loading bookings...</p>
      </div>
    );
  }


  return (
    <>
      <div className="container admin-page admin-page--bookings">
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
          <div className="admin-notice admin-notice--warning" role="status">
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
          <div className="admin-notice admin-notice--success" role="status">
            {actionMessage}
          </div>
        )}


        {error && (
          <div className="admin-notice admin-notice--error" role="alert">
            Error: {error}
          </div>
        )}


        <div className="admin-toolbar">
          <input
            type="search"
            aria-label="Search bookings"
            placeholder="Search booking code, traveler, or email..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            className="admin-toolbar__search"
          />

          <select
            aria-label="Filter bookings by status"
            value={
              statusFilter
            }
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="admin-toolbar__select"
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
            onClick={() =>
              loadBookings()
            }
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>


        <p className="admin-results">
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


        <div className="admin-table-wrap">
          <table className="admin-table" aria-label="Booking requests">
            <thead>
              <tr>
                <th scope="col" align="left">
                  Booking Code
                </th>

                <th scope="col" align="left">
                  Traveler
                </th>

                <th scope="col" align="left">
                  Travel Date
                </th>

                <th scope="col" align="left">
                  Travelers
                </th>

                <th scope="col" align="left">
                  Total
                </th>

                <th scope="col" align="left">
                  Status
                </th>

                <th scope="col" align="left">
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
                      <td data-label="Booking code">
                        <strong>
                          {
                            booking.bookingReference
                          }
                        </strong>
                      </td>

                      <td data-label="Traveler">
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

                      <td data-label="Travel date">
                        {
                          booking.travelDate
                        }
                      </td>

                      <td data-label="Travelers">
                        {
                          booking.travelerCount
                        }
                      </td>

                      <td data-label="Total">
                        {formatCurrency(
                          booking.estimatedTotal
                        )}
                      </td>

                      <td data-label="Status">
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
                              updatingId !==
                              null
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

                      <td data-label="Action">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={
                            detailsLoading
                          }
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
          <p className="admin-empty-state">
            No matching bookings
            found.
          </p>
        )}


        {detailsLoading && (
          <p className="admin-loading-state" role="status">
            Loading booking
            details...
          </p>
        )}


        {selectedBooking && (
          <div
            className="admin-modal"
            onClick={() => {
              if (!resolvingCancellation) {
                setSelectedBooking(null);
              }
            }}
          >
            <div
              className="admin-modal__dialog admin-modal__dialog--wide"
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-detail-title"
              aria-busy={resolvingCancellation}
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
                className="admin-modal__close"
                disabled={resolvingCancellation}
                autoFocus
              >
                <X size={20} aria-hidden="true" />
              </button>


              <span className="eyebrow">
                Booking Details
              </span>

              <h2 id="booking-detail-title" className="admin-modal__title">
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
