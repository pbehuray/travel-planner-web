# Travel Planner Web

Frontend for the AI Travel Planner — a multi-agent LLM system that turns one
free-text travel request into a validated, editable, day-by-day itinerary.

Backend repo: [travel-planner-api](https://github.com/pbehuray/travel-planner-api)

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Plain CSS design system (`app/globals.css`) — no framework dependency
- JWT auth stored client-side, sent as `Authorization: Bearer <token>`

## Features

- **Auth** — register/login pages, JWT persisted in `localStorage`, all trip
  pages gated behind `components/ProtectedRoute.tsx`
- **Plan a trip** (`/plan`) — structured form (destination, days, budget,
  currency, tier, interests) composed into a natural-language request for the
  backend's single-endpoint `/api/plan`
- **Dashboard** (`/dashboard`) — lists the signed-in user's trips
- **Trip results** (`/trips/[id]`) — day-by-day itinerary, budget breakdown,
  hotel suggestions, and:
  - **Edit controls**: add/remove an activity on any day, or regenerate a
    single day with an optional instruction — each re-runs budget +
    validation server-side and persists
  - **"How this plan was built" panel** — a collapsible view of the
    `buildTrace` the backend persists: parsed constraints, which agent
    produced which section and on which LLM provider (Groq generates, Gemini
    computes budget + validates), the validator's pass/fail checklist, and
    repair attempts if the draft needed a fix

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

## Build for production

```bash
npm run build
npm start
```

## Structure

- `lib/api.ts` — typed fetch client for every backend endpoint
- `lib/auth-context.tsx` — JWT/session context (`useAuth`)
- `components/` — `DayCard`, `BudgetBreakdownCard`, `HotelList`,
  `HowThisPlanWasBuilt`, `ValidationBadge`, `ProtectedRoute`, etc.
- `app/` — `/`, `/login`, `/register`, `/dashboard`, `/plan`, `/trips/[id]`

## Known limitations

- The plan form composes a natural-language string rather than sending
  structured fields — the backend's `/api/plan` only accepts free text by
  design (single entry point for the parser agent)
- AI-generated costs, timings, and hotel suggestions are estimates; a
  disclaimer is shown on every trip result
