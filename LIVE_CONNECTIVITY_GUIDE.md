# SmartStart Platform - Live Connectivity Guide

## 🚀 **Project Overview**
SmartStart is a comprehensive **Venture Operating System** that provides a complete platform for entrepreneurs, investors, and teams to collaborate on startup ventures. The platform combines:

- **🎯 Venture Management**: Complete CRUD operations for startup ventures, teams, and collaborations
- **🔐 Role-Based Access Control (RBAC)**: 13-tier permission system from GUEST to SUPER_ADMIN
- **💰 BUZ Token Economy**: Internal cryptocurrency for platform transactions and rewards
- **📋 Legal Document Management**: Digital signatures and compliance tracking
- **📊 Analytics Dashboard**: Real-time insights and performance metrics
- **👥 Team Collaboration**: Multi-user venture participation and management
- **🌐 Umbrella Network**: Relationship mapping and venture connections

## 🏗️ **Architecture Overview**
A single place to quickly connect to every live part of SmartStart: Frontend, Backends, Database, and Git. Includes smoke-test commands and troubleshooting.

## 📋 **Table of Contents**
- [Frontend (Live)](#frontend-live)
- [Python Backend (Live)](#python-backend-live)
- [Node API (Live proxy)](#node-api-live-proxy)
- [Database (PostgreSQL)](#database-postgresql)
- [CRUD Operations & RBAC System](#crud-operations--rbac-system)
- [BUZ Token Economy](#buz-token-economy)
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

## CRUD Operations & RBAC System

### **🔐 Role-Based Access Control (RBAC)**
SmartStart implements a comprehensive 13-tier permission system:

**Role Hierarchy (Higher number = More permissions):**
1. `GUEST` (0) - Read-only access
2. `MEMBER` (1) - Basic user access
3. `SUBSCRIBER` (2) - Paid user features
4. `SEAT_HOLDER` (3) - Reserved access
5. `VENTURE_OWNER` (4) - Own ventures
6. `VENTURE_PARTICIPANT` (5) - Join ventures
7. `CONFIDENTIAL_ACCESS` (6) - Sensitive data
8. `RESTRICTED_ACCESS` (7) - Limited admin
9. `HIGHLY_RESTRICTED_ACCESS` (8) - High-level admin
10. `BILLING_ADMIN` (9) - Financial management
11. `SECURITY_ADMIN` (10) - Security controls
12. `LEGAL_ADMIN` (11) - Legal document management
13. `SUPER_ADMIN` (12) - Full platform control

### **📊 Permission Matrix**
Each role has specific permissions for different resources:

**User Management:**
- `read`: MEMBER+ (all roles except GUEST)
- `write`: SUBSCRIBER+ (modify user data)
- `delete`: SUPER_ADMIN only

**Venture Management:**
- `read`: MEMBER+ (view ventures)
- `write`: SUBSCRIBER+ (create/modify ventures)
- `delete`: VENTURE_OWNER, SUPER_ADMIN

**BUZ Token System:**
- `read`: MEMBER+ (view balances)
- `transfer`: SUBSCRIBER+ (send tokens)
- `stake`: SUBSCRIBER+ (stake tokens)
- `mint`: SUPER_ADMIN only
- `burn`: SUPER_ADMIN only

**Legal Documents:**
- `read`: MEMBER+ (view documents)
- `sign`: SUBSCRIBER+ (sign documents)
- `create`: LEGAL_ADMIN, SUPER_ADMIN
- `delete`: LEGAL_ADMIN, SUPER_ADMIN

### **🔄 Complete CRUD Operations**
The platform provides full Create, Read, Update, Delete operations for:

**Core Entities:**
- **Users**: Profile management, authentication, role assignment
- **Ventures**: Startup projects, descriptions, team assignments
- **Teams**: Collaboration groups, member management
- **BUZ Tokens**: Balance tracking, transfers, staking
- **Legal Documents**: Contract management, digital signatures
- **Subscriptions**: Plan management, billing
- **Journey States**: User onboarding progression
- **Analytics**: Performance metrics, reporting

**API Endpoints (Python Backend):**
```bash
# User Management
GET    /api/v1/user/<user_id>           # Read user
PUT    /api/v1/user/<user_id>           # Update user

# Venture Management  
GET    /api/v1/ventures/list/all        # List ventures
POST   /api/v1/ventures/create          # Create venture
GET    /api/v1/ventures/<venture_id>    # Read venture
PUT    /api/v1/ventures/<venture_id>    # Update venture

# BUZ Token System
GET    /api/v1/buz/balance/<user_id>    # Read balance
POST   /api/v1/buz/transfer             # Transfer tokens
POST   /api/v1/buz/stake                # Stake tokens
POST   /api/v1/buz/unstake              # Unstake tokens

# Legal Documents
GET    /api/v1/legal/documents/<user_id> # Read documents
POST   /api/v1/legal/documents/sign      # Sign document
GET    /api/v1/legal/status/<user_id>    # Legal status

# Journey Management
GET    /api/v1/journey/status/<user_id>  # Journey status
POST   /api/v1/journey/complete-stage    # Complete stage
POST   /api/journey/initialize/<user_id> # Initialize journey
```

## BUZ Token Economy

### **💰 Token System Overview**
BUZ is the internal cryptocurrency powering the SmartStart platform:

**Token Supply:**
- **Total Supply**: 999,999,999 BUZ
- **Circulating**: 500,000,000 BUZ
- **Current Price**: $0.02 USD
- **Market Cap**: $10,000,000

**Token Functions:**
- **Rewards**: Earn BUZ for platform participation
- **Staking**: Lock tokens for higher rewards
- **Transfers**: Send tokens between users
- **Venture Investment**: Use BUZ to invest in ventures
- **Premium Features**: Access advanced platform features

**Token Operations:**
```bash
# Check token supply
curl -s https://smartstart-python-brain.onrender.com/api/v1/buz/supply | jq

# Get user balance (requires auth)
curl -s https://smartstart-python-brain.onrender.com/api/v1/buz/balance/<user_id> \
  -H "Authorization: Bearer <token>" | jq

# Transfer tokens (requires auth)
curl -X POST https://smartstart-python-brain.onrender.com/api/v1/buz/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"fromUserId": "user1", "toUserId": "user2", "amount": 1000}' | jq
```

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

## 🎯 **Key Platform Features**

### **🚀 Venture Management System**
- **Complete CRUD**: Create, read, update, delete ventures
- **Team Collaboration**: Multi-user venture participation
- **Role-based Access**: Owners, participants, viewers
- **Progress Tracking**: Milestone and task management
- **Document Sharing**: File uploads and collaboration

### **👥 User Management & Onboarding**
- **6-Stage Journey**: Account creation → Profile setup → Legal pack → Subscription → Orientation
- **Role Progression**: Automatic role upgrades based on activity
- **Profile Management**: Skills, experience, location tracking
- **Social Features**: User connections and networking

### **📋 Legal & Compliance System**
- **Digital Signatures**: Electronic document signing
- **Contract Management**: Confidentiality, equity, partnership agreements
- **Compliance Tracking**: Document status and expiration monitoring
- **Audit Trails**: Complete activity logging

### **📊 Analytics & Reporting**
- **User Analytics**: Activity tracking, engagement metrics
- **Venture Analytics**: Performance indicators, success metrics
- **Platform Analytics**: Usage statistics, growth tracking
- **Custom Dashboards**: Personalized data visualization

## System Status (January 2025) - ✅ FULLY OPERATIONAL
- **✅ Missing `initializeJourney` method**: Fixed - Added to UnifiedAPIService
- **✅ Browser extension conflicts**: Identified - Chrome extensions causing noise (not our code)
- **✅ API service fragmentation**: Fixed - Consolidated to single UnifiedAPIService
- **✅ Journey initialization failing**: Fixed - Python backend now handles journey initialization
- **✅ Python Migration**: Complete - All critical endpoints migrated to Python backend
- **✅ Duplicate function errors**: Fixed - Removed all duplicate endpoint functions
- **✅ Import issues**: Fixed - Proper bcrypt imports and g.current_user usage
- **✅ Deployment failures**: Fixed - Python backend now deploys successfully
- **✅ Journey endpoint**: Fixed - Added back missing journey initialization endpoint
- **✅ User ID handling**: Fixed - Registration now properly passes user ID to journey initialization

## Current Deployment Status - ✅ OPERATIONAL
- **Python Backend**: https://smartstart-python-brain.onrender.com - ✅ HEALTHY
- **Frontend**: https://smartstart-frontend.onrender.com - ✅ HEALTHY
- **Database**: PostgreSQL on Render - ✅ CONNECTED
- **All Endpoints**: ✅ FUNCTIONAL
- **Authentication**: ✅ WORKING (registration and login tested)
- **Journey System**: ✅ WORKING (initialization endpoint restored)
- **CRUD Operations**: ✅ FULLY FUNCTIONAL
- **RBAC System**: ✅ 13-tier permission system active

## Recent Updates (January 15, 2025)
- **Frontend API Service**: Consolidated all API services into `api-unified.ts`
- **Python Backend**: Added comprehensive journey management endpoints
- **Authentication**: Enhanced registration with automatic journey initialization
- **BUZ Token System**: Complete token management in Python backend
- **Error Handling**: Improved validation and error responses
- **Code Cleanup**: Removed all duplicate functions and fixed import issues
- **Journey Endpoint**: Restored missing journey initialization endpoint
- **Documentation**: Enhanced with comprehensive CRUD and RBAC explanations
