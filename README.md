# CampusFix — Campus Report System

A **pnpm monorepo** for managing campus incident reports, featuring a **Student Mobile App** (Expo / React Native), an **Admin Web Dashboard** (Next.js), and a **Backend API** for server-side operations and data management.

> Design source of truth: [`DESIGN.md`](https://github.com/icebearpol/student-report-system/blob/main/DESIGN.md) · Backend handoff: [`apps/student-mobile/HANDOFF.md`](https://github.com/icebearpol/student-report-system/blob/main/apps/student-mobile/HANDOFF.md)

## Project Structure

```text
student-report-system/
├── apps/
│   ├── student-mobile/     # Expo React Native app for students
│   ├── admin-web/          # Next.js admin dashboard
│   └── backend/             # Backend API, controllers, routes, and Prisma
├── packages/
│   ├── shared-types/       # Shared TypeScript interfaces and types
│   ├── mock-data/          # Mock data and helper functions
│   └── ui-components/      # Shared UI utilities and design tokens
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── DESIGN.md
└── README.md
```

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9 (`npm install -g pnpm`)
- For mobile: **Expo Go** on your device or an Android/iOS simulator
- For the backend: A configured database and the environment variables required by the backend
- Git for cloning and managing the repository

## Quick Start

Clone the repository and install the workspace dependencies:

```bash
git clone https://github.com/icebearpol/student-report-system.git
cd student-report-system
pnpm install
```

Run the applications using the scripts defined in the root `package.json`:

```bash
# Run both frontend applications
pnpm dev

# Admin dashboard
pnpm dev

# Student mobile application
pnpm exec expo start --clear
```

The admin dashboard is expected to run at [http://localhost:3000](http://localhost:3000), subject to the project configuration. The student application runs through the Expo development server.

**Backend setup:** Configure the required environment variables and database connection, then follow the scripts and Prisma migration instructions in `apps/backend/package.json` and the backend configuration files.

## Apps

### Admin Web Dashboard (`apps/admin-web`)

A Next.js web dashboard for administrators to review and manage campus reports.

| **Route**       | **Description**                                 |
| --------------- | ----------------------------------------------- |
| `/`             | Dashboard overview and report statistics        |
| `/login`        | Administrator login                             |
| `/signup`       | Account registration                            |
| `/reports`      | Report listing and management                   |
| `/reports/[id]` | Individual report details and status management |
| `/anonymous`    | Anonymous reporting-related interface           |
| `/trash`        | Removed-report management interface             |

Additional components include report tables, statistics cards, administrative chat, navigation, and terms-related UI.

### Student Mobile App (`apps/student-mobile`)

An Expo / React Native application for students to submit and manage campus reports.

| **Screen**       | **Description**                                         |
| ---------------- | ------------------------------------------------------- |
| My Reports       | Student report overview and reporting entry point       |
| Issues / History | Report listing and history-related screens              |
| New Report       | Form for submitting a campus issue                      |
| Report Detail    | Individual report information and related actions       |
| Profile          | Student profile and account information                 |
| Login / Signup   | Authentication screens                                  |
| Anonymous Report | Interface for anonymous reporting                       |
| Campus Map       | Campus map and location-related features                |
| Emergency        | Emergency-related interface                             |
| Notifications    | Notification interface                                  |
| Chat             | Conversation interface for report-related communication |
| Settings         | Account and application settings                        |

Screen availability and integration with the backend should be verified in the running application.

### Backend API (`apps/backend`)

The backend provides server-side functionality through an Express-based API and Prisma ORM.

| **Component**          | **Purpose**                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/index.ts`         | Backend application entry point                                                                                   |
| `src/routes/`          | API route definitions for authentication, reports, users, administration, emergencies, notifications, and uploads |
| `src/controllers/`     | Request handling and application operations                                                                       |
| `src/middleware/`      | Authentication and authorization middleware                                                                       |
| `src/lib/prisma.ts`    | Prisma client configuration                                                                                       |
| `prisma/schema.prisma` | Database schema                                                                                                   |
| `prisma/migrations/`   | Database migration history                                                                                        |

The backend also contains supporting modules for email, AI-assisted moderation, report handling, and removed-report management. Actual behavior depends on configuration, database setup, and successful integration with the frontend applications.

## Shared Packages

| **Package**             | **Purpose**                            |
| ----------------------- | -------------------------------------- |
| `@campus/shared-types`  | Shared TypeScript interfaces and types |
| `@campus/mock-data`     | Mock data and helper functions         |
| `@campus/ui-components` | Shared design tokens and UI utilities  |

These packages help keep shared types and reusable code consistent across the project.

## Build

Build the workspace using the available root scripts:

```bash
pnpm build
```

To build an individual application, use the scripts defined in its respective `package.json`.

## Team Workflow

1. **Shared types first** — Add or update interfaces in `packages/shared-types`.
2. **Update mock data when needed** — Keep `packages/mock-data` consistent with the intended data structure.
3. **Build the interfaces** — Implement student and administrator features in their respective applications.
4. **Develop backend functionality** — Maintain API routes, controllers, authentication, and database models in `apps/backend`.
5. **Integrate and test** — Verify frontend-to-backend communication and test affected features.
6. **Document changes** — Update the README and related documentation when project structure or setup instructions change.

## Tech Stack

- **Monorepo:** pnpm workspaces
- **Mobile:** Expo, React Native, Expo Router
- **Web:** Next.js, React, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express, TypeScript
- **Database ORM:** Prisma
- **Language:** TypeScript
- **Shared code:** TypeScript interfaces, mock data, UI components, and design tokens
- **Version control:** Git and GitHub

## Repository

GitHub: [icebearpol/student-report-system](https://github.com/icebearpol/student-report-system)

