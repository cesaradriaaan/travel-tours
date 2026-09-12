import { Link } from "react-router-dom";
import { Compass, HeartHandshake, MapPinned, Route, ShieldCheck } from "lucide-react";
import "./About.css";

const values = [
  {
    icon: Route,
    title: "Trips built around you",
    text: "Choose the places you actually want to see, then shape them into one flexible day-by-day itinerary.",
  },
  {
    icon: MapPinned,
    title: "Philippines first",
    text: "Our experience is designed around island escapes, mountain towns, beaches, heritage stops, and local adventures across the country.",
  },
  {
    icon: ShieldCheck,
    title: "Clear before you commit",
    text: "Review your dates, travelers, itinerary, and estimated total before sending a booking request.",
  },
  {
    icon: HeartHandshake,
    title: "Human-friendly planning",
    text: "The process stays simple: build, review, request, then keep your booking reference for follow-up.",
  },
];

export default function About() {
  return (
    <>
      <section className="about-hero">
        <div className="container about-hero__grid">
          <div>
            <span className="eyebrow">About AddyVenture</span>
            <h1>Travel planning that starts with your kind of adventure.</h1>
            <p className="about-hero__lead">
              AddyVenture Travel &amp; Tours is built for travelers who want more say in the trip itself — not just a fixed package handed to them.
            </p>
            <div className="about-hero__actions">
              <Link to="/plan-trip" className="btn btn-primary">Build My Itinerary</Link>
              <Link to="/tours" className="btn btn-secondary">Browse Tours</Link>
            </div>
          </div>

          <div className="about-hero__card" aria-label="AddyVenture travel planning summary">
            <Compass size={34} aria-hidden="true" />
            <p className="about-hero__quote">From dream destinations to real <em>AddyVentures.</em></p>
            <p>Start with a place you love, build the days around it, then review everything before you send your request.</p>
          </div>
        </div>
      </section>

      <section className="section about-story">
        <div className="container about-story__grid">
          <div>
            <span className="eyebrow">Our approach</span>
            <h2>Less package hunting. More trip building.</h2>
          </div>
          <div>
            <p>
              Instead of forcing every traveler into the same route, AddyVenture lets you combine destinations into an itinerary that makes sense for your own pace and interests.
            </p>
            <p>
              Your itinerary becomes the foundation of the booking flow: it determines the trip duration, organizes each travel day, and gives you one clear summary before submission.
            </p>
          </div>
        </div>
      </section>

      <section className="section about-values">
        <div className="container">
          <span className="eyebrow">What we value</span>
          <h2>A planning experience that stays clear from start to finish.</h2>
          <div className="about-values__grid">
            {values.map(({ icon: Icon, title, text }) => (
              <article className="about-value" key={title}>
                <Icon size={26} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-steps">
        <div className="container">
          <span className="eyebrow">How it works</span>
          <h2>Three simple moves from idea to travel request.</h2>
          <ol className="about-steps__list">
            <li>
              <span>01</span>
              <div><h3>Explore</h3><p>Browse destinations and find tours that fit the experience you want.</p></div>
            </li>
            <li>
              <span>02</span>
              <div><h3>Build</h3><p>Create your day-by-day itinerary, add trip details, and arrange the journey your way.</p></div>
            </li>
            <li>
              <span>03</span>
              <div><h3>Review &amp; Request</h3><p>Check the full trip summary, choose your start date, and submit your booking request.</p></div>
            </li>
          </ol>
        </div>
      </section>

      <section className="about-cta">
        <div className="container about-cta__inner">
          <div>
            <h2>Your next itinerary can start here.</h2>
            <p>Build the trip first. Decide with the full picture in front of you.</p>
          </div>
          <Link to="/plan-trip" className="btn btn-on-dark">Plan My Trip</Link>
        </div>
      </section>
    </>
  );
}
