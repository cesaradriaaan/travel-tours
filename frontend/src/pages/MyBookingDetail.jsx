import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  TicketPercent,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import {
  getMyBookingById,
  requestBookingCancellation,
} from "../services/api";

import "./MyBookingDetail.css";


function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}


function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}


function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}


function getReference(booking) {
  return (
    booking?.bookingReference ||
    booking?.reference ||
    `ADDY-${booking?.id}`
  );
}


function getTravelerName(booking) {
  return (
    booking?.traveler?.fullName ||
    booking?.traveler?.name ||
    booking?.travelerName ||
    booking?.fullName ||
    "Traveler"
  );
}


function getTravelerEmail(booking) {
  return (
    booking?.traveler?.email ||
    booking?.email ||
    "Not provided"
  );
}


function getTravelerPhone(booking) {
  return (
    booking?.traveler?.phone ||
    booking?.traveler?.contactNumber ||
    booking?.phone ||
    booking?.contactNumber ||
    "Not provided"
  );
}


function getTripItems(booking) {
  const tripPlan = booking?.tripPlan;

  if (!tripPlan) {
    return [];
  }

  if (Array.isArray(tripPlan)) {
    return tripPlan;
  }

  if (Array.isArray(tripPlan.items)) {
    return tripPlan.items;
  }

  if (Array.isArray(tripPlan.itinerary)) {
    return tripPlan.itinerary;
  }

  if (Array.isArray(tripPlan.destinations)) {
    return tripPlan.destinations;
  }

  return [];
}


function getItemTitle(item, index) {
  return (
    item?.title ||
    item?.name ||
    item?.destination ||
    item?.tour?.title ||
    item?.tour?.name ||
    `Itinerary Item ${index + 1}`
  );
}


function getItemLocation(item) {
  return (
    item?.location ||
    item?.province ||
    item?.destination ||
    item?.tour?.location ||
    ""
  );
}


function getItemDetails(item) {
  const details = [];

  if (item?.day) {
    details.push(`Day ${item.day}`);
  }

  if (item?.duration) {
    details.push(item.duration);
  }

  if (item?.accommodation) {
    details.push(
      `Stay: ${item.accommodation}`
    );
  }

  if (item?.transport) {
    details.push(
      `Transport: ${item.transport}`
    );
  }

  if (item?.meal || item?.meals) {
    details.push(
      `Meals: ${item.meal || item.meals}`
    );
  }

  return details;
}


function StatusBadge({ status }) {
  const normalized =
    status?.toLowerCase() ||
    "request received";

  const isCancellation =
    status === "Cancellation Requested";

  const isCancelled =
    status === "Cancelled";

  return (
    <span
      className="booking-detail__status"
      data-status={normalized}
      style={
        isCancellation
          ? {
              background:
                "rgba(245, 158, 11, 0.13)",
              color: "#9a5b00",
            }
          : isCancelled
          ? {
              background:
                "rgba(220, 38, 38, 0.1)",
              color: "#a11",
            }
          : undefined
      }
    >
      {isCancellation ? (
        <AlertTriangle size={16} />
      ) : isCancelled ? (
        <XCircle size={16} />
      ) : (
        <CheckCircle2 size={16} />
      )}

      {status || "Request Received"}
    </span>
  );
}


