import { Link } from "react-router-dom";
import { Compass, Facebook, Instagram, Mail } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <Compass size={20} />
            <span>AddyVenture Travel & Tours</span>
          </div>
          <p>
            Curated trips across the Philippines' islands, coastlines, and
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

        <div className="footer__col">
          <h4>Connect</h4>
          <div className="footer__social">
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Email"><Mail size={18} /></a>
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
