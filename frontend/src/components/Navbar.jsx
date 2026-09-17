import { useEffect, useState } from "react";
import {
  NavLink,
  useLocation,
} from "react-router-dom";
import {
  Menu,
  X,
  Compass,
  UserRound,
} from "lucide-react";

import { useTrip } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";

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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

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
          <Compass
            size={22}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span>AddyVenture Travel & Tours</span>
        </NavLink>

        <nav
          id="primary-navigation"
          aria-label="Primary navigation"
          className={`navbar__links ${
            open ? "is-open" : ""
          }`}
        >
          {links.map((link) => (
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

          {!loading && user && isAdmin && (
            <>
              <NavLink
                to="/admin/bookings"
                className={({ isActive }) =>
                  "navbar__link" +
                  (isActive ? " is-active" : "")
                }
                onClick={() => setOpen(false)}
              >
                Bookings
              </NavLink>

              <NavLink
                to="/admin/messages"
                className={({ isActive }) =>
                  "navbar__link" +
                  (isActive ? " is-active" : "")
                }
                onClick={() => setOpen(false)}
              >
                Messages
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
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <UserRound size={17} />

                {profile?.full_name || "My Account"}
              </span>
            </NavLink>
          )}

          <NavLink
            to="/booking"
            className="btn btn-primary navbar__cta"
            onClick={() => setOpen(false)}
          >
            Book Your Trip
          </NavLink>
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
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>
    </header>
  );
}
