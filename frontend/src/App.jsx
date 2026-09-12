import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import TourDetail from "./pages/TourDetail";
import PlanTrip from "./pages/PlanTrip";
import Booking from "./pages/Booking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { checkBackendHealth } from "./services/api";

const pageTitles = {
  "/": "AddyVenture Travel & Tours",
  "/tours": "Tours | AddyVenture",
  "/plan-trip": "Plan a Trip | AddyVenture",
  "/booking": "Booking | AddyVenture",
  "/about": "About | AddyVenture",
  "/contact": "Contact | AddyVenture",
};

function RouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = pathname.startsWith("/tours/")
      ? "Tour Details | AddyVenture"
      : pageTitles[pathname] || "AddyVenture Travel & Tours";

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        console.log("Backend connected:", data);
      })
      .catch((error) => {
        console.error("Backend error:", error);
      });
  }, []);

  return (
    <>
      <RouteEffects />

      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/plan-trip" element={<PlanTrip />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}