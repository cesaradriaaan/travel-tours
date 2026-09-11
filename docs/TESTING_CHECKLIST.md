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

## Phase 2 — Tours Listing + Tour Detail ✅ DONE

QA'd and confirmed working. Minor polish suggestions noted for Phase 5.

<details>
<summary>Original Phase 2 checklist (for reference)</summary>

## Phase 2 — Tours Listing + Tour Detail (original)

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


</details>

---

## Phase 3 — Itinerary Planner v2 (test after this — take your time)

Revised based on your Phase 3 QA suggestions. Note: day "reordering" is done
via drag-and-drop on the grip handle in each day's header; item "moving"
between days is still a dropdown selector on each item.

- [ ] Adding tours from multiple pages all land in the same trip plan
- [ ] Refresh the page mid-plan — trip should now persist (saved to browser localStorage), not reset
- [ ] "Add another day" creates a new day correctly
- [ ] Removing an item updates the day and running total immediately
- [ ] Moving an item to a different day via its dropdown works without losing data
- [ ] Try adding the same tour twice — second attempt should be blocked, with a link to its existing day instead of an "Add to Trip" button
- [ ] Remove a day that has content (tours/meals/accommodation/transport) — should show a confirm prompt before deleting
- [ ] Delete a middle day (e.g. Day 2 of 4) — remaining days should renumber sequentially (Day 3→2, Day 4→3) with content intact
- [ ] Drag a day by its grip handle and drop it in a new position — days renumber to match the new order, content preserved
- [ ] Check Breakfast/Lunch/Dinner boxes on a day — state should stick and reflect in the Preview
- [ ] Enter a hotel name + location in Accommodation for a day — persists and shows in Preview
- [ ] Pick a Transportation option for a day — persists and shows in Preview
- [ ] Click "Duplicate Day" — new day appears right after the original with identical content, correctly renumbered
- [ ] Click "Preview Itinerary" — modal shows every day's tours, meals, accommodation, transport, and the total price accurately
- [ ] Close the preview modal (X button and clicking outside it) both work
- [ ] Running total price recalculates correctly after every change
- [ ] Empty itinerary shows the friendly empty state with a link to Tours
- [ ] "Proceed to Booking" carries the correct trip plan into the booking flow

---

## Phase 4 — Booking Flow (test after implementation)

- [ ] Open `/booking` with no tours selected — friendly empty state appears and both navigation buttons work
- [ ] Add at least one tour, proceed to Booking, and confirm the 3-step progress indicator appears correctly
- [ ] Leave required traveler fields blank and click “Review Booking” — inline validation blocks progress
- [ ] Invalid email (e.g. `test@`) is rejected
- [ ] Invalid/too-short phone number is rejected
- [ ] Preferred travel date cannot be in the past
- [ ] Adults cannot go below 1; children and infants cannot go below 0
- [ ] Total traveler count updates immediately when Adults / Children / Infants change
- [ ] Estimated total updates as itinerary-per-traveler × total travelers
- [ ] Enter traveler details, refresh the page, and confirm the draft is retained
- [ ] Enter traveler details, click “Edit itinerary,” change Phase 3, then return to Booking — traveler draft remains
- [ ] Emergency contact is optional when both fields are blank
- [ ] Enter only one emergency-contact field — validation asks for both name and phone
- [ ] Special requests counter updates and stops at 600 characters
- [ ] Step 2 shows the correct traveler name, contact details, date, nationality (when provided), and traveler breakdown
- [ ] Step 2 shows every itinerary day in the current order with tours, meals, accommodation, and transportation
- [ ] Step 2 price summary matches the traveler count and Phase 3 itinerary price
- [ ] “Edit” returns to traveler details without clearing data
- [ ] “Edit itinerary” returns to Phase 3 without clearing the booking draft
- [ ] “Send Trip Request” creates an `ADV-YYMMDD-XXXX` reference
- [ ] Confirmation clearly says the request is received, not guaranteed/paid
- [ ] Confirmation contains a saved itinerary snapshot even though the active trip is cleared
- [ ] Refresh the confirmation page in the same tab — confirmation remains visible
- [ ] “Print / Save Summary” opens the browser print dialog and the print layout excludes navigation/action controls
- [ ] After confirmation, opening Plan a Trip starts with a fresh itinerary
- [ ] “Plan Another Trip” clears the previous confirmation session and opens a fresh planner
- [ ] Test Step 1, Step 2, and Confirmation at desktop, tablet, and mobile widths for overlap/overflow

---

## Phase 5 — About / Contact + Polish

- [ ] About page content displays correctly
- [ ] Contact form validates required fields before allowing submit
- [ ] Contact form shows a success state after "submitting"
- [ ] FAQ accordion opens/closes correctly, only one (or intended number) open at a time
- [ ] Keyboard-only navigation: can Tab through nav, buttons, and forms with visible focus outlines
- [ ] Run a full click-through of every page one more time, at 3 screen widths (mobile/tablet/desktop)
- [ ] Check browser console one final time across all pages for stray errors/warnings
