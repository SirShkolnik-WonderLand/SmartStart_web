# Service Level Objectives (SLO) and Indicators (SLI)

Defines availability and performance targets, error budgets, and alert policies.

## Services Covered
- Backend API (Express)
- Frontend (Next.js)
- Legal Documents subsystem (signing, status)

## Availability SLOs
- Backend API: 99.9% monthly
- Frontend: 99.9% monthly
- Document Signing: 99.95% monthly

## Performance SLOs (P95)
- API read endpoints: < 300 ms
- API write/sign endpoints: < 600 ms
- Frontend TTFB: < 500 ms

## Reliability SLIs (examples)
- Availability: successful requests / total requests
- Latency: percentile latencies per route
- Error rate: 5xx and retriable 4xx ratio
- Saturation: CPU, memory, DB connections

## Error Budgets (per month)
- 99.9% → ~43m 49s
- 99.95% → ~21m 54s

## Alert Policies
- Page on-call when:
  - Availability drops below target over 10m (hard page)
  - P95 latency exceeds SLO for 15m (page if 2x threshold)
  - Error rate > 1% over 10m (warn), > 5% over 5m (page)
- Create tickets for chronic budget burn > 25% in week

## Monitoring & Telemetry
- Metrics: request_count, request_duration, error_count, saturation
- Logs: structured JSON with requestId and userId (where applicable)
- Tracing (optional): annotate signing flows and DB calls

## Runbooks
- Link incident response: `07-security/incident_response_plan.txt`
- Link runbooks: `09-operations/runbooks/*`

## Review Cadence
- Weekly: budget burn and hot endpoints
- Monthly: SLO recalibration and capacity planning

## Ownership
- Service owners are responsible for SLOs, dashboards, and alerts.
