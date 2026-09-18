import {
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabaseClient";
import { getSafeInternalPath } from "../lib/safeNavigation";
import { useAuth } from "../context/AuthContext";
import { loginWithPassword } from "../services/api";
import "./Login.css";

const HCAPTCHA_SITE_KEY = String(
  import.meta.env.VITE_HCAPTCHA_SITE_KEY || ""
).trim();

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const submitLockRef = useRef(false);
  const captchaRef = useRef(null);

  const from = getSafeInternalPath(
    location.state?.from
  );
  const message = location.state?.message || "";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return (
      <main className="login-page login-page--loading">
        <div className="login-loader" role="status" aria-live="polite">
          <span className="login-loader__spinner" aria-hidden="true" />
          <p>Preparing your next adventure...</p>
        </div>
      </main>
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
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    if (!HCAPTCHA_SITE_KEY) {
      setError(
        "Security verification is unavailable. Please try again later."
      );
      return;
    }

    if (!captchaToken) {
      setError("Please complete the security verification.");
      return;
    }

    submitLockRef.current = true;

    try {
      setSubmitting(true);
      setError("");

      const data =
        await loginWithPassword(
          form.email.trim(),
          form.password,
          { captchaToken }
        );

      if (!data.session?.accessToken || !data.session?.refreshToken) {
        throw new Error(
          "Login succeeded, but the session could not be created."
        );
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.accessToken,
        refresh_token: data.session.refreshToken,
      });

      if (sessionError) {
        throw sessionError;
      }

      navigate(from, { replace: true });
    } catch (loginError) {
      setError(
        loginError.message || "Unable to log in. Please try again."
      );
    } finally {
      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-page__glow login-page__glow--one" />
      <div className="login-page__glow login-page__glow--two" />

      <section className="login-shell" aria-labelledby="login-title">
        <aside className="login-story" aria-label="AddyVenture introduction">
          <Link to="/" className="login-brand" aria-label="AddyVenture home">
            <span className="login-brand__mark" aria-hidden="true">
              <Compass size={23} strokeWidth={2.4} />
            </span>
            <span>
              <strong>AddyVenture</strong>
              <small>Travel &amp; Tours</small>
            </span>
          </Link>

          <div className="login-story__content">
            <span className="login-story__eyebrow">
              <Sparkles size={15} aria-hidden="true" />
              Your Philippine escape
            </span>

            <h2>Every island has a story. Let&apos;s continue yours.</h2>

            <p>
              Return to your saved trips, booking updates, and exclusive travel
              rewards, all in one place.
            </p>

            <div className="login-destination">
              <MapPin size={18} aria-hidden="true" />
              <span>
                <small>Featured destination</small>
                Palawan, Philippines
              </span>
            </div>
          </div>

          <p className="login-story__note">
            Curated journeys across islands, coastlines, and heritage towns.
          </p>
        </aside>

        <div className="login-panel">
          <div className="login-panel__inner">
            <span className="eyebrow">Welcome Back</span>

            <h1 id="login-title">Log in to your account</h1>

            <p className="login-panel__intro">
              Enter your details to continue your AddyVenture journey.
            </p>

            {message && (
              <div className="login-notice login-notice--success" role="status">
                <ShieldCheck size={19} aria-hidden="true" />
                <span>{message}</span>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-field">
                <span>Email address</span>

                <span className="login-input-wrap">
                  <Mail size={19} aria-hidden="true" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={submitting}
                  />
                </span>
              </label>

              <label className="login-field">
                <span>Password</span>

                <span className="login-input-wrap">
                  <LockKeyhole size={19} aria-hidden="true" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={updateField}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={submitting}
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    disabled={submitting}
                  >
                    {showPassword ? (
                      <EyeOff size={19} aria-hidden="true" />
                    ) : (
                      <Eye size={19} aria-hidden="true" />
                    )}
                  </button>
                </span>
              </label>

              {HCAPTCHA_SITE_KEY && (
                <div
                  aria-label="Security verification"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={HCAPTCHA_SITE_KEY}
                    size="normal"
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      setError("");
                    }}
                    onExpire={() => setCaptchaToken("")}
                    onError={() => {
                      setCaptchaToken("");
                      setError(
                        "Security verification failed to load. Please try again."
                      );
                    }}
                  />
                </div>
              )}

              {error && (
                <div className="login-notice login-notice--error" role="alert">
                  <span aria-hidden="true">!</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary login-submit"
                disabled={submitting}
              >
                <span>{submitting ? "Logging in..." : "Log In"}</span>
                {!submitting && <ArrowRight size={19} aria-hidden="true" />}
              </button>
            </form>

            <p className="login-register">
              New to AddyVenture?{" "}
              <Link to="/register" state={{ from }}>
                Create an account
              </Link>
            </p>

            <div className="login-security">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Your account is protected by a secure session.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
