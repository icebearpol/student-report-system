# Campus Report System — Design Doc

Source of truth for product design and frontend/backend contracts.
Endpoint-level handoff details live in
[`apps/student-mobile/HANDOFF.md`](apps/student-mobile/HANDOFF.md).

## 2. Global Design System

- **Theme:** "Ocean duotone" — teal `#0A3C58` → cyan `#46C3DB`
  gradients on ice background `#E8F7FB`. White cards, rounded
  `16–36px`, soft shadows. Tokens live in
  `packages/ui-components/src/tokens/index.ts` — extend, never duplicate.
- **Typography:** Inter, `xs12 / sm14 / base16 / lg18 / xl20 / 2xl24 /
  3xl30`; `normal400 / medium500 / semibold600 / bold700`.
- **Status colors:** `pending` amber `#F59E0B`, `in_review` blue
  `#3B82F6`, `resolved` green `#10B981`, `rejected` red `#EF4444`
  (pill `bg`/`text` pairs in `statusBadgeConfig`). Priority reuses the
  same scale (`low` neutral → `urgent` red).
- **Brand (auth):** unified transparent/floating lockup
  (`brand.authMarkWidth 240 × brand.authMarkHeight 212`,
  `campusfix-full-logo.png`) rendered directly on the teal→cyan
  gradient hero — no white card/surface/shadow behind the mark.
  Anonymous entry, login, and signup-hero share identical mark size +
  spacing; only the "Anonymous Mode Enabled" pill differentiates
  anonymous.
- **Rule for this task:** no new colors, radii, or type-scale values
  were introduced — all five features below reuse these tokens exactly.

## 4.9 Profile (revised) — `(tabs)/profile`

- **Layout:** gradient hero header (avatar 80px on translucent white,
  identity block, stat chips Open / In Progress / Resolved), then
  white-card body: Student ID + Role icon-cards, action rows.
- **Data:** stats via existing `getReportsByUser(currentStudent.id)`
  counts — no new contract. Identity from `currentStudent`.
- **Actions:** My Reports → History; Notification Preferences →
  `/notifications`; Privacy & Anonymous Mode → `/anonymous`;
  Help & Support (placeholder, no contract); Log Out → `logout()` in
  `lib/auth.ts` + `router.replace('/login')` with
  `// BACKEND TODO: wire to real auth/session teardown`.
- **States:** synchronous mock read; no loading/error branch needed.
- **Gap:** display-only — no editing UI. Editable fields would need
  `PATCH /api/users/:id` (flagged in HANDOFF.md).

## 4.11 Notifications — `/notifications`

- **Trigger:** bell icon in Home top bar (`(tabs)/index`).
- **Data contract:** `Notification`, `NotificationType`
  (`status_change | comment | system | emergency`),
  `NotificationPreferences` in `packages/shared-types`, stored on
  `User.notificationSettings?`. Mock rows are derived FROM existing
  mock reports/comments, not invented content.
- **Seam:** `fetchNotificationsByUser(userId)` /
  `getNotificationsByUser(userId)` → `GET
  /api/notifications?userId=`; `markAllNotificationsRead(userId)` →
  `PATCH /api/notifications/read`; `getUnreadNotificationCount` →
  `GET /api/notifications/unread-count`. Each carries a
  `BACKEND TODO` JSDoc in `packages/mock-data`.
- **UI:** icon-in-tinted-circle by type, title, relative time, unread
  accent border + dot; tap → `/report/[id]` when `reportId` present;
  "Mark all as read" updates local state only.
- **States:** loading skeleton, error-with-retry, empty ("You're all
  caught up") — simulated async via `Promise.resolve` so the backend
  swap touches only the data layer.
- **Gap:** read-state is local `useState`, resets on reload —
  persist server-side.

## 4.12 Menu — hamburger drawer (`components/MenuDrawer.tsx`)

- **Trigger:** hamburger icon in Home top bar; custom `Modal`
  left slide-in sheet (ice bg, white cards) — no new dependencies.
- **Content:** mini profile summary (tap → Profile); nav list Home,
  My Issues, Report an Issue, History, Public Map, Emergency,
  Notification Settings, Help & Support (placeholder), Log Out.
- **Seam:** Log Out calls stubbed `logout()` in `lib/auth.ts`,
  marked `// BACKEND TODO: wire to real auth/session teardown +
  navigation reset to /login`. No other backend contract (auth out of
  scope).

## 4.13 Public Map — `/public-map`

- **Route:** top-level stack screen (tabs unchanged). Reachable from
  Home Quick Action "View Public Map" and the Issues tab List|Map
  segmented control (Map segment routes here).
- **Layout:** top map placeholder (existing spec: icon + "Map View —
  Public issues plotted", ice-tinted container) with a
  `BACKEND/MAP TODO` comment marking the mount point for
  `react-native-maps` (or Expo MapView); below, category filter chips
  (taxonomy + badge colors) + status toggle filtering client-side;
  scrollable `MapPin` cards (title, `StatusBadge`, category,
  location → `/report/[id]`).
- **Data contract:** `MapPin { id, title, location, latitude,
  longitude, status, category }` in shared-types; `Report.latitude?/
  longitude?` added with a backend-required geocoding comment.
  `getMapPins()` / `fetchMapPins()` → `GET /api/map-pins`, built from
  mock reports with plausible campus-area coordinates.
- **States:** loading / error-with-retry / empty, via simulated async.
- **Gaps:** no live map SDK integrated — recommend `react-native-maps`
  + backend geocoding endpoint; distance deliberately omitted rather
  than faked (add `distanceM` server-side if wanted).

## 4.14 Emergency — `/emergency` (modal)

- **Trigger:** Home Quick Action "Emergency".
- **Data contract:** `EmergencyContact { id, name, role, phone,
  priority }`; `getEmergencyContacts()` / `fetchEmergencyContacts()`
  → `GET /api/emergency-contacts` (Campus Security p1, Health
  Services, Facilities On-Call).
- **Primary CTA** "Call Campus Security": `Linking.openURL('tel:…')`,
  marked `// BACKEND TODO: consider POST /api/emergency-log so calls
  are recorded server-side`. No backend dispatch assumed.
- **Secondary CTA** "Submit Urgent Report": navigates to
  `/new-report?priority=urgent` (new-report reads the param via
  `useLocalSearchParams`, defaults `medium`); reuses the existing
  submit flow — backend may need priority alerting / notify-admin
  logic for urgent reports.
- **Visual:** urgent-toned (danger `#BA1A1A → #EF4444` gradient CTA,
  `#ffdad6` icon tints) within the existing card system; loading /
  error states for the contact list.
