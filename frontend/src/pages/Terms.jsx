import { Link } from "react-router-dom";

import LegalPage from "../components/LegalPage";


export default function Terms() {
  return (
    <LegalPage
      eyebrow="Fair Use, Clear Expectations"
      title="Terms & Conditions"
      intro="These terms explain how AddyVenture accounts, trip plans, booking requests, vouchers, and support services may be used."
    >
      <section>
        <h2>1. Agreement to these terms</h2>

        <p>
          By creating an account or submitting a booking request, you agree to these Terms & Conditions, our <Link to="/privacy-policy">Privacy Policy</Link>, and our <Link to="/cancellation-policy">Cancellation Policy</Link>. If you do not agree, do not submit a booking request.
        </p>
      </section>

      <section>
        <h2>2. Eligibility and accounts</h2>

        <ul>
          <li>You must be at least 18 years old and legally capable of entering an agreement.</li>
          <li>You must provide accurate and current account and booking information.</li>
          <li>You are responsible for protecting your password and device and for activity performed through your account.</li>
          <li>Notify us promptly through the contact form if you believe your account is being used without authorization.</li>
        </ul>
      </section>

      <section>
        <h2>3. Trip plans and booking requests</h2>

        <p>
          Submitting the booking form creates a trip request only. It does not by itself guarantee availability, reserve third-party services, create a ticket, or constitute final confirmation. A booking becomes confirmed only after AddyVenture reviews it and changes its status to Confirmed or otherwise provides written confirmation.
        </p>

        <p>
          You are responsible for reviewing traveler details, dates, destinations, inclusions, and special requests before submission. Contact us promptly if information needs correction.
        </p>
      </section>

      <section>
        <h2>4. Prices and payment</h2>

        <p>
          Prices displayed by the current website are estimates generated from the selected itinerary and traveler count. Availability, taxes, supplier charges, or changes requested after submission may affect a final quotation.
        </p>

        <p className="legal-note">
          AddyVenture does not currently collect card or online payment through this website. If payment options are introduced, the applicable price, payment, refund, and supplier terms must be presented before payment is accepted.
        </p>
      </section>

      <section>
        <h2>5. Traveler responsibilities</h2>

        <p>You are responsible for:</p>
        <ul>
          <li>Providing complete and accurate traveler and contact information.</li>
          <li>Checking identification, visa, health, insurance, and entry requirements applicable to the trip.</li>
          <li>Informing us of accessibility needs or material travel requirements early enough for review.</li>
          <li>Following lawful safety instructions and the reasonable rules of transport, accommodation, activity, and destination providers.</li>
        </ul>
      </section>

      <section>
        <h2>6. Vouchers</h2>

        <p>
          Vouchers may have validity dates, minimum-spend rules, maximum discounts, availability limits, and single-use restrictions. A voucher has no cash value unless expressly stated. Attempts to guess, duplicate, transfer, manipulate, or redeem vouchers through unauthorized methods are prohibited.
        </p>
      </section>

      <section>
        <h2>7. Changes and third-party services</h2>

        <p>
          Tours may involve independent transport, accommodation, activity, dining, or destination providers. Proposed schedules and inclusions may change because of availability, safety, weather, government restrictions, or events outside reasonable control. We will communicate material changes and available options when practicable.
        </p>
      </section>

      <section>
        <h2>8. Acceptable use</h2>

        <p>You must not:</p>
        <ul>
          <li>Use the service unlawfully, fraudulently, or to impersonate another person.</li>
          <li>Submit malicious code, automated spam, excessive requests, or attempts to bypass security and rate limits.</li>
          <li>Access another user&apos;s booking, account, messages, vouchers, or administrative functions.</li>
          <li>Copy, scrape, or exploit the website in a way that harms AddyVenture, its users, or service providers.</li>
        </ul>
      </section>

      <section>
        <h2>9. Cancellations</h2>

        <p>
          Cancellation requests are handled under our <Link to="/cancellation-policy">Cancellation Policy</Link>. A request remains pending until reviewed. Do not assume a trip has been cancelled until its booking status shows Cancelled or you receive written confirmation.
        </p>
      </section>

      <section>
        <h2>10. Intellectual property</h2>

        <p>
          The AddyVenture name, website design, original text, graphics, and software are protected to the extent allowed by law. Destination images and third-party materials remain subject to their respective owners&apos; rights and licenses.
        </p>
      </section>

      <section>
        <h2>11. Service availability and liability</h2>

        <p>
          We work to keep the website accurate and available, but temporary interruptions, errors, or third-party service failures may occur. Nothing in these terms excludes liability or remedies that cannot lawfully be excluded, or limits rights granted under applicable consumer law.
        </p>

        <p>
          To the extent permitted by law, AddyVenture is not responsible for indirect losses caused solely by events beyond reasonable control or by inaccurate information supplied by the user. Any responsibility for confirmed third-party travel services will also depend on the final written booking and supplier terms presented to the traveler.
        </p>
      </section>

      <section>
        <h2>12. Suspension or termination</h2>

        <p>
          We may restrict or suspend access when reasonably necessary to investigate fraud, abuse, unauthorized access, legal violations, or risks to users and the service. This does not remove obligations or consumer rights arising from an existing confirmed transaction.
        </p>
      </section>

      <section>
        <h2>13. Governing law and concerns</h2>

        <p>
          These terms are governed by the laws of the Republic of the Philippines. Please contact us first so we can attempt to resolve a concern. Nothing here prevents a consumer or data subject from using rights or complaint channels available through a court, the Department of Trade and Industry, the National Privacy Commission, or another competent authority.
        </p>
      </section>

      <section>
        <h2>14. Changes to these terms</h2>

        <p>
          We may revise these terms to reflect service or legal changes. Updated terms apply from the stated revision date, while material changes affecting an existing confirmed transaction will be handled in accordance with applicable law and any final written booking terms.
        </p>
      </section>
    </LegalPage>
  );
}
