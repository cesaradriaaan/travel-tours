# UI Design System

## Concept

"Golden hour over the islands" — warm light meeting deep water, inspired by
Philippine sunsets and coastlines. Deliberately avoiding the generic
cream-background + terracotta-accent look common to AI-generated sites.

## Color Tokens

| Token | Hex | Use |
|---|---|---|
| `--deep-water` | `#0E3B43` | Primary dark — nav, footer, dark sections |
| `--paper` | `#FAF6EF` | Base background |
| `--amber-gold` | `#E3A857` | Primary accent — CTAs, active states |
| `--coral-tide` | `#D66853` | Secondary accent — used sparingly (tags, small highlights) |
| `--seafoam` | `#8FBFAE` | Supporting tint — backgrounds, dividers |
| `--ink` | `#1B2B2E` | Body text |
| `--ink-soft` | `#4B5D5F` | Secondary/muted text |
| `--line` | `#E4DCC9` | Hairline borders/dividers |

## Typography

- **Display (headings):** Fraunces — warm, editorial serif, travel-poster feel
- **Body / UI:** Work Sans — clean, legible, distinct weight contrast from Fraunces
- Type scale (desktop): H1 48/56, H2 34/42, H3 24/32, Body 17/28, Small 14/20
- Line length: body text capped around 70–75 characters

## Layout Principles

- Asymmetric hero (large image + offset headline block), not a centered stock hero
- Left-aligned headings and body copy; generous whitespace over dense grids
- Tour cards: consistent aspect-ratio photography, minimal border, no heavy drop-shadows
- Itinerary planner uses a real day-by-day timeline (numbering is justified
  here — it's an actual sequence, not decoration)
- Buttons: solid amber-gold for primary actions, outlined deep-water for
  secondary actions — no gradients

## Motion

- One orchestrated hero entrance on Home, not fade-up on every section
- Booking step transitions animate (slide/fade) to show progress
- Hover states are subtle (opacity/translate, no card lift + shadow spam)
- Respect `prefers-reduced-motion`

## Accessibility Baseline

- Visible keyboard focus states on all interactive elements
- Color contrast checked against WCAG AA for text on backgrounds
- Form fields have associated labels and error text tied via `aria-describedby`
- Responsive down to 360px width
