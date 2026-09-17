import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import {
  handleImageError,
  markImageLoaded,
} from "../lib/imageFallback";
import {
  getOptimizedImageSources,
  getOptimizedImageUrl,
} from "../lib/imageUrl";
import "./TourCard.css";

export default function TourCard({ tour }) {
  const cardImages =
    getOptimizedImageSources(
      tour.images,
      { width: 720, quality: 76 }
    );

  return (
    <Link to={`/tours/${tour.id}`} className="tour-card">
      <div className="tour-card__image-wrap image-loader">
        <img
          src={cardImages[0]}
          srcSet={`${getOptimizedImageUrl(
            tour.images[0],
            { width: 420, quality: 74 }
          )} 420w, ${cardImages[0]} 720w, ${getOptimizedImageUrl(
            tour.images[0],
            { width: 960, quality: 78 }
          )} 960w`}
          sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 31vw"
          alt={tour.title}
          loading="lazy"
          decoding="async"
          width="800"
          height="600"
          onLoad={markImageLoaded}
          onError={(event) =>
            handleImageError(
              event,
              cardImages
            )
          }
        />
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
