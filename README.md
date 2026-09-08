# Campus Report System

A **pnpm monorepo** for managing campus incident reports — featuring a **Student Mobile App** (Expo / React Native) and an **Admin Web Dashboard** (Next.js).

> Design source of truth: [`DESIGN.md`](DESIGN.md) · Backend handoff: [`apps/student-mobile/HANDOFF.md`](apps/student-mobile/HANDOFF.md)

## Project Structure

```
campus-report-system/
├── apps/
│   ├── student-mobile/     # Expo React Native app for students
│   └── admin-web/          # Next.js admin dashboard
├── packages/
│   ├── shared-types/       # Shared TypeScript interfaces
│   ├── mock-data/          # Mock data & helper functions
│   └── ui-components/      # Design tokens & shared utilities
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9 (`npm install -g pnpm`)
- For mobile: **Expo Go** app on your device, or Android/iOS simulator

## Quick Start

```bash
# Install all dependencies
pnpm install

# Run both apps in parallel
pnpm dev

# Or run individually
pnpm dev:admin    # Admin dashboard → http://localhost:3000
pnpm dev:student  # Student mobile app → Expo dev server
```

## Apps

### Admin Web Dashboard (`apps/admin-web`)

Next.js 15 App Router dashboard with Tailwind CSS and Lucide icons.

| Route | Description |
|-------|-------------|
| `/` | Dashboard with stats, recent reports, category breakdown |
| `/reports` | Full report listing table |
| `/reports/[id]` | Report detail with status management |

### Student Mobile App (`apps/student-mobile`)

Expo Router mobile app for students to view and submit reports.

| Screen | Description |
|--------|-------------|
| My Reports | List of submitted reports with FAB to create new |
| Profile | Student profile info |
| Report Detail | Full report view with admin comments |
| New Report | Form to submit a new campus report |

## Shared Packages

| Package | Purpose |
|---------|---------|
| `@campus/shared-types` | `Report`, `User`, `DashboardStats` interfaces and label maps |
| `@campus/mock-data` | Seed data and lookup helpers (`getReportById`, etc.) |
| `@campus/ui-components` | Design tokens, badge configs, date/text utilities |

## Build

```bash
pnpm build
```

## Team Workflow

1. **Shared types first** — Add or modify interfaces in `packages/shared-types`
2. **Update mock data** — Reflect changes in `packages/mock-data`
3. **Build UI** — Consume shared packages in both apps
4. **Backend integration** — Replace mock-data imports with API calls when ready

## Tech Stack

- **Monorepo:** pnpm workspaces
- **Mobile:** Expo 52, React Native, Expo Router
- **Web:** Next.js 15, React 19, Tailwind CSS 3, Lucide React
- **Language:** TypeScript (strict mode)
