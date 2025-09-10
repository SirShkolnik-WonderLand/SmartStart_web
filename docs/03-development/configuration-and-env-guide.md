# Configuration and Environment Variables Guide

This guide centralizes configuration for SmartStart across local, staging, and production.

## Files and Locations
- Local development: `.env.local` (copy from `env.example`)
- CI/CD and Render: set via provider secrets manager; do not commit `.env`

## Core Variables (from env.example)
- DATABASE_URL: Postgres connection string
- JWT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL
- API_PORT, NODE_ENV, NEXT_PUBLIC_API_URL
- WORKER_ENABLED, STORAGE_ENABLED, MONITOR_ENABLED
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- REDIS_URL, REDIS_HOST, REDIS_PORT
- MAX_INSTANCES, MIN_INSTANCES, HEALTH_CHECK_INTERVAL

## Environment Profiles
- development: verbose logs, hot reload, seed data enabled
- staging: mirrors prod with test data; feature flags on demand
- production: secure defaults, strict timeouts, monitoring enabled

## Secrets Management
- Store secrets in Render/AWS/GCP secret managers
- Rotate JWT and SMTP credentials regularly
- Never commit secrets to Git

## Configuration Matrix
- Backend API: API_PORT, DATABASE_URL, JWT_SECRET, REDIS_URL
- Frontend: NEXT_PUBLIC_API_URL, NEXTAUTH_URL
- Workers: WORKER_ENABLED, REDIS_URL
- Storage: STORAGE_ENABLED, AWS_* (optional)
- Email: SMTP_*
- Monitoring: MONITOR_ENABLED, HEALTH_CHECK_INTERVAL

## Validation Checklist
- `.env.local` present for local dev
- Database reachable; migrations applied
- JWT and NextAuth secrets set and sufficiently random
- Public API URL matches environment
- Optional services (Redis, S3, SMTP) toggled correctly

## Free Tier Optimizations
- Single instance (`MAX_INSTANCES=1`, `MIN_INSTANCES=0`)
- Increase `HEALTH_CHECK_INTERVAL` to reduce churn
- Disable nonessential workers if Redis is unavailable

## Operational Notes
- Document any new vars in this file when introduced
- Reflect sensitive config changes in runbooks and on-call docs
- Align with `07-security/secrets_key_mgmt.txt` for rotation
