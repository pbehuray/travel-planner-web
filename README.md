# Travel Planner Web

Frontend for the AI Travel Planner - a multi-agent LLM system for generating travel itineraries.

## Stack

- Next.js 16
- React 19
- TypeScript
- Plain CSS (Tailwind to be added later)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Run in development:
```bash
npm run dev
```

The app will be available at http://localhost:3001

## Build for production

```bash
npm run build
npm start
```

## Phase 1 Status

- [x] Textarea + submit button
- [x] POSTs to `${NEXT_PUBLIC_API_URL}/api/plan`
- [x] Renders returned JSON
- [x] Loading state
- [x] Error state
- [x] Runs on port 3001
