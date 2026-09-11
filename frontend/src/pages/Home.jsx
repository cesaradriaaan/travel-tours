import { Link } from "react-router-dom";
import { ShieldCheck, MapPinned, Route, Compass } from "lucide-react";
import TourCard from "../components/TourCard";
import { tours } from "../data/tours";
import "./Home.css";

const featured = tours.slice(0, 3);

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <span className="eyebrow">Philippines, your way</span>
            <h1>
              7,641 islands.
              <br />
              One trip that finds your favorites.
            </h1>
            <p>
              From El Nido's lagoons to Batad's rice terraces, we build
              itineraries around the islands, dives, and heritage towns
              you actually want to see — not a fixed package.
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
          <div className="hero__image">
            <img
              src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1000&q=80"
              alt="Limestone cliffs and turquoise lagoon in El Nido, Palawan"
            />
          </div>
        </div>
      </section>

      <section className="section">
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
              <p>No hidden fees — the price you see is the price you pay.</p>
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
