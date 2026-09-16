import { Link } from "react-router-dom";

import LegalPage from "../components/LegalPage";


export default function PrivacyPolicy() {
  return (
    <LegalPage
      eyebrow="Your Data, Clearly Explained"
      title="Privacy Policy"
      intro="This policy explains what personal information AddyVenture collects, why we use it, where it is handled, and the choices available to you."
    >
      <section>
        <h2>1. Who this policy applies to</h2>

        <p>
          This policy applies when you browse AddyVenture Travel & Tours, create an account, plan or request a trip, redeem a voucher, contact us, or communicate with our support team.
        </p>

        <p>
          AddyVenture acts as the organization responsible for deciding how personal information submitted through this website is used for the services described below.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>

        <h3>Account and profile information</h3>
        <ul>
          <li>Full name, email address, account identifier, and account role.</li>
          <li>An optional profile avatar and its storage URL.</li>
          <li>Authentication and session information managed by our authentication provider. AddyVenture does not store your password in its application database.</li>
        </ul>

        <h3>Booking information</h3>
        <ul>
          <li>Lead traveler name, email address, phone number, nationality, travel dates, and party counts.</li>
          <li>Your selected itinerary, accommodation, transport, meal preferences, estimated price, and voucher information.</li>
          <li>Optional emergency-contact details, special requests, cancellation reasons, and booking status history.</li>
        </ul>

        <h3>Messages and support information</h3>
        <ul>
          <li>Name, email address, subject, message, reply history, and support status.</li>
        </ul>

        <h3>Technical and security information</h3>
        <ul>
          <li>Limited request information needed for authentication, rate limiting, abuse prevention, troubleshooting, and service security.</li>
          <li>We do not intentionally place passwords, access tokens, full request bodies, or booking personal information in application logs.</li>
        </ul>
      </section>

      <section>
        <h2>3. How we use information</h2>

        <p>We use personal information to:</p>
        <ul>
          <li>Create and manage accounts and profiles.</li>
          <li>Receive, review, confirm, manage, or cancel trip requests.</li>
          <li>Display your bookings and voucher wallet.</li>
          <li>Respond to inquiries and send requested support replies.</li>
          <li>Protect accounts, prevent duplicate or abusive submissions, and investigate service errors.</li>
          <li>Comply with applicable legal obligations and enforce our policies.</li>
        </ul>

        <p>
          We process information only for legitimate and declared purposes, in a manner proportionate to the service being requested, and on a lawful basis available under applicable Philippine law.
        </p>
      </section>

      <section>
        <h2>4. Browser storage</h2>

        <ul>
          <li>Your itinerary may be stored locally in your browser so you can continue planning later.</li>
          <li>Traveler booking drafts and confirmation details are limited to the current browser tab session and are cleared when you log out.</li>
          <li>A pending booking request key may be stored temporarily to prevent duplicate bookings; it does not contain your booking details.</li>
        </ul>

        <p className="legal-note">
          Profile avatars are currently delivered through public image URLs. Do not upload an identification card, document, or image containing information you do not want publicly accessible.
        </p>
      </section>

      <section>
        <h2>5. Service providers and sharing</h2>

        <p>
          We use service providers to operate the website, including Supabase for authentication, database, and file storage, and Resend for support-email delivery. Hosting and infrastructure providers may also process limited technical information needed to deliver and secure the service.
        </p>

        <p>
          We do not sell personal information. We may share only what is reasonably necessary with service providers, travel suppliers involved in fulfilling a confirmed trip, professional advisers, or public authorities when required by law. Before supplier sharing becomes necessary, we will provide appropriate booking details and notices.
        </p>
      </section>

      <section>
        <h2>6. Retention and deletion</h2>

        <p>
          We keep account, booking, voucher, and support records only for as long as reasonably necessary to provide the service, maintain transaction and security records, resolve disputes, and meet legal obligations. Retention may vary depending on the record and booking status.
        </p>

        <p>
          You may request access, correction, or deletion through our <Link to="/contact">contact form</Link>. Some information may need to be retained where a legal obligation, active dispute, fraud-prevention need, or valid transaction-record requirement applies.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>

        <p>
          We use access controls, authenticated API requests, role checks, row-level database security, request limits, duplicate-submission protection, restricted browser origins, and safe error handling. No system can guarantee absolute security, so please use a strong unique password and protect access to your email and device.
        </p>
      </section>

      <section>
        <h2>8. Your privacy rights</h2>

        <p>
          Subject to the Data Privacy Act of 2012 and applicable rules, you may have rights to be informed, access your personal data, object to certain processing, correct inaccurate information, request erasure or blocking, obtain data portability where applicable, and raise a complaint with the National Privacy Commission.
        </p>

        <p>
          To exercise a right, use our contact form and identify the account or booking involved. We may ask for reasonable verification before acting on a request to protect your information from unauthorized access.
        </p>
      </section>

      <section>
        <h2>9. Children</h2>

        <p>
          Accounts and booking requests must be submitted by a person who is at least 18 years old. An adult may include children or infants in a travel party, but should submit only information reasonably necessary for the trip and only when authorized to do so.
        </p>
      </section>

      <section>
        <h2>10. Policy updates</h2>

        <p>
          We may update this policy as the service, providers, or legal requirements change. The latest revision date will appear at the top of this page. Material changes will be communicated through an appropriate notice where required.
        </p>
      </section>
    </LegalPage>
  );
}
