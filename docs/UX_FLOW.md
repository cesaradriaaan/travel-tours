# UX Flows

## Flow 1: Discover → Add to Trip

1. User lands on Home, sees featured tours, clicks one (or goes to `/tours`).
2. On `/tours`, user filters by region/tags/price to narrow options.
3. User opens a Tour Detail page, reviews gallery + sample itinerary.
4. User clicks **"Add to Trip"** → tour is added to their itinerary
   (TripContext updates) → a small confirmation toast/badge update shows
   it was added → user can keep browsing or go to `/plan-trip`.

## Flow 2: Build an Itinerary

1. User arrives at `/plan-trip` (either from adding a tour, or directly).
2. Sees a day-by-day timeline. Any tours already added appear under Day 1
   by default.
3. User can:
   - Add a new day
   - Move an item to a different day
   - Remove an item
   - See the running total price update live
4. When satisfied, user clicks **"Proceed to Booking"**.

## Flow 3: Booking

1. **Step 1 — Traveler details:** name, email, phone, number of travelers.
   Inline validation (required fields, valid email format).
2. **Step 2 — Review:** shows the full trip plan (days, items, total price)
   and traveler details for a final check, with an "Edit" link back to the
   planner if needed.
3. **Step 3 — Confirmation:** success screen with a mock booking reference
   number, summary, and a "what happens next" note. (No real payment or
   email is sent in Phase 1 — this is simulated.)

## Flow 4: First-time visitor with no plan in mind

1. User lands on Home, unsure what they want.
2. "Why book with us" + featured tours give a quick sense of options.
3. User goes to `/tours`, browses without filters first, then narrows down.
4. Falls into Flow 1.

## Error / Empty States

- **Empty itinerary at `/plan-trip`:** friendly prompt — "Your trip is empty.
  Browse tours to start planning." with a button to `/tours`.
- **No filter results at `/tours`:** "No tours match these filters" +
  a "Clear filters" button.
- **Booking form errors:** inline messages under each invalid field,
  submit button disabled until required fields are valid.
