# Migration & Rollback Playbooks

## Application Migrations
- Pre-checks: health, error budget, traffic window
- Deploy with canary; monitor key SLIs
- Rollback: redeploy previous artifact; clear cache as needed

## Database Migrations (Prisma)
- Pre-checks: backups valid, schema diff reviewed
- Forward-only preferred; design reversible steps
- Apply: `prisma migrate deploy`
- Rollback strategy:
  - For additive: disable feature flags; leave schema
  - For destructive: restore from backup to shadow env; hotfix scripts

## Data Backfill
- Run idempotent scripts; track progress and metrics
- Rollback by marking data stale and re-running from snapshot

## Validations
- Schema compatibility tests (old app ↔ new DB, new app ↔ old DB)
- Smoke tests and golden paths

## Runbooks
- Link: `09-operations/runbooks/backup_restore_procedures.txt`
- Incident communication templates
