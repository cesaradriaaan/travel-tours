import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Compass } from "lucide-react";
import { useTrip } from "../context/TripContext";
import "./Navbar.css";

const links = [
  { to: "/", label: "Home" },
  { to: "/tours", label: "Tours" },
  { to: "/plan-trip", label: "Plan a Trip" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useTrip();

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__logo" onClick={() => setOpen(false)}>
          <Compass size={22} strokeWidth={2} />
          <span>AddyVenture Travel & Tours</span>
        </NavLink>

        <nav aria-label="Primary navigation" className={`navbar__links ${open ? "is-open" : ""}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                "navbar__link" + (isActive ? " is-active" : "")
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
              {link.to === "/plan-trip" && totalItems > 0 && (
                <span className="navbar__badge">{totalItems}</span>
              )}
            </NavLink>
          ))}
          <NavLink to="/booking" className="btn btn-primary navbar__cta" onClick={() => setOpen(false)}>
            Book Your Trip
          </NavLink>
        </nav>

        <button
          className="navbar__toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
