# Philippines Travel & Tours Website — Project Plan

## 1. Overview

A responsive travel & tours website focused on **Philippine destinations**
(islands, dive sites, heritage towns, festivals). Phase 1 is a front-end
prototype — no real backend or payments — built so it can grow into a fully
functional, deployed product later without a rewrite. It also doubles as a
portfolio piece.

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React** (Vite) | Component reuse, clean state management for itinerary/booking, scales to a real backend later |
| Styling | Plain CSS with CSS variables (design tokens) | Full control over a distinctive look |
| State | React state + Context | Booking/itinerary state shared across pages |
| Data | Local mock JSON (`src/data/tours.js`) | Stands in for a future API — swappable later |
| Routing | React Router | Home, Tours, Tour Detail, Itinerary Planner, Booking, About, Contact |
| Icons | lucide-react | Lightweight, consistent icon set |

**Phase 2 (future):** Node/Express or a BaaS (Supabase/Firebase) for real
bookings, auth, and payments (Stripe) — lives in `/backend`, currently empty.

## 3. Build Phases

1. **Phase 1 — Foundation** (this phase): project scaffold, docs, design
   tokens, global layout (Navbar/Footer/routing), Home page.
2. **Phase 2 — Tours listing + Tour Detail**: browsing, filtering, gallery,
   sample itinerary display.
3. **Phase 3 — Itinerary Planner**: add-to-trip, day-by-day builder, running
   price total, shared Context state.
4. **Phase 4 — Booking flow**: traveler info → review → confirmation.
5. **Phase 5 — About / Contact + polish pass**: form validation, responsive
   QA, accessibility pass, final review.

Each phase ships as working, checkable code before the next one starts.

## 4. Related Docs

- `SITE_MAP.md` — full page/route list and what's on each page
- `UX_FLOW.md` — step-by-step user flows (browsing, planning, booking)
- `UI_DESIGN.md` — design tokens (color/type/layout) and rationale
- `BOOKING_SPEC.md` — booking flow spec and data shapes
