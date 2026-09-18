import { useEffect, useState } from "react";
import {
  NavLink,
  useLocation,
} from "react-router-dom";
import {
  Menu,
  X,
  UserRound,
} from "lucide-react";

import { useTrip } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";
import BrandMark from "./BrandMark";

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
  const { pathname } = useLocation();

  const { totalItems } = useTrip();

  const {
    user,
    profile,
    isAdmin,
    loading,
  } = useAuth();

  const visibleLinks = isAdmin
    ? links.filter(
        (link) => link.to !== "/plan-trip"
      )
    : links;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      closeOnEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        closeOnEscape
      );
    };
  }, [open]);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink
          to="/"
          className="navbar__logo"
          onClick={() => setOpen(false)}
        >
          <BrandMark />
          <span>AddyVenture Travel & Tours</span>
        </NavLink>

        <nav
          id="primary-navigation"
          aria-label="Primary navigation"
          className={`navbar__links ${
            open ? "is-open" : ""
          }`}
        >
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                "navbar__link" +
                (isActive ? " is-active" : "")
              }
              onClick={() => setOpen(false)}
            >
              {link.label}

              {link.to === "/plan-trip" &&
                totalItems > 0 && (
                  <span className="navbar__badge">
                    {totalItems}
                  </span>
                )}
            </NavLink>
          ))}

          {!loading && !user && (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  "navbar__link" +
                  (isActive ? " is-active" : "")
                }
                onClick={() => setOpen(false)}
              >
                Log In
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  "navbar__link" +
                  (isActive ? " is-active" : "")
                }
                onClick={() => setOpen(false)}
              >
                Create Account
              </NavLink>
            </>
          )}

          {!loading && user && (
            <NavLink
              to="/account"
              className={({ isActive }) =>
                "navbar__link" +
                (isActive ? " is-active" : "")
              }
              onClick={() => setOpen(false)}
              title="My Account"
            >
              <span className="navbar__account-label">
                <UserRound size={17} aria-hidden="true" />

                {profile?.full_name || "My Account"}
              </span>
            </NavLink>
          )}

          {!isAdmin && (
            <NavLink
              to="/booking"
              className="btn btn-primary navbar__cta"
              onClick={() => setOpen(false)}
            >
              Book Your Trip
            </NavLink>
          )}
        </nav>

        <button
          type="button"
          className="navbar__toggle"
          aria-label={
            open ? "Close menu" : "Open menu"
          }
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() =>
            setOpen((current) => !current)
          }
        >
          {open ? (
            <X size={24} aria-hidden="true" />
          ) : (
            <Menu size={24} aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
}
