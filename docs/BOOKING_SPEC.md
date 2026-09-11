# Booking Spec

## Scope (Phase 4)

Front-end booking-request flow only. No real payment processor, availability API,
email delivery, or backend booking record is created yet. The UI is structured so
those integrations can replace the mock submit step later without redesigning the
whole flow.

## Data Shapes

```js
// TripPlan comes from TripContext and is persisted in localStorage.
{
  days: [
    {
      dayNumber: number,
      items: [{ tourId: string, title: string }],
      meals: { breakfast: boolean, lunch: boolean, dinner: boolean },
      accommodation: { name: string, location: string },
      transportation: string
    }
  ]
}

// Booking draft (persisted while the user is completing Phase 4)
{
  name: string,
  email: string,
  phone: string,
  nationality: string,
  travelDate: string,      // YYYY-MM-DD
  adults: number,          // min 1
  children: number,        // min 0
  infants: number,         // min 0
  emergencyName: string,   // optional
  emergencyPhone: string,  // optional; paired with emergencyName
  specialRequests: string  // optional, max 600 chars
}

// Mock request snapshot assembled at submission
{
  reference: string,       // ADV-YYMMDD-XXXX
  createdAt: string,
  status: "request-received",
  traveler: BookingDraft,
  tripPlan: TripPlan,
  pricePerTraveler: number,
  travelerCount: number,
  estimatedTotal: number
}
```

## Pricing

`pricePerTraveler` is derived from the itinerary by summing the selected tour
prices. `travelerCount` is adults + children + infants, and the prototype estimate
is:

```text
estimatedTotal = pricePerTraveler × travelerCount
```

This is explicitly presented as an estimate because final child/infant rates,
availability, add-ons, and payment terms require a real backend/business rules.

## Steps

1. **Traveler details** — lead traveler contact details, preferred travel date,
   nationality, adults/children/infants, optional emergency contact, and optional
   special requests. The draft is saved in localStorage so refreshes and trips
   back to the itinerary do not wipe entered data.
2. **Review** — read-only traveler summary, complete day-by-day itinerary,
   meals/accommodation/transportation, and reactive price summary. The user can
   edit traveler details or return to the itinerary without losing the draft.
3. **Request received** — generates a branded `ADV-YYMMDD-XXXX` reference,
   snapshots the itinerary before clearing TripContext, explains next steps, and
   supports browser Print / Save as PDF. The confirmation snapshot is kept in
   sessionStorage so refreshing the confirmation page in the same tab is safe.

## Validation Rules

- Lead traveler name: required, non-empty
- Email: required, basic valid email format
- Phone: required, phone characters only, minimum 7 characters
- Preferred travel date: required, today or later
- Adults: integer >= 1
- Children / infants: integer >= 0
- Emergency contact: optional, but name and phone must be provided together
- Special requests: optional, maximum 600 characters

## UX / Safety Rules

- `/booking` shows an empty state if the trip has no tours.
- No payment is collected in Phase 4.
- Submission is described as a **trip request**, not a guaranteed booking.
- The itinerary is cleared only after the request snapshot has been created.
- The booking draft survives refreshes and itinerary edits until submission.

## Future Backend Notes

- Replace mock reference generation with a real booking record ID
- Add real availability checks before confirmation
- Add age-based pricing / room / transfer business rules
- Add payment after quote/availability confirmation
- Send confirmation email or SMS
- Persist bookings to an authenticated customer account
