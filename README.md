# Campus Report System

Anonymous campus issue reporting monorepo with a **Student Mobile App** (Expo) and **Admin Web Dashboard** (Next.js).

## Structure

```
campus-report-system/
├── apps/
│   ├── student-mobile/     # Expo (React Native + Web preview)
│   └── admin-web/          # Next.js App Router admin dashboard
├── packages/
│   ├── shared-types/       # TypeScript interfaces
│   ├── mock-data/          # Shared mock state + React hooks
│   └── ui-components/      # Design tokens, badges, banners
```

## Prerequisites

- **Node.js** 18+
- **pnpm** 8+ (`npm install -g pnpm`)

## Quick Start

```bash
cd campus-report-system
pnpm install
```

### Run both apps (separate terminals recommended)

```bash
# Terminal 1 — Student app (web preview on :8081)
pnpm dev:student

# Terminal 2 — Admin dashboard (http://localhost:3000)
pnpm dev:admin
```

Or from root:

```bash
pnpm dev:student   # Expo web @ http://localhost:8081
pnpm dev:admin     # Next.js @ http://localhost:3000
```

## Features

### Student Mobile App
- **Dashboard** — Broadcast banner, campus map with color-coded pins, Wall of Fame carousel, green + FAB
- **Create Report** — Photo/video upload, location scanner, category grid, urgency slider, ML duplicate detection
- **Public Issues** — Chronological feed with anonymous IDs, Me Too stacking
- **My Reports** — Status timeline, proof-of-fix photos, anonymous chat

### Admin Web Dashboard
- **Dashboard** — Stat cards, campus heatmap, priority triage table with status filters
- **Ticket Detail** — Department reassignment, chat console, proof upload, Wall of Fame toggle
- **Broadcast Manager** — Create alerts that sync to the student app banner

## Shared State

Both apps share mock data via `@campus/mock-data`, persisted to `localStorage`. Changes in the admin dashboard (alerts, ticket updates, chat replies) reflect in the student app on refresh or via the cross-tab sync event.

## Build

```bash
pnpm build           # Build all packages
pnpm build:admin     # Next.js production build
pnpm build:student   # Expo web export
```

## Tech Stack

| Layer | Stack |
|-------|-------|
| Monorepo | pnpm workspaces |
| Student App | Expo 51, Expo Router, React Native Web |
| Admin App | Next.js 14, Tailwind CSS |
| Shared | TypeScript strict mode |
