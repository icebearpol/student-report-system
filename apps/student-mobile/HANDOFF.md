# Backend Handoff — student-mobile (frontend-only)

Every screen below is built against typed contracts in
`packages/shared-types` and fetches through a single accessor per
resource in `packages/mock-data`. To go live: keep each function
signature, swap its body from `return mock…` to a real fetch/query.

## Integration points

| Mock-data function | Real endpoint | Request | Response (shared-types) | Consumed by |
|---|---|---|---|---|
| `fetchNotificationsByUser(userId)` / `getNotificationsByUser(userId)` | `GET /api/notifications?userId={userId}` | `userId: string` | `Notification[]` | `app/notifications.tsx` |
| `markAllNotificationsRead(userId)` | `PATCH /api/notifications/read` | `{ userId }` or `{ ids }` | `{ updated: number }` | `app/notifications.tsx` (Mark all as read) |
| `getUnreadNotificationCount(userId)` | `GET /api/notifications/unread-count?userId={userId}` | `userId: string` | `{ count: number }` | future badge on bell icon |
| `fetchMapPins()` / `getMapPins()` | `GET /api/map-pins` | — | `MapPin[]` | `app/public-map.tsx` |
| `fetchEmergencyContacts()` / `getEmergencyContacts()` | `GET /api/emergency-contacts` | — | `EmergencyContact[]` | `app/emergency.tsx` |
| `getDuplicateCheckReports()` | `GET /api/reports/duplicate-candidates` or `POST /api/reports/check-duplicate { category, location, title }` | check input | `Array<{ id, category, location, title }>` | `app/new-report.tsx` |
| `getReportsByUser(userId)` (existing) | `GET /api/reports?submittedBy={userId}` | `userId: string` | `Report[]` | Home, History, Profile stats |
| `getReportById(id)` (existing) | `GET /api/reports/:id` | `id: string` | `Report` | `report/[id]`, notifications deep-link, map cards |
| `getCommentsByReport(reportId)` (existing) | `GET /api/reports/:id/comments` | `reportId: string` | `ReportComment[]` | `report/[id]` |
| `logout()` (`lib/auth.ts`) | real auth/session teardown | — | — | Menu drawer, Profile Log Out → reset to `/login` |

New contract types: `Notification`, `NotificationType`
(`status_change | comment | system | emergency`),
`NotificationPreferences`, `MapPin`, `EmergencyContact`,
`Report.latitude?/longitude?`, `User.notificationSettings?`.

## Known gaps

- **Map uses placeholder + pin list, no real map SDK integrated.**
  Recommend `react-native-maps` (or Expo MapView) mounted at the
  marked `BACKEND/MAP TODO` in `app/public-map.tsx`, plotting pins
  from `getMapPins()`. Requires `Report.latitude/longitude`
  populated server-side via a geocoding endpoint.
- **Distance omitted deliberately** on map cards rather than faked;
  add a `distanceM` field to `MapPin` server-side if wanted.
- **Notification read-state is local-only** (`useState` in
  `notifications.tsx`) and resets on reload — persist server-side.
- **Emergency call uses `tel:` link** (`Linking.openURL`); no backend
  dispatch system assumed. Consider `POST /api/emergency-log
  { contactId, userId, timestamp }` so calls are recorded.
- **Urgent reports** (`/new-report?priority=urgent` from Emergency)
  reuse the existing submit flow; backend may need priority
  alerting / notify-admin logic for `priority=urgent`.
- **Profile is display-only.** No editing UI; editable fields would
  need `PATCH /api/users/:id`.
- **Help & Support rows** (Menu, Profile) are placeholders with no
  contract — backend to define if a support/FAQ endpoint is wanted.

## Assumptions

- Mock coordinates in `mockReports` are a plausible campus cluster
  near 40.7128, -74.0060 — replace with real geocoded values.
- Mock notifications are derived FROM existing mock reports/comments
  (status changes, admin comments), not invented content.
- All new screens reuse Section 2 design tokens exactly (ocean
  teal/cyan/ice, 16px cards, existing type scale) — no new
  colors, radii, or type values introduced.
- Auth (login/signup/session) is out of scope; only the `logout()`
  seam is marked.
