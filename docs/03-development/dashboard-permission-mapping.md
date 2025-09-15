# Dashboard Widget → API → Permission Mapping

## Goal
Create a precise mapping of dashboard widgets to backend APIs and the RBAC permissions required to view and act, so we can enforce permission-gated UI and validate end-to-end.

## Sources
- Frontend dashboard: `frontend/src/app/dashboard/page.tsx`
- API client: `frontend/src/lib/api-comprehensive.ts`
- RBAC routes: `server/routes/rbac-api.js`
- Auth middleware: `server/middleware/auth.js`
- DB models: `prisma/schema.prisma` (`Role`, `Permission`, `RolePermission`, `Account`, `Session`)

## Conventions
- Permission format: `resource:action` (e.g., `project:read`, `user:admin`)
- View permission implies read-only; action buttons require corresponding `*:write|delete|admin` permissions.

## Mapping Table

### 1) User Overview Panel
- Data: `getUser(userId)`, `getUserProfile(userId)`
- Endpoints: `/api/users/:id`, `/api/user-profile/profile/:id`
- Permissions:
  - View: `user:read`
  - Edit profile: `user:write`
  - Admin controls: `user:admin`

### 2) Onboarding/Journey Progress
- Data: `getJourneyStatus(userId)`, `initializeJourney(userId)`, `updateJourneyProgress(...)`
- Endpoints: `/api/journey/status/:userId`, `/api/journey/initialize/:userId` (POST), `/api/journey/progress/:userId` (POST)
- Permissions:
  - View: `user:read`
  - Advance steps: `user:write`

### 3) Ventures/Projects Summary
- Data: `getVentures()`, `getVenture(id)`, `createVenture(...)`
- Endpoints: `/api/v1/ventures/list/all`, `/api/ventures/:id`, `/api/ventures/create`
- Permissions:
  - View list/details: `project:read`
  - Create/Edit: `project:write`
  - Delete: `project:delete`
  - Admin ops: `project:admin`

### 4) Offers/Opportunities
- Data: `getOffers()`
- Endpoint: contracts-related (as implemented in `api-comprehensive.ts`)
- Permissions:
  - View: `project:read` (or `user:read` depending on scope)
  - Accept/Manage: `project:write`

### 5) Analytics Snapshot
- Data: `getAnalytics()` (consolidated analytics)
- Endpoint: as implemented in `api-comprehensive.ts`
- Permissions:
  - View: `system:read` or resource-specific `project:read`
  - Export/Admin: `system:admin`

### 6) Notifications
- Data: via notifications APIs in `api-comprehensive.ts`
- Permissions:
  - View: `user:read`

### 7) Legal Pack & Documents
- Data: `getLegalPackStatus(userId)`
- Endpoint: `/api/legal-signing/status/:userId`
- Permissions:
  - View status: `legal:read`
  - Sign: `legal:sign`
  - Modify templates/admin ops: `legal:write` or `system:admin`

### 8) Subscription Status & Billing
- Data: `getSubscriptionStatus(userId)`
- Endpoint: `/api/subscriptions/user/:userId`
- Permissions:
  - View: `subscription:read`
  - Modify: `subscription:write` or `subscription:admin`

### 9) Teams/Collaboration (if surfaced)
- Data: team membership/permissions as exposed by API
- Permissions:
  - View: `user:read` + team scope
  - Manage: `project:write` or team-specific roles

## Effective Permissions Retrieval
- Endpoint: `GET /rbac/users/:userId/permissions`
- Use to compute `allowed(resource, action)` on the client.

## UI Gating Rules
- If `!allowed(resource:read)`: hide entire widget.
- If `allowed(read)` but not `allowed(write|delete|admin)`: render read-only, disable action buttons.
- SUPER_ADMIN: always show full controls.

## Next Steps (Implementation)
1. Fetch effective permissions on dashboard load using userId from JWT.
2. Compute `can{Resource}{Action}` flags and pass to child widgets.
3. Guard buttons and sections accordingly.
4. Add negative tests for a non-admin role to validate gates (403 from API and hidden UI).

## Notes
- Keep production style and i18n consistent.
- Use glass/transparent black theme per project standards.


