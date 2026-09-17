import { Link } from "react-router-dom";

import LegalPage from "../components/LegalPage";


export default function CancellationPolicy() {
  return (
    <LegalPage
      eyebrow="Plans Change, We Keep It Clear"
      title="Cancellation Policy"
      intro="This policy explains when and how a traveler may request cancellation and what happens while AddyVenture reviews the request."
    >
      <section>
        <h2>1. Scope</h2>

        <p>
          This policy applies to booking requests submitted through AddyVenture. A booking request is not automatically a confirmed reservation, and submitting a cancellation request does not immediately cancel it.
        </p>
      </section>

      <section>
        <h2>2. When cancellation may be requested</h2>

        <p>
          The website currently allows a traveler to request cancellation while a booking has one of these statuses:
        </p>

        <ul>
          <li>Request Received</li>
          <li>Reviewing</li>
          <li>Confirmed</li>
        </ul>

        <p>
          A request cannot be submitted through the normal workflow when the booking is already Cancelled, already has a pending cancellation request, or is in another status that the system marks as ineligible.
        </p>
      </section>

      <section>
        <h2>3. How to request cancellation</h2>

        <ol>
          <li>Log in to the account used for the booking.</li>
          <li>Open <Link to="/my-bookings">My Bookings</Link> and select the relevant trip.</li>
          <li>Choose the cancellation-request option and provide an optional reason.</li>
          <li>Review the confirmation prompt and submit the request.</li>
        </ol>

        <p>
          Only the owner of a booking may submit its cancellation request through the account portal. If account access is unavailable, contact support and provide the booking reference for verification.
        </p>
      </section>

      <section>
        <h2>4. Pending review</h2>

        <p>
          After submission, the booking status changes to Cancellation Requested. The booking is not yet cancelled. AddyVenture will review the request and either approve or reject it based on the booking stage, arrangements already made, supplier conditions, and applicable law.
        </p>

        <p className="legal-note">
          Do not rely on the request alone. A cancellation is complete only when the booking status shows Cancelled or AddyVenture provides written confirmation.
        </p>
      </section>

      <section>
        <h2>5. Approval or rejection</h2>

        <h3>If approved</h3>
        <ul>
          <li>The booking status changes to Cancelled.</li>
          <li>The decision and resolution time are recorded.</li>
          <li>If an eligible AddyVenture voucher was used for that booking, the system will return it to the user&apos;s voucher wallet when the cancellation workflow supports restoration.</li>
        </ul>

        <h3>If rejected</h3>
        <ul>
          <li>The booking returns to the status it had before cancellation was requested.</li>
          <li>The request and decision remain part of the booking history.</li>
          <li>You may contact support if you believe relevant information was not considered.</li>
        </ul>
      </section>

      <section>
        <h2>6. Payments and refunds</h2>

        <p>
          The current AddyVenture website does not collect card or online payment. Therefore, submitting or cancelling the present website booking request does not itself trigger an online refund.
        </p>

        <p>
          If a payment is later collected outside the website or through a future payment feature, any refund, deduction, supplier charge, or deadline must follow the written payment and booking terms presented for that transaction, together with applicable Philippine consumer law. Those terms may depend on non-refundable costs already committed to third-party suppliers.
        </p>
      </section>

      <section>
        <h2>7. Disruptions and provider changes</h2>

        <p>
          Weather, safety concerns, government restrictions, supplier cancellations, natural events, or other circumstances beyond reasonable control may require a trip change or cancellation. Where this happens, AddyVenture will communicate available alternatives, credits, rescheduling, or refunds based on the confirmed arrangements, amounts actually paid, supplier rules, and applicable law.
        </p>
      </section>

      <section>
        <h2>8. Records and privacy</h2>

        <p>
          Cancellation reasons, decisions, and timestamps are retained with the booking to manage the request, prevent disputes and misuse, and maintain appropriate transaction records. See our <Link to="/privacy-policy">Privacy Policy</Link> for more information and available privacy rights.
        </p>
      </section>

      <section>
        <h2>9. Consumer rights</h2>

        <p>
          Nothing in this policy removes a right or remedy that cannot lawfully be waived under Philippine law. If a concern is not resolved through AddyVenture support, you may use any complaint or dispute channel available through the appropriate government authority.
        </p>
      </section>
    </LegalPage>
  );
}
