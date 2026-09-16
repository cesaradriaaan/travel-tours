import {
  useRef,
  useState,
} from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const submitLockRef = useRef(false);

  const from = location.state?.from || "/";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    const fullName = form.fullName.trim();
    const email = form.email.trim();

    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    submitLockRef.current = true;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password: form.password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        navigate(from, { replace: true });
        return;
      }

      setSuccess(
        "Account created! Check your email to confirm your account, then log in to continue."
      );

      setForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(error.message || "Unable to create account.");
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div
      className="container"
      style={{
        paddingTop: "4rem",
        paddingBottom: "5rem",
        maxWidth: "600px",
      }}
    >
      <span className="eyebrow">AddyVenture Account</span>

      <h1>Create an account</h1>

      <p>
        Create your account to continue booking your AddyVenture trip.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: "2rem",
          display: "grid",
          gap: "1.25rem",
          padding: "2rem",
          border: "1px solid #ddd",
          borderRadius: "16px",
        }}
      >
        <label>
          <strong>Full name</strong>

          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={updateField}
            autoComplete="name"
            required
            disabled={submitting}
            style={{
              width: "100%",
              padding: "0.85rem",
              marginTop: "0.5rem",
            }}
          />
        </label>

        <label>
          <strong>Email</strong>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
            required
            disabled={submitting}
            style={{
              width: "100%",
              padding: "0.85rem",
              marginTop: "0.5rem",
            }}
          />
        </label>

        <label>
          <strong>Password</strong>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            autoComplete="new-password"
            required
            disabled={submitting}
            style={{
              width: "100%",
              padding: "0.85rem",
              marginTop: "0.5rem",
            }}
          />
        </label>

        <label>
          <strong>Confirm password</strong>

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={updateField}
            autoComplete="new-password"
            required
            disabled={submitting}
            style={{
              width: "100%",
              padding: "0.85rem",
              marginTop: "0.5rem",
            }}
          />
        </label>

        {error && (
          <p role="alert">
            <strong>Error:</strong> {error}
          </p>
        )}

        {success && (
          <p role="status">
            <strong>{success}</strong>
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Create Account"}
        </button>

        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            state={{
              from,
              message:
                from === "/booking"
                  ? "Sign in to continue your booking."
                  : "",
            }}
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
