# Threat Model (STRIDE)

Scope: SmartStart Platform (Frontend, Backend API, DB), Legal Documents subsystem, Auth/RBAC.

## Assets
- Legal documents, signatures, audit logs
- User accounts, PII, billing data
- Secrets (JWT, SMTP, AWS credentials)

## Entry Points
- Public API endpoints
- Frontend application
- Webhooks
- Admin tools and worker jobs

## STRIDE Analysis (selected examples)
- Spoofing: credential stuffing, session hijacking
  - Mitigations: MFA, JWT best practices, IP throttling, device checks
- Tampering: payload manipulation, document/hash tampering
  - Mitigations: input validation, signature hashing, immutable audit logs
- Repudiation: denial of actions
  - Mitigations: audit trails with requestId, signed timestamps, IP/user agent
- Information Disclosure: PII leakage, document access bypass
  - Mitigations: RBAC enforcement, row-level checks, encryption in transit/at rest
- Denial of Service: burst traffic, expensive queries
  - Mitigations: rate limiting, caching, circuit breakers, pagination
- Elevation of Privilege: privilege escalation via missing checks
  - Mitigations: centralized authorization, least privilege, defense-in-depth tests

## Controls Mapping
- Authentication: JWT + optional MFA; token rotation
- Authorization: 12-level RBAC, route/method checks, document-level gates
- Cryptography: TLS 1.3, AES-256-GCM at rest; signature hashing
- Logging/Monitoring: structured logs, metrics, alerting (see SLO/SLI)
- Secrets: managed stores, rotation policy (`07-security/secrets_key_mgmt.txt`)

## Abuse Cases
- Mass document export attempt → throttle and alert on abnormal volume
- Replaying signature requests → nonce and timestamp verification

## Testing
- Security tests (authz bypass, IDOR, rate limit evasion)
- Regular dependency scans and penetration tests

## References
- `SECURITY_COMPLIANCE_GUIDE.md`
- `07-security/logging_monitoring_standard.txt`
- `docs/09-operations/slo_sli_objectives.md`