export default function MyBookingDetail() {
  const { id } = useParams();

  const [booking, setBooking] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    showCancellationForm,
    setShowCancellationForm,
  ] = useState(false);

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState("");

  const [
    cancellationLoading,
    setCancellationLoading,
  ] = useState(false);

  const [
    cancellationError,
    setCancellationError,
  ] = useState("");

  const [
    cancellationMessage,
    setCancellationMessage,
  ] = useState("");


  useEffect(() => {
    let active = true;

    async function loadBooking() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMyBookingById(id);

        if (!active) {
          return;
        }

        setBooking(
          data?.booking ||
            data?.data ||
            data
        );
      } catch (err) {
        if (!active) {
          return;
        }

        console.error(
          "Unable to load booking:",
          err
        );

        setError(
          err?.message ||
            "Unable to load this booking."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBooking();

    return () => {
      active = false;
    };
  }, [id]);


  async function handleCancellationRequest(
    event
  ) {
    event.preventDefault();

    if (cancellationLoading) {
      return;
    }

    try {
      setCancellationLoading(true);
      setCancellationError("");
      setCancellationMessage("");

      const data =
        await requestBookingCancellation(
          id,
          cancellationReason
        );

      setBooking(
        data?.booking || booking
      );

      setCancellationReason("");
      setShowCancellationForm(false);

      setCancellationMessage(
        data?.message ||
          "Cancellation request submitted. Please wait for admin approval."
      );
    } catch (err) {
      console.error(
        "Cancellation request error:",
        err
      );

      setCancellationError(
        err?.message ||
          "Unable to submit cancellation request."
      );
    } finally {
      setCancellationLoading(false);
    }
  }


  if (loading) {
    return (
      <section className="booking-detail-page container">
        <p>
          Loading your booking...
        </p>
      </section>
    );
  }


  if (error || !booking) {
    return (
      <section className="booking-detail-page container">
        <Link
          to="/my-bookings"
          className="booking-detail__back"
        >
          <ArrowLeft size={17} />
          My Bookings
        </Link>

        <div className="booking-detail__error">
          <h1>
            Booking unavailable
          </h1>

          <p>
            {error ||
              "We could not find this booking."}
          </p>

          <Link
            to="/my-bookings"
            className="btn btn-primary"
          >
            Return to My Bookings
          </Link>
        </div>
      </section>
    );
  }


  const tripItems =
    getTripItems(booking);

  const subtotal =
    booking.subtotal ??
    Number(
      booking.pricePerTraveler || 0
    ) *
      Number(
        booking.travelerCount || 0
      );

  const discountAmount =
    Number(
      booking.discountAmount || 0
    );

  const estimatedTotal =
    booking.estimatedTotal ??
    Math.max(
      0,
      subtotal - discountAmount
    );

  const cancellableStatuses = [
    "Request Received",
    "Reviewing",
    "Confirmed",
  ];

  const canRequestCancellation =
    cancellableStatuses.includes(
      booking.status
    );

  const cancellationPending =
    booking.status ===
    "Cancellation Requested";

  const cancelled =
    booking.status ===
    "Cancelled";

  const previousCancellationRejected =
    booking.cancellationResolution ===
    "Rejected" &&
    !cancellationPending &&
    !cancelled;


  return (
    <section className="booking-detail-page container">
      <Link
        to="/my-bookings"
        className="booking-detail__back"
      >
        <ArrowLeft size={17} />
        My Bookings
      </Link>

      <div className="booking-detail__hero">
        <div>
          <p className="booking-detail__eyebrow">
            Booking Reference
          </p>

          <h1>
            {getReference(booking)}
          </h1>

          <p>
            Submitted{" "}
            {formatDateTime(
              booking.createdAt
            )}
          </p>
        </div>

        <StatusBadge
          status={booking.status}
        />
      </div>


      {cancellationMessage && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem 1.15rem",
            borderRadius:
              "var(--radius-sm)",
            border:
              "1px solid rgba(18, 184, 199, 0.3)",
            background:
              "rgba(18, 184, 199, 0.08)",
            color:
              "var(--deep-water)",
            fontWeight: 600,
          }}
        >
          {cancellationMessage}
        </div>
      )}


      {cancellationPending && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1.2rem",
            borderRadius:
              "var(--radius-md)",
            border:
              "1px solid rgba(245, 158, 11, 0.3)",
            background:
              "rgba(245, 158, 11, 0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems:
                "flex-start",
            }}
          >
            <AlertTriangle
              size={22}
              style={{
                flexShrink: 0,
                color: "#9a5b00",
                marginTop: "0.1rem",
              }}
            />

            <div>
              <strong
                style={{
                  color: "#7c4a00",
                }}
              >
                Cancellation request
                pending
              </strong>

              <p
                style={{
                  margin:
                    "0.35rem 0 0",
                  color:
                    "var(--ink-soft)",
                  lineHeight: 1.55,
                }}
              >
                Your booking is not
                cancelled yet. An
                administrator must
                review and approve your
                request first.
              </p>

              {booking.cancellationReason && (
                <p
                  style={{
                    margin:
                      "0.8rem 0 0",
                    color:
                      "var(--deep-water)",
                  }}
                >
                  <strong>
                    Reason:
                  </strong>{" "}
                  {
                    booking.cancellationReason
                  }
                </p>
              )}

              {booking.cancellationRequestedAt && (
                <p
                  style={{
                    margin:
                      "0.35rem 0 0",
                    fontSize:
                      "0.82rem",
                    color:
                      "var(--ink-soft)",
                  }}
                >
                  Requested{" "}
                  {formatDateTime(
                    booking.cancellationRequestedAt
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}


      {cancelled && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1.2rem",
            borderRadius:
              "var(--radius-md)",
            border:
              "1px solid rgba(220, 38, 38, 0.2)",
            background:
              "rgba(220, 38, 38, 0.055)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "flex-start",
              gap: "0.75rem",
            }}
          >
            <XCircle
              size={22}
              style={{
                flexShrink: 0,
                color: "#a11",
              }}
            />

            <div>
              <strong
                style={{
                  color: "#8a1111",
                }}
              >
                Booking cancelled
              </strong>

              <p
                style={{
                  margin:
                    "0.35rem 0 0",
                  color:
                    "var(--ink-soft)",
                }}
              >
                Your cancellation
                request was approved by
                AddyVenture.
              </p>

              {booking.cancellationResolvedAt && (
                <p
                  style={{
                    margin:
                      "0.35rem 0 0",
                    fontSize:
                      "0.82rem",
                    color:
                      "var(--ink-soft)",
                  }}
                >
                  Resolved{" "}
                  {formatDateTime(
                    booking.cancellationResolvedAt
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}


      {previousCancellationRejected && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem 1.15rem",
            borderRadius:
              "var(--radius-sm)",
            border:
              "1px solid rgba(100, 116, 139, 0.25)",
            background:
              "rgba(100, 116, 139, 0.06)",
          }}
        >
          <strong>
            Previous cancellation
            request was declined.
          </strong>

          <p
            style={{
              margin:
                "0.3rem 0 0",
              color:
                "var(--ink-soft)",
            }}
          >
            Your booking remains active.
          </p>
        </div>
      )}


      <div className="booking-detail__layout">
        <div className="booking-detail__main">
          <article className="booking-detail__card">
            <div className="booking-detail__heading">
              <UserRound size={21} />

              <div>
                <h2>
                  Traveler Details
                </h2>

                <p>
                  Contact information
                  for this booking.
                </p>
              </div>
            </div>

            <div className="booking-detail__info-grid">
              <div>
                <span>
                  Name
                </span>

                <strong>
                  {getTravelerName(
                    booking
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Email
                </span>

                <strong className="booking-detail__inline">
                  <Mail size={15} />

                  {getTravelerEmail(
                    booking
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Contact Number
                </span>

                <strong className="booking-detail__inline">
                  <Phone size={15} />

                  {getTravelerPhone(
                    booking
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Travelers
                </span>

                <strong className="booking-detail__inline">
                  <Users size={15} />

                  {booking.travelerCount ||
                    1}
                </strong>
              </div>
            </div>
          </article>


          <article className="booking-detail__card">
            <div className="booking-detail__heading">
              <MapPin size={21} />

              <div>
                <h2>
                  Trip Details
                </h2>

                <p>
                  Your requested travel
                  plan.
                </p>
              </div>
            </div>

            <div className="booking-detail__trip-meta">
              <div>
                <CalendarDays
                  size={18}
                />

                <span>
                  <small>
                    Travel Date
                  </small>

                  <strong>
                    {formatDate(
                      booking.travelDate
                    )}
                  </strong>
                </span>
              </div>

              <div>
                <Clock3 size={18} />

                <span>
                  <small>
                    Duration
                  </small>

                  <strong>
                    {booking.duration ||
                      `${
                        tripItems.length ||
                        1
                      } day${
                        tripItems.length ===
                        1
                          ? ""
                          : "s"
                      }`}
                  </strong>
                </span>
              </div>
            </div>


            {tripItems.length > 0 ? (
              <div className="booking-detail__itinerary">
                {tripItems.map(
                  (
                    item,
                    index
                  ) => {
                    const itemDetails =
                      getItemDetails(
                        item
                      );

                    return (
                      <div
                        className="booking-detail__itinerary-item"
                        key={
                          item?.id ||
                          `${getItemTitle(
                            item,
                            index
                          )}-${index}`
                        }
                      >
                        <div className="booking-detail__day">
                          {index + 1}
                        </div>

                        <div>
                          <h3>
                            {getItemTitle(
                              item,
                              index
                            )}
                          </h3>

                          {getItemLocation(
                            item
                          ) && (
                            <p>
                              <MapPin
                                size={14}
                              />

                              {getItemLocation(
                                item
                              )}
                            </p>
                          )}

                          {itemDetails.length >
                            0 && (
                            <div className="booking-detail__tags">
                              {itemDetails.map(
                                (
                                  detail,
                                  detailIndex
                                ) => (
                                  <span
                                    key={`${detail}-${detailIndex}`}
                                  >
                                    {detail}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <p className="booking-detail__empty">
                Your trip plan is
                attached to this
                booking.
              </p>
            )}
          </article>


          {canRequestCancellation && (
            <article className="booking-detail__card">
              <div className="booking-detail__heading">
                <AlertTriangle
                  size={21}
                />

                <div>
                  <h2>
                    Booking Options
                  </h2>

                  <p>
                    Need to cancel your
                    trip? Send a request
                    for admin review.
                  </p>
                </div>
              </div>

              {!showCancellationForm ? (
                <div>
                  <p
                    style={{
                      margin:
                        "0 0 1rem",
                      color:
                        "var(--ink-soft)",
                      lineHeight: 1.6,
                    }}
                  >
                    Requesting
                    cancellation will
                    not cancel your
                    booking immediately.
                    AddyVenture must
                    approve the request
                    first.
                  </p>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setCancellationError(
                        ""
                      );
                      setCancellationMessage(
                        ""
                      );
                      setShowCancellationForm(
                        true
                      );
                    }}
                    style={{
                      border:
                        "1px solid rgba(180, 35, 35, 0.35)",
                      color:
                        "#9f1d1d",
                      background:
                        "rgba(220, 38, 38, 0.04)",
                    }}
                  >
                    Request Cancellation
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={
                    handleCancellationRequest
                  }
                >
                  <label
                    htmlFor="cancellation-reason"
                    style={{
                      display: "block",
                      marginBottom:
                        "0.5rem",
                      fontWeight: 700,
                    }}
                  >
                    Reason for
                    cancellation
                    <span
                      style={{
                        marginLeft:
                          "0.4rem",
                        color:
                          "var(--ink-soft)",
                        fontWeight:
                          400,
                        fontSize:
                          "0.85rem",
                      }}
                    >
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="cancellation-reason"
                    value={
                      cancellationReason
                    }
                    onChange={(event) =>
                      setCancellationReason(
                        event.target.value
                      )
                    }
                    maxLength={1000}
                    rows={4}
                    placeholder="Tell us why you would like to cancel this booking..."
                    style={{
                      width: "100%",
                      resize:
                        "vertical",
                      padding:
                        "0.9rem 1rem",
                      border:
                        "1px solid var(--line)",
                      borderRadius:
                        "var(--radius-sm)",
                      font:
                        "inherit",
                      background:
                        "var(--white)",
                    }}
                  />

                  <div
                    style={{
                      marginTop:
                        "0.4rem",
                      textAlign:
                        "right",
                      fontSize:
                        "0.78rem",
                      color:
                        "var(--ink-soft)",
                    }}
                  >
                    {
                      cancellationReason.length
                    }
                    /1000
                  </div>

                  <div
                    style={{
                      marginTop:
                        "1rem",
                      padding:
                        "0.9rem 1rem",
                      borderRadius:
                        "var(--radius-sm)",
                      background:
                        "rgba(245, 158, 11, 0.07)",
                      color:
                        "#795000",
                      lineHeight: 1.55,
                    }}
                  >
                    <strong>
                      Confirmation:
                    </strong>{" "}
                    Your booking will
                    stay active until an
                    administrator
                    approves the
                    cancellation.
                  </div>

                  {cancellationError && (
                    <p
                      style={{
                        margin:
                          "1rem 0 0",
                        color:
                          "#a11",
                        fontWeight:
                          600,
                      }}
                    >
                      {
                        cancellationError
                      }
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      marginTop:
                        "1.25rem",
                    }}
                  >
                    <button
                      type="button"
                      className="btn"
                      disabled={
                        cancellationLoading
                      }
                      onClick={() => {
                        setShowCancellationForm(
                          false
                        );
                        setCancellationError(
                          ""
                        );
                        setCancellationReason(
                          ""
                        );
                      }}
                    >
                      Keep Booking
                    </button>

                    <button
                      type="submit"
                      className="btn"
                      disabled={
                        cancellationLoading
                      }
                      style={{
                        background:
                          "#a92b2b",
                        color:
                          "#fff",
                        border:
                          "1px solid #a92b2b",
                      }}
                    >
                      {cancellationLoading
                        ? "Submitting..."
                        : "Submit Cancellation Request"}
                    </button>
                  </div>
                </form>
              )}
            </article>
          )}
        </div>


        <aside className="booking-detail__sidebar">
          <article className="booking-detail__card booking-detail__summary">
            <div className="booking-detail__heading">
              <ReceiptText
                size={21}
              />

              <div>
                <h2>
                  Price Summary
                </h2>

                <p>
                  Estimated booking
                  cost.
                </p>
              </div>
            </div>

            <div className="booking-detail__price-row">
              <span>
                Price per traveler
              </span>

              <strong>
                {formatCurrency(
                  booking.pricePerTraveler
                )}
              </strong>
            </div>

            <div className="booking-detail__price-row">
              <span>
                Travelers
              </span>

              <strong>
                ×{" "}
                {booking.travelerCount ||
                  1}
              </strong>
            </div>

            <div className="booking-detail__price-row">
              <span>
                Subtotal
              </span>

              <strong>
                {formatCurrency(
                  subtotal
                )}
              </strong>
            </div>


            {discountAmount > 0 && (
              <>
                <div className="booking-detail__voucher">
                  <span>
                    <TicketPercent
                      size={16}
                    />

                    Voucher
                  </span>

                  <strong>
                    {booking.voucherCode ||
                      "Applied"}
                  </strong>
                </div>

                <div className="booking-detail__price-row booking-detail__discount">
                  <span>
                    Discount
                  </span>

                  <strong>
                    -
                    {formatCurrency(
                      discountAmount
                    )}
                  </strong>
                </div>
              </>
            )}


            <div className="booking-detail__total">
              <span>
                Estimated Total
              </span>

              <strong>
                {formatCurrency(
                  estimatedTotal
                )}
              </strong>
            </div>

            <p className="booking-detail__note">
              Final pricing may still be
              confirmed by AddyVenture
              before your trip is
              finalized.
            </p>
          </article>
        </aside>
      </div>
    </section>
  );
}