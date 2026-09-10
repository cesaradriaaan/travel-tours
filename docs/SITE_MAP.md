# Site Map

```
/                    Home
                     - Hero (destination image + headline + CTA)
                     - Featured tours (3-4 cards)
                     - "Why book with us" section
                     - Newsletter / final CTA

/tours               Tour Listing
                     - Filter bar: region, tags, duration, price range
                     - Grid of TourCards
                     - Empty state if filters return nothing

/tours/:id           Tour Detail
                     - Image gallery
                     - Title, region, tags, duration, price
                     - Summary + highlights list
                     - Day-by-day sample itinerary
                     - "Add to Trip" and "Book Now" actions

/plan-trip           Itinerary Planner
                     - Day-by-day timeline of the user's trip
                     - Add/remove/reorder items per day
                     - Add a new day
                     - Running total price
                     - "Proceed to Booking" CTA

/booking             Booking Flow
                     Step 1: Traveler details (name, email, phone, travelers count)
                     Step 2: Review trip plan + total price
                     Step 3: Confirmation screen (mock — no real payment)

/about               About / How It Works
                     - Company story / mission
                     - How booking works (3-step explainer)

/contact             Contact
                     - Contact form (validated client-side)
                     - FAQ accordion
```

## Navigation

- **Header (all pages):** Logo, Home, Tours, Plan a Trip, About, Contact,
  "Book Now" button. Mobile: hamburger menu with the same links.
- **Footer (all pages):** Quick links, social links, contact info, copyright.
- The Navbar shows a small badge with the number of items currently in the
  trip plan (from TripContext), so users always see their progress.
