import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  CircleUserRound,
  Mail,
  MapPin,
  Phone,
  Copy,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { useTrip } from "../context/TripContext";
import { getTourById } from "../data/tours";
import "./Booking.css";

const DRAFT_KEY = "addyventure-booking-draft-v1";
const STEP_KEY = "addyventure-booking-step-v1";
const CONFIRMATION_KEY = "addyventure-booking-confirmation-v1";

const emptyTraveler = {
  name: "",
  email: "",
  phone: "",
  nationality: "",
  travelDate: "",
  adults: 1,
  children: 0,
  infants: 0,
  emergencyName: "",
  emergencyPhone: "",
  specialRequests: "",
};

function loadJson(storage, key, fallback) {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function loadTraveler() {
  const raw = loadJson(localStorage, DRAFT_KEY, null);
  if (!raw) return emptyTraveler;
  return {
    ...emptyTraveler,
    ...raw,
    adults: Math.max(1, Number(raw.adults) || 1),
    children: Math.max(0, Number(raw.children) || 0),
    infants: Math.max(0, Number(raw.infants) || 0),
  };
}

function loadStep() {
  try {
    const saved = Number(localStorage.getItem(STEP_KEY));
    return saved === 2 ? 2 : 1;
  } catch {
    return 1;
  }
}

function loadConfirmation() {
  return loadJson(sessionStorage, CONFIRMATION_KEY, null);
}

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "Not selected";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function addDaysToDateValue(value, daysToAdd) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + daysToAdd);
  return getLocalDateValue(date);
}

function getTripEndDate(startDate, dayCount) {
  if (!startDate || dayCount < 1) return "";
  return addDaysToDateValue(startDate, dayCount - 1);
}

function formatTripDuration(dayCount) {
  const days = Math.max(0, Number(dayCount) || 0);
  const nights = Math.max(0, days - 1);
  return `${days} ${days === 1 ? "Day" : "Days"} / ${nights} ${nights === 1 ? "Night" : "Nights"}`;
}

