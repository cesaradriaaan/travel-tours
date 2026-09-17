import {
  lazy,
  Suspense,
  useEffect,
} from "react";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RequireAdmin from "./components/RequireAdmin";
import RequireAuth from "./components/RequireAuth";

const Home = lazy(() => import("./pages/Home"));
const Tours = lazy(() => import("./pages/Tours"));
const TourDetail = lazy(() =>
  import("./pages/TourDetail")
);
const PlanTrip = lazy(() =>
  import("./pages/PlanTrip")
);
const Booking = lazy(() =>
  import("./pages/Booking")
);
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() =>
  import("./pages/Contact")
);
const PrivacyPolicy = lazy(() =>
  import("./pages/PrivacyPolicy")
);
const Terms = lazy(() => import("./pages/Terms"));
const CancellationPolicy = lazy(() =>
  import("./pages/CancellationPolicy")
);

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() =>
  import("./pages/Register")
);
const Account = lazy(() =>
  import("./pages/Account")
);
const MyBookings = lazy(() =>
  import("./pages/MyBookings")
);
const MyBookingDetail = lazy(() =>
  import("./pages/MyBookingDetail")
);

const AdminBookings = lazy(() =>
  import("./pages/AdminBookings")
);
const AdminMessages = lazy(() =>
  import("./pages/AdminMessages")
);
const NotFound = lazy(() =>
  import("./pages/NotFound")
);

const pageTitles = {
  "/": "AddyVenture Travel & Tours",
  "/tours": "Tours | AddyVenture",
  "/plan-trip": "Plan a Trip | AddyVenture",
  "/booking": "Booking | AddyVenture",
  "/about": "About | AddyVenture",
  "/contact": "Contact | AddyVenture",
  "/privacy-policy":
    "Privacy Policy | AddyVenture",
  "/terms":
    "Terms & Conditions | AddyVenture",
  "/cancellation-policy":
    "Cancellation Policy | AddyVenture",

  "/login": "Login | AddyVenture",
  "/register": "Create Account | AddyVenture",
  "/account": "My Account | AddyVenture",
  "/my-bookings": "My Bookings | AddyVenture",

  "/admin/bookings":
    "Admin Bookings | AddyVenture",

  "/admin/messages":
    "Admin Messages | AddyVenture",
};

const defaultDescription =
  "Plan curated Philippine trips across islands, coastlines, and heritage towns with AddyVenture Travel & Tours.";

const pageDescriptions = {
  "/": defaultDescription,
  "/tours":
    "Browse curated Philippine tours featuring islands, nature, culture, diving, surfing, and heritage destinations.",
  "/plan-trip":
    "Build a flexible day-by-day Philippine itinerary around the destinations and experiences you want.",
  "/about":
    "Learn how AddyVenture creates clear, flexible, and locally focused Philippine travel experiences.",
  "/contact":
    "Contact AddyVenture for booking questions, trip planning support, cancellations, or privacy requests.",
  "/privacy-policy":
    "Read how AddyVenture collects, uses, protects, and manages personal information.",
  "/terms":
    "Review the terms and conditions for using AddyVenture and submitting trip requests.",
  "/cancellation-policy":
    "Review AddyVenture's trip cancellation request process and important conditions.",
};

function setMetaContent(
  attribute,
  name,
  content
) {
  let element = document.querySelector(
    `meta[${attribute}="${name}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setHeadLink(rel, href) {
  let element = document.querySelector(
    `link[rel="${rel}"]`
  );

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

function getRouteMetadata(pathname) {
  if (pathname.startsWith("/tours/")) {
    return {
      title: "Tour Details | AddyVenture",
      description:
        "Explore tour highlights, itinerary details, inclusions, and pricing with AddyVenture.",
      privatePage: false,
    };
  }

  if (pathname.startsWith("/my-bookings/")) {
    return {
      title: "Booking Details | AddyVenture",
      description:
        "Review the details and status of your AddyVenture booking request.",
      privatePage: true,
    };
  }

  const privatePage =
    pathname === "/booking" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/account" ||
    pathname === "/my-bookings" ||
    pathname.startsWith("/admin/");

  if (pageTitles[pathname]) {
    return {
      title: pageTitles[pathname],
      description:
        pageDescriptions[pathname] ||
        defaultDescription,
      privatePage,
    };
  }

  return {
    title: "Page Not Found | AddyVenture",
    description:
      "The requested AddyVenture page could not be found.",
    privatePage: true,
  };
}

function RouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata =
      getRouteMetadata(pathname);

    document.title = metadata.title;

    setMetaContent(
      "name",
      "description",
      metadata.description
    );
    setMetaContent(
      "name",
      "robots",
      metadata.privatePage
        ? "noindex, nofollow"
          : "index, follow"
    );
    setMetaContent(
      "name",
      "theme-color",
      "#073b4c"
    );
    setMetaContent(
      "property",
      "og:type",
      "website"
    );
    setMetaContent(
      "property",
      "og:site_name",
      "AddyVenture Travel & Tours"
    );
    setMetaContent(
      "property",
      "og:title",
      metadata.title
    );
    setMetaContent(
      "property",
      "og:description",
      metadata.description
    );
    setMetaContent(
      "property",
      "og:image",
      new URL(
        "/social-preview.png",
        window.location.origin
      ).href
    );
    setMetaContent(
      "name",
      "twitter:card",
      "summary_large_image"
    );
    setMetaContent(
      "name",
      "twitter:title",
      metadata.title
    );
    setMetaContent(
      "name",
      "twitter:description",
      metadata.description
    );
    setMetaContent(
      "name",
      "twitter:image",
      new URL(
        "/social-preview.png",
        window.location.origin
      ).href
    );

    setHeadLink("icon", "/favicon.svg");
    setHeadLink(
      "apple-touch-icon",
      "/apple-touch-icon.png"
    );
    setHeadLink(
      "manifest",
      "/site.webmanifest"
    );

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function RouteLoading() {
  return (
    <div
      className="route-state"
      role="status"
      aria-live="polite"
    >
      <span className="route-state__pulse" aria-hidden="true" />
      <p>Loading page...</p>
    </div>
  );
}

export default function App() {
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
        <Suspense fallback={<RouteLoading />}>
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
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/terms"
            element={<Terms />}
          />

          <Route
            path="/cancellation-policy"
            element={<CancellationPolicy />}
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

          <Route
            path="*"
            element={<NotFound />}
          />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
