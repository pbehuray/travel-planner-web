# Travel Planner Web

Frontend for the AI Travel Planner — a multi-agent LLM system that turns one
free-text travel request into a validated, editable, day-by-day itinerary with
a budget breakdown, hotel suggestions, and a map.

- **Live app:** [travel-planner-web-one.vercel.app](https://travel-planner-web-one.vercel.app)
- **Backend repo:** [travel-planner-api](https://github.com/pbehuray/travel-planner-api)

> The backend runs on a free tier that sleeps when idle, so the first plan
> generation after inactivity can take longer while it wakes.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Plain CSS design system (`app/globals.css`) — no framework dependency
- Leaflet + OpenStreetMap for the trip map (free, keyless)
- JWT auth stored client-side, sent as `Authorization: Bearer <token>`

## Features

- **Auth** — register/login pages, JWT persisted in `localStorage`, all trip
  pages gated behind `components/ProtectedRoute.tsx`
- **Plan a trip** (`/plan`) — structured form (destination, days, budget,
  currency, tier, interests) composed into a natural-language request for the
  backend's single-endpoint `/api/plan`, with a clear loading state for the
  (slow) generation call
- **Dashboard** (`/dashboard`) — lists the signed-in user's trips
- **Trip results** (`/trips/[id]`) — day-by-day itinerary, budget breakdown,
  hotel suggestions, a color-coded validation badge, and a warnings banner when
  a plan degraded, plus:
  - **Edit controls** — add/remove an activity on any day, or regenerate a
    single day with an optional instruction; each re-runs budget + validation
    server-side and persists
  - **Trip map** — a collapsible Leaflet map with a pin per day (neighborhood
    level), auto-framed to fit the trip; places that can't be resolved fall
    back to city center so the map never breaks
  - **"How this plan was built" panel** — a collapsible view of the
    `buildTrace` the backend persists: parsed constraints, which agent produced
    which section and on which LLM provider (Groq generates, Gemini computes
    budget + validates), the validator's pass/fail checklist, and repair
    attempts if the draft needed a fix
  - **PDF export** — a print-optimized "Download PDF" of the itinerary
  - **Shareable link** — a public, read-only view of a trip (`/share/[id]`) to
    share with travel companions; no login, no edit controls, no personal data

## Creative features (and the problems they solve)

- **Conversational day regeneration.** AI plans are rarely perfect on the first
  try, and regenerating the whole trip throws away the days the user liked. This
  lets the user reshape one day in natural language ("more outdoor activities")
  while the rest stays put and the plan is re-validated server-side.
- **"How this plan was built" transparency panel.** AI recommendations are black
  boxes. This surfaces the multi-agent reasoning and the independent validation
  so the user can see *why* the plan looks the way it does and that it was
  checked by a separate model.
- **Map, PDF export, and shareable link.** Practical touches travelers actually
  want — see the plan spatially, take it offline, and share it read-only.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Point `.env.local` at your backend:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Run in development:
```bash
npm run dev
```

The app runs at `http://localhost:3001`.

> `NEXT_PUBLIC_*` variables are baked in at build time, so a change requires a
> rebuild/redeploy to take effect.

## Build for production

```bash
npm run build
npm start
```

**Deploy:** deployed on Vercel (framework preset: Next.js). Set
`NEXT_PUBLIC_API_URL` in the Vercel project settings to the backend URL.

## Structure

- `lib/api.ts` — typed fetch client for every backend endpoint (injects the JWT
  header, surfaces API errors and graceful-degradation `warnings`)
- `lib/auth-context.tsx` — JWT/session context (`useAuth`)
- `components/` — `DayCard`, `BudgetBreakdownCard`, `HotelList`,
  `HowThisPlanWasBuilt`, `TripMap`, `ValidationBadge`, `WarningsBanner`,
  `ProtectedRoute`, etc.
- `app/` — `/`, `/login`, `/register`, `/dashboard`, `/plan`, `/trips/[id]`,
  `/share/[id]`

## Key design decisions and trade-offs

- **Structured form → natural-language string.** The backend's `/api/plan`
  accepts free text by design (a single entry point for the parser agent), but a
  raw textarea is poor UX. The form gives users clear fields and composes them
  into the request the API expects — good UX without changing the API contract.
- **Plain CSS over a framework.** Avoided framework setup/config overhead for a
  time-boxed build; a small custom design system keeps the UI clean and
  consistent with full control.
- **Map at neighborhood level, in a collapsible panel expanded by default.**
  Neighborhood pins are reliable to geocode (a handful of lookups) and give
  useful spatial context; the panel is visible on load but collapsible so the
  itinerary stays the focus.
- **Graceful failure is shown, not hidden.** When the backend degrades a plan,
  the UI shows the warnings and a low-confidence badge rather than pretending
  everything succeeded.

## Known limitations

- First generation after backend idle is slow (free-tier cold start).
- AI-generated costs, timings, and hotel suggestions are estimates; a disclaimer
  is shown on every trip result.
- Map pins are neighborhood-level; vague place names fall back to city center.

## Future work

- Per-activity map pins with routes drawn between a day's stops.
- Voice interface (speak the request, hear the itinerary back) — the request
  layer is already text-based, so a voice front-end drops in cleanly.
- Richer editing (drag-to-reorder activities, alternative suggestions per day).