import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronDown,
  CircleHelp,
  Mail,
  MapPinned,
  MessageCircle,
} from "lucide-react";

import { sendContactMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Contact.css";

const faqItems = [
  {
    question: "Can I change my itinerary after building it?",
    answer:
      "Yes. Return to Plan a Trip to add, remove, duplicate, or reorder itinerary days before you submit your booking request.",
  },
  {
    question: "How are my travel dates calculated?",
    answer:
      "You choose the start date. AddyVenture automatically calculates the end date from the number of days in your itinerary.",
  },
  {
    question: "Is my booking request already a confirmed reservation?",
    answer:
      "No. The confirmation screen means your request is ready for follow-up. Keep the booking reference shown after submission.",
  },
  {
    question: "Where can I find my booking reference?",
    answer:
      "It appears in the booking confirmation slip after you submit your request. You can copy the code or keep a screenshot for reference.",
  },
];

const contactTopics = [
  "Trip planning",
  "Booking request",
  "Itinerary help",
  "Privacy or account data request",
  "General question",
];

const initialForm = {
  name: "",
  email: "",
  topic: "Trip planning",
  message: "",
};

export default function Contact() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const submitLockRef = useRef(false);

  const requestedTopic =
    contactTopics.includes(
      location.state?.topic
    )
      ? location.state.topic
      : initialForm.topic;

  const [form, setForm] = useState(
    () => ({
      ...initialForm,
      topic: requestedTopic,
    })
  );
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    setForm((current) => {
      const nextName =
        current.name ||
        profile?.full_name ||
        "";

      const nextEmail =
        current.email ||
        user?.email ||
        "";

      if (
        nextName === current.name &&
        nextEmail === current.email
      ) {
        return current;
      }

      return {
        ...current,
        name: nextName,
        email: nextEmail,
      };
    });
  }, [profile?.full_name, user?.email]);

  const validate = () => {
    const next = {};

    if (!form.name.trim()) {
      next.name = "Please enter your name.";
    }

    if (!form.email.trim()) {
      next.email = "Please enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!form.message.trim()) {
      next.message = "Please tell us how we can help.";
    } else if (form.message.trim().length < 10) {
      next.message =
        "Please add a little more detail (at least 10 characters).";
    }

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    const nextErrors = validate();

    setErrors(nextErrors);
    setSubmitted(false);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    submitLockRef.current = true;

    try {
      setIsSubmitting(true);

      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.topic,
        message: form.message.trim(),
      });

      setSubmitted(true);
      setForm(initialForm);
    } catch (error) {
      setSubmitError(
        error.message || "Unable to send your message. Please try again."
      );
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));

    setSubmitted(false);
    setSubmitError("");
  };

  return (
    <>
      <section className="contact-hero">
        <div className="container contact-hero__inner">
          <span className="eyebrow">Contact AddyVenture</span>

          <h1>Questions before your next adventure?</h1>

          <p>
            Tell us what you need help with: trip planning, a booking request,
            or the itinerary builder.
          </p>
        </div>
      </section>

      <section className="section contact-main">
        <div className="container contact-main__grid">
          <div className="contact-form-card">
            <div className="contact-form-card__heading">
              <MessageCircle size={24} aria-hidden="true" />

              <div>
                <h2>Send a message</h2>
                <p>Fields marked with * are required.</p>
              </div>
            </div>

            {submitted && (
              <div
                className="contact-success"
                role="status"
                aria-live="polite"
              >
                <strong>Message sent!</strong> Your message has been received
                by AddyVenture.
              </div>
            )}

            {submitError && (
              <div
                className="contact-error"
                role="alert"
                style={{ marginBottom: "1rem" }}
              >
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label htmlFor="contact-name">Full name *</label>

                <input
                  id="contact-name"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  autoComplete="name"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "contact-name-error" : undefined
                  }
                />

                {errors.name && (
                  <span
                    className="contact-error"
                    id="contact-name-error"
                  >
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email">Email address *</label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  autoComplete="email"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "contact-email-error" : undefined
                  }
                />

                {errors.email && (
                  <span
                    className="contact-error"
                    id="contact-email-error"
                  >
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="contact-field">
                <label htmlFor="contact-topic">
                  What can we help with?
                </label>

                <select
                  id="contact-topic"
                  name="topic"
                  value={form.topic}
                  onChange={updateField}
                  disabled={isSubmitting}
                >
                  {contactTopics.map(
                    (topic) => (
                      <option key={topic}>
                        {topic}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">Message *</label>

                <textarea
                  id="contact-message"
                  name="message"
                  rows="6"
                  value={form.message}
                  onChange={updateField}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={
                    errors.message
                      ? "contact-message-error"
                      : "contact-message-hint"
                  }
                />

                <span
                  className="contact-hint"
                  id="contact-message-hint"
                >
                  Please avoid sharing payment details or other sensitive
                  information.
                </span>

                {errors.message && (
                  <span
                    className="contact-error"
                    id="contact-message-error"
                  >
                    {errors.message}
                  </span>
                )}
              </div>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          <aside className="contact-side" aria-label="Contact help">
            <div className="contact-info-card">
              <Mail size={22} aria-hidden="true" />

              <div>
                <h3>Booking question?</h3>
                <p>
                  Include your booking reference in the message so it is
                  easier to identify your trip request.
                </p>
              </div>
            </div>

            <div className="contact-info-card">
              <MapPinned size={22} aria-hidden="true" />

              <div>
                <h3>Still planning?</h3>
                <p>
                  Build your itinerary first so your destinations, dates,
                  and traveler details are easier to discuss.
                </p>
              </div>
            </div>

            <div className="contact-info-card">
              <CircleHelp size={22} aria-hidden="true" />

              <div>
                <h3>Quick answer</h3>
                <p>
                  Check the FAQs below for common questions about itinerary
                  editing, dates, and booking references.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section contact-faq">
        <div className="container contact-faq__inner">
          <span className="eyebrow">Frequently asked questions</span>

          <h2>Before you send a message</h2>

          <div className="faq-list">
            {faqItems.map((item, index) => {
              const open = openFaq === index;
              const panelId = `faq-panel-${index}`;

              return (
                <div
                  className={`faq-item ${open ? "is-open" : ""}`}
                  key={item.question}
                >
                  <button
                    type="button"
                    className="faq-item__button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(open ? -1 : index)}
                  >
                    <span>{item.question}</span>
                    <ChevronDown size={20} aria-hidden="true" />
                  </button>

                  <div
                    id={panelId}
                    className="faq-item__panel"
                    hidden={!open}
                  >
                    <p>{item.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
