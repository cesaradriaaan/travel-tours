# AddyVentures Travel & Tours — Philippines Travel & Tours

A React (Vite) travel & tours website prototype, built phase by phase.
See `docs/` for the full plan, site map, UX flows, design system, and
booking spec.

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:517_`).

## Project Structure

```
travel-tours/
├── docs/           Planning docs (read these first)
├── frontend/       React + Vite app (all current code lives here)
└── backend/        Placeholder for Phase 2
```

## Build Status

- [x] **Phase 1 — Foundation**: scaffold, design tokens, Navbar/Footer,
      routing, Home page
- [x] **Phase 2** — Tours listing (filters) + Tour Detail (gallery, itinerary)
- [x] **Phase 3** — Itinerary Planner (day-by-day builder)
- [x] **Phase 4** — Booking flow (3-step)
- [ ] **Phase 5** — About / Contact + polish + accessibility pass

Every route already works and is wired to shared state (`TripContext`),
so you can click through the whole site now — later phases replace the
placeholder pages with fully-designed ones.
