import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  Mail,
} from "lucide-react";

import "./LegalPage.css";

const legalLinks = [
  {
    to: "/privacy-policy",
    label: "Privacy Policy",
  },
  {
    to: "/terms",
    label: "Terms & Conditions",
  },
  {
    to: "/cancellation-policy",
    label: "Cancellation Policy",
  },
];


export default function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}) {
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="container legal-hero__inner">
          <span className="eyebrow">
            {eyebrow}
          </span>

          <h1>{title}</h1>

          <p>{intro}</p>

          <div className="legal-hero__meta">
            <span>
              Last updated: September 16, 2026
            </span>

            <span aria-hidden="true">
              •
            </span>

            <span>
              AddyVenture Travel & Tours
            </span>
          </div>
        </div>
      </header>

      <div className="container legal-layout">
        <aside className="legal-nav" aria-label="Legal pages">
          <div className="legal-nav__brand">
            <Compass size={19} aria-hidden="true" />
            <span>Travel with clarity</span>
          </div>

          <p>
            Review how we handle your information, booking requests, and cancellations.
          </p>

          <nav>
            {legalLinks.map((item) => (
              <Link key={item.to} to={item.to}>
                <span>{item.label}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </aside>

        <article className="legal-content">
          {children}

          <section className="legal-contact-card" aria-labelledby="legal-contact-title">
            <Mail size={22} aria-hidden="true" />

            <div>
              <h2 id="legal-contact-title">
                Questions or requests?
              </h2>

              <p>
                Contact AddyVenture through our support form. Include enough information for us to identify and respond to your request, but never send a password.
              </p>

              <Link className="btn btn-primary" to="/contact">
                Contact AddyVenture
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
