import { useParams, Link } from "react-router-dom";
import { MapPin, Clock, Check, X } from "lucide-react";

import { getTourById } from "../data/tours";
import { useTrip } from "../context/TripContext";

import Gallery from "../components/Gallery";

import "./TourDetail.css";

export default function TourDetail() {
  const { id } = useParams();
  const tour = getTourById(id);

  const {
    addTourToTrip,
    isInTrip,
    findTourDay,
  } = useTrip();

  if (!tour) {
    return (
      <div className="container placeholder">
        <h1>Tour not found</h1>

        <p>We couldn't find that tour.</p>

        <Link
          to="/tours"
          className="btn btn-secondary"
        >
          Back to Tours
        </Link>
      </div>
    );
  }

  const alreadyAdded = isInTrip(tour.id);
  const existingDay = alreadyAdded
    ? findTourDay(tour.id)
    : null;

  return (
    <div className="tour-detail">
      <div className="container">

        <div className="tour-detail__close-wrapper">
          <Link
            to="/tours"
            className="tour-detail__close"
            aria-label="Close tour details"
            title="Back to Tours"
          >
            <X size={22} />
          </Link>
        </div>

        <Gallery
          images={tour.images}
          alt={tour.title}
        />

        <div className="tour-detail__layout">
          <div className="tour-detail__main">

            <div className="tour-detail__tags">
              {tour.tags.map((tag) => (
                <span
                  key={tag}
                  className="tour-detail__tag"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1>{tour.title}</h1>

            <div className="tour-detail__meta">
              <span>
                <MapPin size={16} />
                {tour.region}
              </span>

              <span>
                <Clock size={16} />
                {tour.durationDays} days
              </span>
            </div>

            <p className="tour-detail__summary">
              {tour.summary}
            </p>

            <h3>Highlights</h3>

            <ul className="tour-detail__highlights">
              {tour.highlights.map((highlight) => (
                <li key={highlight}>
                  <Check size={16} />
                  {highlight}
                </li>
              ))}
            </ul>

            <h3>Day-by-day itinerary</h3>

            <div className="tour-detail__itinerary">
              {tour.sampleItinerary.map((day) => (
                <div
                  key={day.day}
                  className="itinerary-day"
                >
                  <div className="itinerary-day__number">
                    Day {day.day}
                  </div>

                  <div className="itinerary-day__body">
                    <h4>{day.title}</h4>
                    <p>{day.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="tour-detail__sidebar">
            <div className="booking-card">

              <div className="booking-card__price">
                ₱{tour.price.toLocaleString()}{" "}
                <small>/ person</small>
              </div>

              {alreadyAdded ? (
                <Link
                  to="/plan-trip"
                  className="btn btn-secondary booking-card__btn"
                >
                  Already in Trip - View Day {existingDay}
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary booking-card__btn"
                  onClick={() =>
                    addTourToTrip(tour.id)
                  }
                >
                  Add to Trip
                </button>
              )}

              <Link
                to="/booking"
                className="btn btn-secondary booking-card__btn"
                onClick={() => {
                  if (!alreadyAdded) {
                    addTourToTrip(tour.id);
                  }
                }}
              >
                Book Now
              </Link>

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
