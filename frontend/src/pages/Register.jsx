import {
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  CircleCheckBig,
  Compass,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
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

import "./Login.css";
import "./Register.css";

const HCAPTCHA_SITE_KEY = String(
  import.meta.env.VITE_HCAPTCHA_SITE_KEY || ""
).trim();

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const submitLockRef = useRef(false);
  const captchaRef = useRef(null);

  const from = getSafeInternalPath(
    location.state?.from
  );

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (loading) {
    return (
      <main className="login-page login-page--loading">
        <div className="login-loader" role="status" aria-live="polite">
          <span className="login-loader__spinner" aria-hidden="true" />
          <p>Preparing your account...</p>
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
      setSuccess("");

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password: form.password,
          options: {
            captchaToken,
            data: {
              full_name: fullName,
            },
          },
        });

      if (signUpError) {
        if (signUpError.code === "captcha_failed") {
          throw new Error(
            "Security verification expired or failed. Please try again."
          );
        }

        throw signUpError;
      }

      if (data.session) {
        navigate(from, { replace: true });
        return;
      }

      setSuccess(
        "Check your email to confirm your account, then return here to log in."
      );

      setForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (registrationError) {
      setError(
        registrationError.message ||
        "Unable to create account."
      );
    } finally {
      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page register-page">
      <div className="login-page__glow login-page__glow--one" />
      <div className="login-page__glow login-page__glow--two" />

      <section
        className="login-shell register-shell"
        aria-labelledby="register-title"
      >
        <aside
          className="login-story register-story"
          aria-label="AddyVenture introduction"
        >
          <Link to="/" className="login-brand" aria-label="AddyVenture home">
            <span className="login-brand__mark" aria-hidden="true">
              <Compass size={23} strokeWidth={2.4} />
            </span>
            <span>
              <strong>AddyVenture</strong>
              <small>Travel &amp; Tours</small>
            </span>
          </Link>

          <div className="login-story__content register-story__content">
            <span className="login-story__eyebrow">
              <Sparkles size={15} aria-hidden="true" />
              Your journey starts here
            </span>

            <h2>Start with a place. We&apos;ll help shape the journey.</h2>

            <p>
              Keep trip plans, booking updates, vouchers, and support in one
              secure account.
            </p>

            <div className="login-destination">
              <MapPin size={18} aria-hidden="true" />
              <span>
                <small>Travel inspiration</small>
                Bohol, Philippines
              </span>
            </div>
          </div>

          <p className="login-story__note">
            Curated journeys across islands, coastlines, and heritage towns.
          </p>
        </aside>

        <div className="login-panel register-panel">
          <div className="login-panel__inner register-panel__inner">
            <span className="eyebrow">Join AddyVenture</span>

            <h1 id="register-title">Create your account</h1>

            <p className="login-panel__intro">
              Save your plans and keep every booking update in one place.
            </p>

            {success && (
              <div
                className="login-notice login-notice--success register-success"
                role="status"
                aria-live="polite"
              >
                <CircleCheckBig size={22} aria-hidden="true" />
                <div>
                  <strong>Account created successfully</strong>
                  <p>{success}</p>
                </div>
              </div>
            )}

            <form className="login-form register-form" onSubmit={handleSubmit}>
              <label className="login-field">
                <span>Full name</span>

                <span className="login-input-wrap">
                  <UserRound size={19} aria-hidden="true" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={updateField}
                    placeholder="Mara Villanueva"
                    autoComplete="name"
                    required
                    disabled={submitting}
                  />
                </span>
              </label>

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
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={submitting}
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
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

              <label className="login-field">
                <span>Confirm password</span>

                <span className="login-input-wrap">
                  <LockKeyhole size={19} aria-hidden="true" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder="Enter it again"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={submitting}
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    aria-pressed={showConfirmPassword}
                    disabled={submitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} aria-hidden="true" />
                    ) : (
                      <Eye size={19} aria-hidden="true" />
                    )}
                  </button>
                </span>
              </label>

              {HCAPTCHA_SITE_KEY && (
                <div
                  className="login-captcha"
                  aria-label="Security verification"
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
                <span>
                  {submitting ? "Creating account..." : "Create Account"}
                </span>
                {!submitting && <ArrowRight size={19} aria-hidden="true" />}
              </button>
            </form>

            <p className="login-register">
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

            <div className="login-security register-security">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>
                By continuing, you agree to our{" "}
                <Link to="/terms">Terms</Link> and{" "}
                <Link to="/privacy-policy">Privacy Policy</Link>.
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
