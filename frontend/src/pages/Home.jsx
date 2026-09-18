import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, MapPinned, Route, Compass } from "lucide-react";
import TourCard from "../components/TourCard";
import { tours } from "../data/tours";
import {
  handleImageError,
  markImageLoaded,
} from "../lib/imageFallback";
import {
  getOptimizedImageSources,
  getOptimizedImageUrl,
} from "../lib/imageUrl";
import "./Home.css";

const featured = tours.slice(0, 3);
const marqueePlaces = ["Palawan", "Siargao", "Bohol", "Banaue", "Vigan", "Coron"];
const heroSlides = tours.slice(0, 5).map((tour) => ({
  src: getOptimizedImageUrl(
    tour.images[0],
    { width: 1000, quality: 80 }
  ),
  sources: getOptimizedImageSources(
    tour.images,
    { width: 1000, quality: 80 }
  ),
  label: tour.region,
  title: tour.title,
}));

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || heroSlides.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;

    const nextIndex =
      (activeSlide + 1) %
      heroSlides.length;
    const preload = new Image();
    preload.decoding = "async";
    preload.src = heroSlides[nextIndex].src;

    return () => {
      preload.onload = null;
      preload.onerror = null;
    };
  }, [activeSlide]);

  const activeHero = heroSlides[activeSlide];

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <span className="eyebrow">Philippines, your way</span>
            <h1>
              7,641 islands.
              <br />
              <span className="hero__highlight">One trip that finds your favorites.</span>
            </h1>
            <p>
              From El Nido's lagoons to Batad's rice terraces, we build
              itineraries around the islands, dives, and heritage towns
              you actually want to see, not a fixed package.
            </p>
            <div className="hero__actions">
              <Link to="/tours" className="btn btn-primary">
                Browse Tours
              </Link>
              <Link to="/plan-trip" className="btn btn-secondary">
                Start Planning
              </Link>
            </div>
          </div>

          <div className="hero__visual">
            <span className="hero__orbit hero__orbit--one" aria-hidden="true" />
            <span className="hero__orbit hero__orbit--two" aria-hidden="true" />
            <div className="hero__image hero__slideshow image-loader">
              <img
                key={activeHero.title}
                className="hero__slide hero__slide--active"
                src={activeHero.src}
                alt={activeHero.title}
                loading="eager"
                decoding="async"
                fetchpriority={activeSlide === 0 ? "high" : "auto"}
                width="800"
                height="1000"
                onLoad={markImageLoaded}
                onError={(event) =>
                  handleImageError(
                    event,
                    activeHero.sources
                  )
                }
              />
              <div className="hero__caption" aria-live="off">
                <span>{activeHero.label}</span>
                <strong>{activeHero.title}</strong>
              </div>
            </div>
            <div className="hero__float hero__float--one" aria-hidden="true">
              <MapPinned size={18} />
              <span>Island hopping</span>
            </div>
            <div className="hero__float hero__float--two" aria-hidden="true">
              <Route size={18} />
              <span>Custom routes</span>
            </div>
            <div className="hero__float hero__float--three" aria-hidden="true">
              <Compass size={18} />
              <span>Your pace</span>
            </div>
          </div>
        </div>
      </section>

      <div className="travel-marquee" aria-hidden="true">
        <div className="travel-marquee__track">
          {Array.from({ length: 6 }, () => marqueePlaces).flat().map((place, index) => (
            <span key={`${place}-${index}`}>
              {place}<b>✦</b>
            </span>
          ))}
        </div>
      </div>

      <section className="section featured-section">
        <div className="container">
          <span className="eyebrow">Featured tours</span>
          <h2>Where travelers are headed this season</h2>
          <div className="home-grid">
            {featured.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
          <div className="home-grid__more">
            <Link to="/tours" className="btn btn-secondary">
              See all tours
            </Link>
          </div>
        </div>
      </section>

      <section className="section why-us">
        <div className="container">
          <span className="eyebrow">Why book with us</span>
          <h2>Built for how you actually travel</h2>
          <div className="why-us__grid">
            <div className="why-us__item">
              <Route size={26} />
              <h3>Build your own itinerary</h3>
              <p>Mix tours across regions into one custom, day-by-day plan.</p>
            </div>
            <div className="why-us__item">
              <MapPinned size={26} />
              <h3>Local, vetted operators</h3>
              <p>Every tour is run by operators we've worked with directly.</p>
            </div>
            <div className="why-us__item">
              <ShieldCheck size={26} />
              <h3>Transparent pricing</h3>
              <p>No hidden fees. The price you see is the price you pay.</p>
            </div>
            <div className="why-us__item">
              <Compass size={26} />
              <h3>Flexible planning</h3>
              <p>Add, remove, or reorder tours anytime before you book.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container cta-band__inner">
          <div>
            <h2>Ready to see the islands?</h2>
            <p>Start with a tour you love, or build your trip from scratch.</p>
          </div>
          <Link to="/plan-trip" className="btn btn-on-dark">
            Plan My Trip
          </Link>
        </div>
      </section>
    </>
  );
}
