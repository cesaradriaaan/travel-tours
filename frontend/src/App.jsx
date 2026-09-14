import { useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RequireAdmin from "./components/RequireAdmin";
import RequireAuth from "./components/RequireAuth";

import Home from "./pages/Home";
import Tours from "./pages/Tours";
import TourDetail from "./pages/TourDetail";
import PlanTrip from "./pages/PlanTrip";
import Booking from "./pages/Booking";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import MyBookings from "./pages/MyBookings";
import MyBookingDetail from "./pages/MyBookingDetail";

import AdminBookings from "./pages/AdminBookings";
import AdminMessages from "./pages/AdminMessages";

import { checkBackendHealth } from "./services/api";

const pageTitles = {
  "/": "AddyVenture Travel & Tours",
  "/tours": "Tours | AddyVenture",
  "/plan-trip": "Plan a Trip | AddyVenture",
  "/booking": "Booking | AddyVenture",
  "/about": "About | AddyVenture",
  "/contact": "Contact | AddyVenture",

  "/login": "Login | AddyVenture",
  "/register": "Create Account | AddyVenture",
  "/account": "My Account | AddyVenture",
  "/my-bookings": "My Bookings | AddyVenture",

  "/admin/bookings":
    "Admin Bookings | AddyVenture",

  "/admin/messages":
    "Admin Messages | AddyVenture",
};

function RouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title =
      pathname.startsWith("/tours/")
        ? "Tour Details | AddyVenture"
        : pathname.startsWith(
            "/my-bookings/"
          )
        ? "Booking Details | AddyVenture"
        : pageTitles[pathname] ||
          "AddyVenture Travel & Tours";

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        console.log(
          "Backend connected:",
          data
        );
      })
      .catch((error) => {
        console.error(
          "Backend error:",
          error
        );
      });
  }, []);

  return (
    <>
      <RouteEffects />

      <a
        className="skip-link"
        href="#main-content"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/tours"
            element={<Tours />}
          />

          <Route
            path="/tours/:id"
            element={<TourDetail />}
          />

          <Route
            path="/plan-trip"
            element={<PlanTrip />}
          />

          <Route
            path="/booking"
            element={
              <RequireAuth>
                <Booking />
              </RequireAuth>
            }
          />

          <Route
            path="/account"
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <RequireAuth>
                <MyBookings />
              </RequireAuth>
            }
          />

          <Route
            path="/my-bookings/:id"
            element={
              <RequireAuth>
                <MyBookingDetail />
              </RequireAuth>
            }
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/admin/bookings"
            element={
              <RequireAdmin>
                <AdminBookings />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/messages"
            element={
              <RequireAdmin>
                <AdminMessages />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>

      <Footer />
    </>
  );
}