import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="route-state" role="status" aria-live="polite">
        <span className="route-state__pulse" aria-hidden="true" />
        <p>Checking account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Sign in to continue your booking.",
        }}
      />
    );
  }

  return children;
}
