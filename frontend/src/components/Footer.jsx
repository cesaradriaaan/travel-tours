import { Link } from "react-router-dom";
import { Compass, Mail } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="container footer__inner">
          <div className="footer__brand">
            <div className="footer__logo">
              <Compass size={20} aria-hidden="true" />
              <span>AddyVenture Travel & Tours</span>
            </div>
            <p>
              Curated trips across the Philippines&apos; islands, coastlines, and
              heritage towns. From Dream Destinations to Real <i>AddyVentures</i>.
            </p>
          </div>

          <div className="footer__col">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/tours">All Tours</Link></li>
              <li><Link to="/plan-trip">Plan a Trip</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/booking">Book Now</Link></li>
            </ul>
          </div>

          <div className="footer__col footer__help">
            <h4>Need help?</h4>
            <Link to="/contact" className="footer__contact-link">
              <Mail size={17} aria-hidden="true" />
              <span>Contact us</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} AddyVenture Travel & Tours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
