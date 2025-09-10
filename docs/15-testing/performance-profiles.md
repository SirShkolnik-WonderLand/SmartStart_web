# Performance Testing Profiles

## Tools
- k6 (HTTP load), Artillery (scenarios)

## Profiles
- Read-heavy: 80% GET, 20% POST; 500 VUs; ramp 10m
- Write-heavy (signing): 60% POST; 200 VUs; ramp 10m
- Mixed: 50/50; 300 VUs; ramp 10m

## Thresholds (P95)
- Read endpoints: < 300 ms
- Sign endpoints: < 600 ms
- Error rate < 1%

## Scenarios
- Document list -> fetch templates -> sign -> verify
- Venture workflow list -> analytics summary

## CI Integration
- k6 command: `k6 run -e BASE_URL=$BASE_URL -e TOKEN=$TOKEN tests/perf/legal-signing.k6.js`
- Fail CI if thresholds breached or latency regresses >10%
- Attach JSON summary as artifact