function formatDateRange(startDate, endDate) {
  if (!startDate) return "Not selected";
  if (!endDate || startDate === endDate) return formatDate(startDate);
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function getDestinationSummary(tripPlan) {
  const titles = tripPlan.days.flatMap((day) => day.items.map((item) => item.title));
  return [...new Set(titles)];
}

function generateReference() {
  const now = new Date();
  const date = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";

  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(4);
    globalThis.crypto.getRandomValues(bytes);
    suffix = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  } else {
    for (let i = 0; i < 4; i += 1) {
      suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `ADV-${date}-${suffix}`;
}

function mealLabel(meals) {
  const included = [];
  if (meals?.breakfast) included.push("Breakfast");
  if (meals?.lunch) included.push("Lunch");
  if (meals?.dinner) included.push("Dinner");
  return included.length ? included.join(", ") : "No meals selected";
}

function countTravelers(traveler) {
  return (
    Math.max(0, Number(traveler.adults) || 0) +
    Math.max(0, Number(traveler.children) || 0) +
    Math.max(0, Number(traveler.infants) || 0)
  );
}

function validateTraveler(traveler) {
  const errors = {};
  const totalTravelers = countTravelers(traveler);

  if (!traveler.name.trim()) errors.name = "Lead traveler name is required.";
  if (!/^\S+@\S+\.\S+$/.test(traveler.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!/^[\d\s()+-]{7,}$/.test(traveler.phone.trim())) {
    errors.phone = "Enter a valid phone number (at least 7 characters).";
  }
  if (!traveler.travelDate) {
    errors.travelDate = "Select your trip start date.";
  } else if (traveler.travelDate < getLocalDateValue()) {
    errors.travelDate = "Travel date cannot be in the past.";
  }
  if ((Number(traveler.adults) || 0) < 1) {
    errors.adults = "At least one adult traveler is required.";
  }
  if (totalTravelers < 1) errors.adults = "Add at least one traveler.";

  const hasEmergencyName = traveler.emergencyName.trim().length > 0;
  const hasEmergencyPhone = traveler.emergencyPhone.trim().length > 0;
  if (hasEmergencyName !== hasEmergencyPhone) {
    errors.emergency = "Enter both emergency contact name and phone, or leave both blank.";
  } else if (hasEmergencyPhone && !/^[\d\s()+-]{7,}$/.test(traveler.emergencyPhone.trim())) {
    errors.emergency = "Enter a valid emergency contact number.";
  }

  return errors;
}

function DaySummary({ day, travelDate }) {
  return (
    <article className="booking-day">
      <div className="booking-day__heading">
        <span>
          Day {day.dayNumber}
          {travelDate && <em>{formatDate(travelDate)}</em>}
        </span>
        <small>{day.items.length} {day.items.length === 1 ? "tour" : "tours"}</small>
      </div>

      {day.items.length > 0 ? (
        <div className="booking-day__tours">
          {day.items.map((item, index) => {
            const tour = getTourById(item.tourId);
            return (
              <div className="booking-day__tour" key={`${item.tourId}-${index}`}>
                <div>
                  <strong>{item.title}</strong>
                  {tour && (
                    <span>
                      <MapPin size={13} /> {tour.region}
                    </span>
                  )}
                </div>
                {tour && <b>₱{tour.price.toLocaleString()}</b>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="booking-day__empty">No tour scheduled for this day.</p>
      )}

      <div className="booking-day__extras">
        <span>
          <UtensilsCrossed size={15} /> {mealLabel(day.meals)}
        </span>
        <span>
          <BedDouble size={15} />{" "}
          {day.accommodation?.name
            ? `${day.accommodation.name}${
                day.accommodation.location ? ` · ${day.accommodation.location}` : ""
              }`
            : "No accommodation set"}
        </span>
        <span>
          <Car size={15} /> {day.transportation || "No transportation set"}
        </span>
      </div>
    </article>
  );
}

function StepIndicator({ step }) {
  const steps = [
    { number: 1, label: "Traveler details" },
    { number: 2, label: "Review" },
    { number: 3, label: "Request received" },
  ];

  return (
    <div className="booking-steps" aria-label="Booking progress">
      {steps.map((item) => {
        const isDone = item.number < step;
        const isActive = item.number === step;
        return (
          <div
            className={`booking-step ${isDone ? "is-done" : ""} ${isActive ? "is-active" : ""}`}
            key={item.number}
          >
            <span>{isDone ? <Check size={15} /> : item.number}</span>
            <small>{item.label}</small>
          </div>
        );
      })}
    </div>
  );
}

export default function Booking() {
  const { tripPlan, totalItems, totalPrice, clearTrip } = useTrip();
  const [traveler, setTraveler] = useState(loadTraveler);
  const [step, setStep] = useState(loadStep);
  const [errors, setErrors] = useState({});
  const [confirmation, setConfirmation] = useState(loadConfirmation);
  const [copiedReference, setCopiedReference] = useState(false);

  const totalTravelers = useMemo(() => countTravelers(traveler), [traveler]);
  const estimatedTotal = totalPrice * totalTravelers;
  const tripDayCount = tripPlan.days.length;
  const tripEndDate = getTripEndDate(traveler.travelDate, tripDayCount);
  const tripDuration = formatTripDuration(tripDayCount);
  const displayConfirmation = confirmation && totalItems === 0;

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(traveler));
    } catch {
      // Draft persistence is a convenience; the booking still works without it.
    }
  }, [traveler]);

  useEffect(() => {
    if (step < 3) {
      try {
        localStorage.setItem(STEP_KEY, String(step));
      } catch {
        // Ignore storage failures.
      }
    }
  }, [step]);

  useEffect(() => {
    if (!displayConfirmation) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [displayConfirmation]);

  const updateField = (field, value) => {
    setTraveler((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, emergency: undefined }));
  };

  const handleTravelerCount = (field, value) => {
    const minimum = field === "adults" ? 1 : 0;
    const parsed = Number.parseInt(value, 10);
    updateField(field, Number.isFinite(parsed) ? Math.max(minimum, parsed) : minimum);
  };

  const handleContinue = (event) => {
    event.preventDefault();
    const nextErrors = validateTraveler(traveler);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstInvalid = document.querySelector(".booking-field.has-error input");
      firstInvalid?.focus();
      return;
    }
    setErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirm = () => {
    const booking = {
      reference: generateReference(),
      createdAt: new Date().toISOString(),
      status: "request-received",
      traveler: { ...traveler },
      tripPlan: JSON.parse(JSON.stringify(tripPlan)),
      travelEndDate: tripEndDate,
      tripDays: tripDayCount,
      tripNights: Math.max(0, tripDayCount - 1),
      pricePerTraveler: totalPrice,
      travelerCount: totalTravelers,
      estimatedTotal,
    };

    setConfirmation(booking);
    setStep(3);

    try {
      sessionStorage.setItem(CONFIRMATION_KEY, JSON.stringify(booking));
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(STEP_KEY);
    } catch {
      // Confirmation remains visible in-memory even if storage is unavailable.
    }

    clearTrip();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startAnotherTrip = () => {
    try {
      sessionStorage.removeItem(CONFIRMATION_KEY);
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(STEP_KEY);
    } catch {
      // Ignore storage failures.
    }
    setConfirmation(null);
    setCopiedReference(false);
    setTraveler(emptyTraveler);
    setStep(1);
  };

  const copyBookingReference = async () => {
    if (!confirmation?.reference) return;

    try {
      await navigator.clipboard.writeText(confirmation.reference);
      setCopiedReference(true);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = confirmation.reference;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedReference(true);
    }

    window.setTimeout(() => setCopiedReference(false), 1800);
  };

  if (displayConfirmation) {
    const confirmedTraveler = confirmation.traveler;
    const confirmedDayCount = confirmation.tripDays || confirmation.tripPlan.days.length;
    const confirmedEndDate =
      confirmation.travelEndDate ||
      getTripEndDate(confirmedTraveler.travelDate, confirmedDayCount);
    const confirmedDestinations = getDestinationSummary(confirmation.tripPlan);

    return (
      <div className="booking-receipt-overlay" role="presentation">
        <section
          className="booking-receipt"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-receipt-title"
        >
          <div className="booking-receipt__success" aria-hidden="true">
            <CheckCircle2 size={30} />
          </div>

          <span className="booking-receipt__brand">AddyVenture Travel & Tours</span>
          <span className="booking-receipt__status">Request Received</span>
          <h1 id="booking-receipt-title">Your trip request is on its way.</h1>
          <p className="booking-receipt__intro">
            Screenshot this confirmation and keep your booking code for future reference.
          </p>

          <div className="booking-receipt__code">
            <span>Booking / Traveler Code</span>
            <strong>{confirmation.reference}</strong>
            <button type="button" onClick={copyBookingReference}>
              <Copy size={15} />
              {copiedReference ? "Copied!" : "Copy code"}
            </button>
          </div>

          <dl className="booking-receipt__details">
            <div>
              <dt>Lead traveler</dt>
              <dd>{confirmedTraveler.name}</dd>
            </div>
            <div>
              <dt>Travel dates</dt>
              <dd>{formatDateRange(confirmedTraveler.travelDate, confirmedEndDate)}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{formatTripDuration(confirmedDayCount)}</dd>
            </div>
            <div>
              <dt>Travel party</dt>
              <dd>
                {confirmation.travelerCount}{" "}
                {confirmation.travelerCount === 1 ? "traveler" : "travelers"}
              </dd>
            </div>
            <div>
              <dt>Estimated total</dt>
              <dd>₱{confirmation.estimatedTotal.toLocaleString()}</dd>
            </div>
          </dl>

          <div className="booking-receipt__destinations">
            <span>Trip at a glance</span>
            <p>
              {confirmedDestinations.length > 0
                ? confirmedDestinations.join(" · ")
                : `${confirmedDayCount}-day custom itinerary`}
            </p>
          </div>

          <div className="booking-receipt__notice">
            <ShieldCheck size={17} />
            <p>
              No payment has been collected yet. AddyVenture will review availability and
              contact you before final pricing and payment.
            </p>
          </div>

          <Link className="btn btn-primary booking-receipt__done" to="/" onClick={startAnotherTrip}>
            Done
          </Link>
        </section>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="container booking booking--empty">
        <span className="eyebrow">Booking</span>
        <h1>Build your itinerary first.</h1>
        <p>
          Your booking request needs at least one tour. Add destinations to your itinerary,
          then come back here to continue.
        </p>
        <div className="booking-actions">
          <Link className="btn btn-secondary" to="/tours">Browse Tours</Link>
          <Link className="btn btn-primary" to="/plan-trip">Open Trip Planner</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container booking">
      <StepIndicator step={step} />

      <div className="booking-heading">
        <div>
          <span className="eyebrow">Phase 4 · Booking request</span>
          <h1>{step === 1 ? "Tell us who’s traveling" : "Review your adventure"}</h1>
          <p>
            {step === 1
              ? "Your itinerary is saved while you complete these details, so you can safely go back and edit it anytime."
              : "Check the traveler details, itinerary, and estimated price before sending your request."}
          </p>
        </div>
        <div className="booking-heading__seal">
          <ShieldCheck size={18} />
          <span>No payment at this stage</span>
        </div>
      </div>

      {step === 1 ? (
        <form className="booking-layout" onSubmit={handleContinue} noValidate>
          <div className="booking-main">
            <section className="booking-card">
              <div className="booking-card__title">
                <CircleUserRound size={20} />
                <div>
                  <h2>Lead traveler</h2>
                  <p>We’ll use these details for trip coordination.</p>
                </div>
              </div>

              <div className="booking-form-grid">
                <label className={`booking-field booking-field--wide ${errors.name ? "has-error" : ""}`}>
                  <span>Full name <b>*</b></span>
                  <input
                    type="text"
                    value={traveler.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. Addy Luy"
                    autoComplete="name"
                  />
                  {errors.name && <small>{errors.name}</small>}
                </label>

                <label className={`booking-field ${errors.email ? "has-error" : ""}`}>
                  <span><Mail size={14} /> Email <b>*</b></span>
                  <input
                    type="email"
                    value={traveler.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {errors.email && <small>{errors.email}</small>}
                </label>

                <label className={`booking-field ${errors.phone ? "has-error" : ""}`}>
                  <span><Phone size={14} /> Mobile number <b>*</b></span>
                  <input
                    type="tel"
                    value={traveler.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                    autoComplete="tel"
                  />
                  {errors.phone && <small>{errors.phone}</small>}
                </label>

                <label className={`booking-field ${errors.travelDate ? "has-error" : ""}`}>
                  <span><CalendarDays size={14} /> Trip start date <b>*</b></span>
                  <input
                    type="date"
                    min={getLocalDateValue()}
                    value={traveler.travelDate}
                    onChange={(e) => updateField("travelDate", e.target.value)}
                  />
                  {errors.travelDate && <small>{errors.travelDate}</small>}
                </label>

                <label className="booking-field">
                  <span>Nationality</span>
                  <input
                    type="text"
                    value={traveler.nationality}
                    onChange={(e) => updateField("nationality", e.target.value)}
                    placeholder="e.g. Filipino"
                    autoComplete="country-name"
                  />
                </label>
              </div>

              <div className={`booking-date-summary ${traveler.travelDate ? "is-ready" : ""}`}>
                <CalendarDays size={18} />
                <div>
                  <span>Automatic travel schedule</span>
                  {traveler.travelDate ? (
                    <>
                      <strong>{formatDateRange(traveler.travelDate, tripEndDate)}</strong>
                      <small>
                        {tripDuration} · Your {tripDayCount}-day itinerary automatically sets the return date.
                      </small>
                    </>
                  ) : (
                    <small>
                      Pick only your start date. Your itinerary automatically determines the trip duration and end date.
                    </small>
                  )}
                </div>
              </div>
            </section>

            <section className="booking-card">
              <div className="booking-card__title">
                <Users size={20} />
                <div>
                  <h2>Travel party</h2>
                  <p>Tell us how many people are joining the trip.</p>
                </div>
              </div>

              <div className="traveler-counts">
                <label className={errors.adults ? "has-error" : ""}>
                  <span>Adults</span>
                  <small>13+ years</small>
                  <input
                    type="number"
                    min="1"
                    value={traveler.adults}
                    onChange={(e) => handleTravelerCount("adults", e.target.value)}
                  />
                </label>
                <label>
                  <span>Children</span>
                  <small>2–12 years</small>
                  <input
                    type="number"
                    min="0"
                    value={traveler.children}
                    onChange={(e) => handleTravelerCount("children", e.target.value)}
                  />
                </label>
                <label>
                  <span>Infants</span>
                  <small>Under 2 years</small>
                  <input
                    type="number"
                    min="0"
                    value={traveler.infants}
                    onChange={(e) => handleTravelerCount("infants", e.target.value)}
                  />
                </label>
              </div>
              {errors.adults && <p className="booking-section-error">{errors.adults}</p>}

              <div className="traveler-total">
                <span>Total travelers</span>
                <strong>{totalTravelers}</strong>
              </div>
            </section>

            <section className="booking-card">
              <div className="booking-card__title">
                <Phone size={20} />
                <div>
                  <h2>Emergency contact <small>Optional</small></h2>
                  <p>Useful for longer or activity-heavy itineraries.</p>
                </div>
              </div>

              <div className="booking-form-grid">
                <label className={`booking-field ${errors.emergency ? "has-error" : ""}`}>
                  <span>Contact name</span>
                  <input
                    type="text"
                    value={traveler.emergencyName}
                    onChange={(e) => updateField("emergencyName", e.target.value)}
                    placeholder="Full name"
                  />
                </label>
                <label className={`booking-field ${errors.emergency ? "has-error" : ""}`}>
                  <span>Contact number</span>
                  <input
                    type="tel"
                    value={traveler.emergencyPhone}
                    onChange={(e) => updateField("emergencyPhone", e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                  />
                </label>
              </div>
              {errors.emergency && <p className="booking-section-error">{errors.emergency}</p>}
            </section>

            <section className="booking-card">
              <div className="booking-card__title">
                <Sparkles size={20} />
                <div>
                  <h2>Special requests <small>Optional</small></h2>
                  <p>Accessibility needs, room preferences, celebrations, or other notes.</p>
                </div>
              </div>
              <label className="booking-field booking-field--wide">
                <textarea
                  rows="5"
                  maxLength="600"
                  value={traveler.specialRequests}
                  onChange={(e) => updateField("specialRequests", e.target.value)}
                  placeholder="Tell us anything that would help us plan your trip better..."
                />
                <em>{traveler.specialRequests.length}/600</em>
              </label>
            </section>
          </div>

          <aside className="booking-price-card">
            <span>Estimated trip total</span>
            <strong>₱{estimatedTotal.toLocaleString()}</strong>
            <div>
              <p><b>₱{totalPrice.toLocaleString()}</b> itinerary / traveler</p>
              <p><b>× {totalTravelers}</b> {totalTravelers === 1 ? "traveler" : "travelers"}</p>
            </div>
            <small>
              Prototype estimate uses the same tour rate for every traveler. Final child/infant
              pricing, availability, and add-ons are confirmed before payment.
            </small>
            <button className="btn btn-primary booking-price-card__cta" type="submit">
              Review Booking <ArrowRight size={16} />
            </button>
            <Link to="/plan-trip" className="booking-price-card__edit">
              <ArrowLeft size={14} /> Edit itinerary
            </Link>
          </aside>
        </form>
      ) : (
        <div className="booking-review-layout">
          <div className="booking-main">
            <section className="booking-card booking-review-card">
              <div className="booking-review-card__heading">
                <div>
                  <span className="booking-kicker">Traveler details</span>
                  <h2>{traveler.name}</h2>
                </div>
                <button className="booking-text-button" type="button" onClick={() => setStep(1)}>
                  Edit
                </button>
              </div>

              <div className="booking-review-facts">
                <span><Mail size={14} /> {traveler.email}</span>
                <span><Phone size={14} /> {traveler.phone}</span>
                <span><CalendarDays size={14} /> {formatDateRange(traveler.travelDate, tripEndDate)}</span>
                <span><CalendarDays size={14} /> {tripDuration}</span>
                <span><Users size={14} /> {totalTravelers} {totalTravelers === 1 ? "traveler" : "travelers"}</span>
                {traveler.nationality && <span><MapPin size={14} /> {traveler.nationality}</span>}
              </div>

              <div className="booking-party-breakdown">
                <span>{traveler.adults} adult{traveler.adults === 1 ? "" : "s"}</span>
                <span>{traveler.children} child{traveler.children === 1 ? "" : "ren"}</span>
                <span>{traveler.infants} infant{traveler.infants === 1 ? "" : "s"}</span>
              </div>

              {traveler.emergencyName && (
                <p className="booking-review-note">
                  <strong>Emergency contact:</strong> {traveler.emergencyName} · {traveler.emergencyPhone}
                </p>
              )}
              {traveler.specialRequests && (
                <p className="booking-review-note">
                  <strong>Special requests:</strong> {traveler.specialRequests}
                </p>
              )}
            </section>

            <section className="booking-card">
              <div className="booking-review-card__heading">
                <div>
                  <span className="booking-kicker">Your itinerary</span>
                  <h2>{tripDuration}</h2>
                </div>
                <Link className="booking-text-button" to="/plan-trip">Edit itinerary</Link>
              </div>

              <div className="booking-days">
                {tripPlan.days.map((day, index) => (
                  <DaySummary
                    key={day.dayNumber}
                    day={day}
                    travelDate={addDaysToDateValue(traveler.travelDate, index)}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="booking-price-card booking-price-card--review">
            <span>Price summary</span>
            <dl>
              <div><dt>Itinerary / traveler</dt><dd>₱{totalPrice.toLocaleString()}</dd></div>
              <div><dt>Travelers</dt><dd>× {totalTravelers}</dd></div>
              <div className="booking-price-card__total"><dt>Estimated total</dt><dd>₱{estimatedTotal.toLocaleString()}</dd></div>
            </dl>
            <small>
              Sending this request does not charge you. AddyVenture will confirm availability
              and final pricing before any payment step.
            </small>
            <button className="btn btn-primary booking-price-card__cta" type="button" onClick={handleConfirm}>
              Send Trip Request <CheckCircle2 size={16} />
            </button>
            <button className="booking-price-card__edit" type="button" onClick={() => setStep(1)}>
              <ArrowLeft size={14} /> Back to traveler details
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
