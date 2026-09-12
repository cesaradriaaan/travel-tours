import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import "./TourCard.css";

export default function TourCard({ tour }) {
  return (
    <Link to={`/tours/${tour.id}`} className="tour-card">
      <div className="tour-card__image-wrap">
        <img src={tour.images[0]} alt={tour.title} loading="lazy" decoding="async" />
      </div>
      <div className="tour-card__body">
        <div className="tour-card__meta">
          <span><MapPin size={14} /> {tour.region}</span>
          <span><Clock size={14} /> {tour.durationDays} days</span>
        </div>
        <h3 className="tour-card__title">{tour.title}</h3>
        <p className="tour-card__summary">{tour.summary}</p>
        <div className="tour-card__footer">
          <span className="tour-card__price">
            ₱{tour.price.toLocaleString()} <small>/ person</small>
          </span>
          <span className="tour-card__link">View details</span>
        </div>
      </div>
    </Link>
  );
}
