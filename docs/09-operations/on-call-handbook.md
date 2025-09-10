# On-Call Handbook

## Contacts and Rotation
- Primary and secondary engineer rotation (weekly)
- Contact list stored in ops runbook index (`09-operations/runbooks_index.txt`)

## Escalation Matrix
1. Primary on-call (page)
2. Secondary (if unacknowledged in 10m)
3. Engineering Manager (30m)
4. Incident Commander (SEV-1)

## Severity Levels
- SEV-1: Critical outage or data loss
- SEV-2: Major degradation or security incident
- SEV-3: Partial impact or intermittent errors

## Procedures
- Acknowledge alert within 5 minutes
- Create incident channel and ticket
- Follow runbook for affected service
- Communicate ETA and updates every 15 minutes (SEV-1/2)

## Runbooks
- See `09-operations/runbooks/*` for service-specific steps
- Backup/restore, database failover, and document signing issues

## Post-Incident
- Timeline, root cause, corrective actions
- Update playbooks and SLOs if needed

## Tooling
- Pager/alerting integrated with metrics and logs
- Dashboards per service with golden signals
