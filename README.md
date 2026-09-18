# AddyVentures Travel & Tours — Philippines Travel & Tours

A React (Vite) travel & tours website, built phase by phase.
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
├── backend/
│   ├── server.js
│   ├── supabase.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── lib/
│   │   │   └── supabaseClient.js
│   │   └── App.jsx
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── vercel.json
│
├── docs/
│   ├── PROJECT_PLAN.md
│   ├── SITE_MAP.md
│   ├── UI_DESIGN.md
│   ├── UX_FLOW.md
│   ├── BOOKING_SPEC.md
│   └── TESTING_CHECKLIST.md
│
├── README.md
└── .gitignore
```
## Tech Stack

Frontend: React + Vite, React Router, JavaScript, HTML/CSS
Backend: Node.js + Express.js
Database/Auth: Supabase
Email: Resend
Frontend Hosting: Vercel
Backend Hosting: Render
Version Control: Git + GitHub

## Build Status

- [x] Phase 1 — Planned the overall project scope, sitemap, UI/UX direction, and documentation for AddyVenture.

- [x] Phase 2 — Set up the React + Vite frontend structure, routing, and reusable components.

- [x] Phase 3 — Built the main public pages including Home, Tours, Tour Details, Plan Trip, About, and Contact.

- [x] Phase 4 — Developed the complete booking flow with form validation, pricing, and confirmation handling.

- [x] Phase 5 — Connected the Node.js and Express backend to Supabase for database operations and API functionality.

- [x] Phase 6 — Built the admin dashboard for managing bookings, contact messages, and administrative actions.

- [x] Phase 7 — Added authentication, client and admin roles, protected routes, My Bookings, vouchers, and cancellation features.

- [x] Phase 8 — Strengthened the API with authorization, rate limiting, idempotency, duplicate protection, timeouts, and improved request handling.

- [x] Phase 9 — Improved security, privacy handling, legal pages, and production-ready protections across the system.

- [x] Phase 10 — Optimized performance through code splitting, lazy loading, SEO, accessibility, UX polish, and regression testing.

- [x] Phase 11 — Deployed the backend to Render and the frontend to Vercel, then configured production environment variables, CORS, Supabase redirects, and routing.

- [x] Phase 12 — Completed final production QA for authentication, bookings, admin workflows, cancellations, vouchers, responsive behavior, and live-site functionality.

