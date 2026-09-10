# Testing Checklist

Run the relevant section after each phase, before moving to the next one.
Check items off as you go. If something fails, note it and fix before
continuing — don't stack new phases on top of unresolved bugs.

## Phase 1 — Foundation ✅ DONE

Tested and addressed:
- Fixed: broken image (Banaue & Batad) — tour photos replaced/updated
- Fixed: "Book Now" disappearing on mobile — now pinned next to the hamburger icon at all widths
- Confirmed non-issue: red console errors traced to a browser extension, not app code
- Quieted: React Router future-flag warnings
- All other Phase 1 checks (navigation, responsiveness, Add to Trip → Plan Trip flow) passed

<details>
<summary>Original Phase 1 checklist (for reference)</summary>

## Phase 1 — Foundation (original)

**Setup**
- [ ] `npm install` completes with no errors
- [ ] `npm run dev` starts and prints a local URL
- [ ] Site loads in the browser at that URL with no blank/white screen
- [ ] No red errors in the browser console (right-click page → Inspect → Console tab)

**Navigation**
- [ ] Logo click returns to Home from any page
- [ ] All 6 nav links go to the correct page (Home, Tours, Plan a Trip, About, Contact, Book Now)
- [ ] Active page is highlighted in the nav (underline under current link)
- [ ] Resize browser narrow (or open dev tools device toolbar) — hamburger menu appears below ~860px
- [ ] Hamburger menu opens/closes and links work on mobile width
- [ ] Footer links all navigate correctly

**Home page**
- [ ] Hero image loads (not a broken image icon)
- [ ] "Browse Tours" and "Start Planning" buttons go to the right pages
- [ ] 3 featured tour cards display with images, titles, prices
- [ ] Clicking a tour card goes to that tour's detail page
- [ ] "Why book with us" 4-item grid displays correctly
- [ ] CTA band at the bottom displays and "Plan My Trip" button works

**Responsiveness**
- [ ] Resize from wide desktop → tablet → mobile width, nothing overlaps or overflows
- [ ] Text stays readable at all sizes (nothing cut off)
- [ ] Images scale properly, don't distort

**Data flow (basic)**
- [ ] Visit a Tour Detail page (e.g. `/tours/el-nido-island-hop`), click "Add to Trip"
- [ ] Go to `/plan-trip` — the added tour appears under Day 1
- [ ] Nav badge next to "Plan a Trip" shows the correct item count


</details>

---

## Phase 2 — Tours Listing + Tour Detail (test after this phase — take your time)

- [ ] `/tours` shows all tours in a grid
- [ ] Filter controls (region, tags, duration, price) narrow results correctly
- [ ] Clearing filters restores the full list
- [ ] Empty state shows when filters match nothing, with a working "Clear filters" button
- [ ] Tour Detail page shows full image gallery (not just one image)
- [ ] Gallery navigation (arrows/thumbnails) works
- [ ] Day-by-day sample itinerary displays correctly
- [ ] "Add to Trip" and "Book Now" buttons both work
- [ ] Direct URL to a tour detail page (typed/refreshed) still loads correctly
- [ ] Invalid tour ID in URL shows the "not found" state gracefully, not a crash

---

## Phase 3 — Itinerary Planner

- [ ] Adding tours from multiple pages all land in the same trip plan
- [ ] "Add a day" creates a new day correctly
- [ ] Removing an item updates the day and running total immediately
- [ ] Reordering/moving an item between days works without losing data
- [ ] Running total price recalculates correctly after every change
- [ ] Empty itinerary shows the friendly empty state with a link to Tours
- [ ] Refreshing the page — check whether trip state is expected to persist or reset (confirm intended behavior)
- [ ] "Proceed to Booking" carries the correct trip plan into the booking flow

---

## Phase 4 — Booking Flow

- [ ] Step 1 (traveler details) rejects empty required fields
- [ ] Email field rejects invalid formats (e.g. "test@" )
- [ ] Phone field validation works as specified
- [ ] Travelers count can't go below 1
- [ ] "Next" is disabled until all required fields are valid
- [ ] Step 2 (review) shows correct trip plan, total price, and traveler details
- [ ] "Edit" link from review correctly returns to step 1 with data retained
- [ ] Step 3 (confirmation) shows a generated reference number and summary
- [ ] Trip plan clears after confirmation (fresh start confirmed)
- [ ] Refreshing mid-flow doesn't crash the page

---

## Phase 5 — About / Contact + Polish

- [ ] About page content displays correctly
- [ ] Contact form validates required fields before allowing submit
- [ ] Contact form shows a success state after "submitting"
- [ ] FAQ accordion opens/closes correctly, only one (or intended number) open at a time
- [ ] Keyboard-only navigation: can Tab through nav, buttons, and forms with visible focus outlines
- [ ] Run a full click-through of every page one more time, at 3 screen widths (mobile/tablet/desktop)
- [ ] Check browser console one final time across all pages for stray errors/warnings
