import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });

      if (loginError) {
        throw loginError;
      }

      navigate("/");
    } catch (error) {
      setError(error.message || "Unable to log in.");
    } finally {
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
      <span className="eyebrow">Welcome Back</span>

      <h1>Log in to AddyVenture</h1>

      <p>
        Access your AddyVenture account using your email and password.
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
          <strong>Email</strong>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
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
            autoComplete="current-password"
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

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? "Logging in..." : "Log In"}
        </button>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}