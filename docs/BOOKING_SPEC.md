# Booking Spec

## Scope (Phase 1)

Front-end only. No real payment processor, no real email/backend. The flow
is fully functional in the UI and produces a mock confirmation, structured
so a real backend can be dropped in later (Phase 2) by replacing the
"submit" step with a real API call.

## Data Shapes

```js
// Tour (from src/data/tours.js)
{
  id: string,
  title: string,
  region: string,
  tags: string[],
  durationDays: number,
  price: number,          // per person, PHP
  images: string[],
  summary: string,
  highlights: string[],
  sampleItinerary: [
    { day: number, title: string, description: string }
  ]
}

// TripPlan (itinerary planner state, held in TripContext)
{
  days: [
    {
      dayNumber: number,
      items: [
        { tourId: string, title: string, notes?: string }
      ]
    }
  ]
}
// totalPrice is derived, not stored: sum of each item's tour price

// Traveler (booking step 1)
{
  name: string,
  email: string,
  phone: string,
  travelers: number   // count of people
}

// Booking (assembled at confirmation)
{
  reference: string,      // mock generated, e.g. "PHT-83920"
  traveler: Traveler,
  tripPlan: TripPlan,
  totalPrice: number,
  status: "confirmed"     // mock — always confirmed in Phase 1
}
```

## Steps

1. **Traveler details** — form with required fields: name, email, phone,
   travelers (min 1). Validated before allowing "Next".
2. **Review** — read-only summary of trip plan (all days/items) and total
   price, plus traveler details with an "Edit" link back to step 1.
3. **Confirmation** — generates a mock reference number, shows a summary,
   and a "what happens next" note. Trip plan is cleared from Context after
   confirmation (fresh start for next visit).

## Validation Rules

- Name: required, non-empty
- Email: required, must match basic email pattern
- Phone: required, digits/spaces/dashes only, min length 7
- Travelers: required, integer ≥ 1

## Phase 2 Notes (not built now)

- Replace mock reference generation with a real backend booking record
- Add payment step (Stripe or similar) between Review and Confirmation
- Send real confirmation email
- Persist bookings so a user can look them up later (requires auth)
