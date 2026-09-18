import { Home, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";
import BrandMark from "../components/BrandMark";

import "./NotFound.css";

export default function NotFound() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <div className="container not-found__inner">
        <div className="not-found__emblem" aria-hidden="true">
          <BrandMark />
        </div>

        <span className="not-found__code">404</span>

        <h1 id="not-found-title">This route drifted off the map.</h1>

        <p>
          The page may have moved, or the address may be incomplete. Let&apos;s
          guide you back to an AddyVenture destination.
        </p>

        <div className="not-found__actions">
          <Link className="btn btn-primary" to="/">
            <Home size={18} aria-hidden="true" />
            Back to Home
          </Link>

          <Link className="btn btn-secondary" to="/tours">
            <MapPinned size={18} aria-hidden="true" />
            Browse Tours
          </Link>
        </div>
      </div>
    </section>
  );
}
