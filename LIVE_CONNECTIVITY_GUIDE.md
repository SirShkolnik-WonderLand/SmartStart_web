# Live Connectivity Guide

A single place to quickly connect to every live part of SmartStart: Frontend, Backends, Database, and Git. Includes smoke-test commands and troubleshooting.

## Index
- [Frontend (Live)](#frontend-live)
- [Python Backend (Live)](#python-backend-live)
- [Node API (Live proxy)](#node-api-live-proxy)
- [Database (PostgreSQL)](#database-postgresql)
- [Git (Repo, branches, deploy flow)](#git-repo-branches-deploy-flow)
- [Environment variables](#environment-variables)
- [Smoke tests](#smoke-tests)
- [Troubleshooting](#troubleshooting)

## Frontend (Live)
- URL: `https://smartstart-frontend.onrender.com`
- Built with Next.js. Uses `NEXT_PUBLIC_API_URL` to talk to the backend.
- Current prod base: `https://smartstart-python-brain.onrender.com`

Quick checks:
```bash
# Fetch homepage HTML
curl -s https://smartstart-frontend.onrender.com | head -n 10
```

## Python Backend (Live)
- URL: `https://smartstart-python-brain.onrender.com`
- Provides all primary API routes used by the app (auth, user, ventures, BUZ, legal, subscriptions, analytics).

Health and public endpoints:
```bash
# Health
curl -s https://smartstart-python-brain.onrender.com/health | jq

# BUZ token supply (public)
curl -s https://smartstart-python-brain.onrender.com/api/v1/buz/supply | jq
```

Auth endpoints (require valid credentials):
```bash
# Login (example; adjust email/password to a valid account)
curl -s https://smartstart-python-brain.onrender.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"<email>","password":"<password>"}' | jq

# Using a token (replace TOKEN)
TOKEN="<jwt_or_bearer_token>"
curl -s https://smartstart-python-brain.onrender.com/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Node API (Live proxy)
- URL: `https://smartstart-api.onrender.com`
- Historically proxied to Python. Frontend now points directly to Python, but this remains for compatibility and some tests.

Quick checks:
```bash
curl -s https://smartstart-api.onrender.com/health | jq
```

## Database (PostgreSQL)
- Host: `dpg-d2uaqd6r433s73e56vfg-a.oregon-postgres.render.com`
- DB: `smartstart_db_4ahd`
- User: `smartstart_db_4ahd_user`
- Password: managed in environment; for manual session use exported `PGPASSWORD`.

Connect (non-interactive examples):
```bash
# List public tables
PGPASSWORD=LYcgYXd9w9pBB4HPuNretjMOOlKxWP48 psql \
  -h dpg-d2uaqd6r433s73e56vfg-a.oregon-postgres.render.com \
  -U smartstart_db_4ahd_user -d smartstart_db_4ahd \
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"

# Describe the User table
PGPASSWORD=LYcgYXd9w9pBB4HPuNretjMOOlKxWP48 psql \
  -h dpg-d2uaqd6r433s73e56vfg-a.oregon-postgres.render.com \
  -U smartstart_db_4ahd_user -d smartstart_db_4ahd \
  -c "\\d \"User\""

# Check SUPER_ADMIN presence (example email)
PGPASSWORD=LYcgYXd9w9pBB4HPuNretjMOOlKxWP48 psql \
  -h dpg-d2uaqd6r433s73e56vfg-a.oregon-postgres.render.com \
  -U smartstart_db_4ahd_user -d smartstart_db_4ahd \
  -c "SELECT id, email, role FROM \"User\" WHERE email='udi.admin@alicesolutionsgroup.com';"
```

Notes:
- Passwords in DB are bcrypt or SHA256 depending on the service path. Use the application to create users when possible; modifying password hashes directly requires correct hashing.

## Git (Repo, branches, deploy flow)
- Repo: `https://github.com/udishkolnik/SmartStart`
- Primary branches: `main` (auto-deployed on Render), feature branches for ongoing work.

Common commands:
```bash
# Add, commit, push a feature branch
git checkout -b feature/<name>
# ...edit...
git add -A && git commit -m "feat: <message>" && git push origin HEAD

# Open PR via GitHub UI, then merge to main to trigger Render deploy

# Fast forward: merge and push to main (maintainers)
git checkout main && git pull --rebase && \
  git merge --no-ff feature/<name> -m "Merge feature/<name>" && \
  git push origin main
```

Render services (auto-deploy from `main`):
- Frontend: `smartstart-frontend`
- Python backend: `smartstart-python-brain`
- Node API: `smartstart-api`

## Environment variables
Key prod variables and where they live:
- Frontend `NEXT_PUBLIC_API_URL`: `https://smartstart-python-brain.onrender.com` (set in `render.yaml` for the frontend service)
- Python backend: `PORT=5000`, CORS origins include the frontend URL
- Database URL is set in Render dashboard

References in repo:
- `render.yaml`
- `frontend/src/lib/api-unified.ts` (client base URL logic)

## Smoke tests
Use these to validate the end-to-end after a deploy.
```bash
# 1) Frontend up
curl -I https://smartstart-frontend.onrender.com | head -n 1

# 2) Python health
curl -s https://smartstart-python-brain.onrender.com/health | jq '.success, .data.status, .data.version'

# 3) BUZ public supply
curl -s https://smartstart-python-brain.onrender.com/api/v1/buz/supply | jq '.success, .data.currentPrice'

# 4) Optional auth (needs valid user)
TOKEN="$(curl -s https://smartstart-python-brain.onrender.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"<email>","password":"<password>"}' | jq -r '.data.token')"
[ "$TOKEN" != "null" ] && \
  curl -s https://smartstart-python-brain.onrender.com/api/auth/me -H "Authorization: Bearer $TOKEN" | jq
```

## Troubleshooting
- 401/403 responses: ensure a valid token and that the `role` has required permissions.
- "Invalid salt" on login: the stored password hash may be incompatible; recreate the user through the app to generate a proper bcrypt hash.
- CORS errors: verify `CORS_ORIGINS` in the Python service includes the frontend origin.
- Frontend still calling old base: confirm `NEXT_PUBLIC_API_URL` is set to the Python backend in Render.
