# Dashboard & RBAC End-to-End Test Plan

## Purpose
Validate the SmartStart dashboard end-to-end for a privileged user, covering frontend views, backend RBAC enforcement, API behavior, and database state. This plan uses the existing production configuration and the SUPER_ADMIN account to establish a complete, repeatable baseline.

## Scope
- Dashboard pages and widgets in `frontend/src/app/dashboard/page.tsx`
- RBAC data model: `Role`, `Permission`, `RolePermission`, `Account`
- Backend RBAC endpoints in `server/routes/rbac-api.js`
- Database: connectivity, core tables, and seed state
- Deployment: Render auto-deploy from `main`

## Preconditions
- App cloned locally and on `development` branch
- Render configured to auto-deploy from `main` (`render.yaml`)
- Database reachable (Postgres)
- SUPER_ADMIN account available: `udi.admin@alicesolutionsgroup.com`

## Environments
- Production API: `smartstart-api` (Render)
- Production Frontend: `smartstart-frontend` (Render)
- Local Frontend: Next.js app in `frontend/`
- Local Server: Node.js server in `server/`

## Credentials
- SUPER_ADMIN test identity: `udi.admin@alicesolutionsgroup.com`
- Use JWT acquisition via existing auth flow (or admin token if available)

## Data Model References
- Prisma models: `Role`, `Permission`, `RolePermission`, `Account`, `Session`, `User`, plus dashboard-related entities like `Venture`, `Project`, `Subscription`, `Legal*`, etc. See `prisma/schema.prisma` for full definitions.

## RBAC Expectations
- SUPER_ADMIN has all permissions
- Lower roles have scoped permissions as per seeds in `rbac-api.js` (users, projects, legal, subscription, system)

## Test Matrix

### 1. Database Connectivity & Seed State
- Connect to DB and verify context:
  - `SELECT current_user, current_database(), current_schema();`
- Verify RBAC tables exist and are populated:
  - `SELECT COUNT(*) FROM "Role";`
  - `SELECT COUNT(*) FROM "Permission";`
  - `SELECT COUNT(*) FROM "RolePermission";`
- Verify SUPER_ADMIN account and role linkage:
  - Find Account by email and join Role

### 2. Backend RBAC API
- Health: `GET /rbac/health` returns role/permission/account counts
- Roles: `GET /rbac/roles` lists roles with permissions
- Permissions: `GET /rbac/permissions` lists permission catalog
- User permissions: `GET /rbac/users/:userId/permissions` returns effective permissions
- Check permission: `POST /rbac/check-permission` for key resources/actions

Expected: SUPER_ADMIN authorized for all actions; non-admins limited per matrix

### 3. Authentication
- Acquire JWT via `server/routes/unified-auth-api.js` or `simple-auth-api.js`
- Verify middleware `server/middleware/auth.js` accepts token and sets `req.user`
- Confirm `Session` updates `lastUsed` and `Account.lastLogin` where applicable

### 4. Dashboard Views (Frontend)
- Route `frontend/src/app/dashboard/page.tsx`
- Data sources via `frontend/src/lib/api-comprehensive.ts`
- Validate widgets load without 403/401 responses:
  - User profile and onboarding progress
  - Ventures, Offers, Analytics, Notifications
  - Legal pack status, Subscription status
- Confirm per-widget permission gating (e.g., hide admin-only actions for non-admin)

### 5. CRUD Operations
- Users: create/update/read/delete guarded by `user:*`
- Projects/Ventures: `project:*`
- Legal documents: `legal:*`
- System settings: `system:*`

Execute representative CRUD flows and validate:
- HTTP 2xx when authorized
- HTTP 403 when lacking permission
- Database state change consistent with action

### 6. Deployment Behavior
- Merge `development` -> `main`
- Render auto-deploys both services (`autoDeploy: true`, branch `main`)
- Smoke test health endpoints and dashboard post-deploy

## Test Steps (Happy Path: SUPER_ADMIN)
1) Login as `udi.admin@alicesolutionsgroup.com` and capture JWT
2) Load `/dashboard` and confirm:
   - All widgets render
   - Analytics data fetch succeeds
   - Legal and subscription panels reflect DB state
3) Perform CRUD across key domains:
   - Create venture/project, edit, list, delete
   - Adjust user profile or settings
   - Trigger legal document flow read
4) Verify DB writes in Postgres
5) Run RBAC APIs to list effective permissions for this user

## Negative Tests (Role-Scoped)
- Temporarily set a non-admin role for a test user via RBAC API
- Re-run select CRUD and permission checks to confirm 403 blocks

## Observability & Logs
- Server logs: `server/monitor.js` (if used)
- Frontend console errors captured in browser devtools
- Add error IDs to API failure responses where helpful

## Rollback
- If production deploy introduces issues, revert merge or redeploy previous commit
- DB changes: use `prisma db push` cautiously; prefer migrations in a controlled environment

## Open Items
- Ensure permission checks are enforced in all dashboard API routes
- Add unit/integration tests for RBAC-critical endpoints
- Surface allowed actions in UI based on permissions

## References
- Frontend dashboard: `frontend/src/app/dashboard/page.tsx`
- RBAC routes: `server/routes/rbac-api.js`
- Auth middleware: `server/middleware/auth.js`
- Prisma schema: `prisma/schema.prisma`
- Render config: `render.yaml`
