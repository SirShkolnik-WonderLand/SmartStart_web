# Seat Order & Billing Authorization (SOBA)

## Summary
Authorizes seat provisioning and billing for subscribers transitioning to the SEAT_HOLDER level.

## Legal Name
Seat Order & Billing Authorization (SOBA)

## Runtime Source
- `server/Contracts/02-subscription-billing/SEAT ORDER & BILLING AUTHORIZATION (SOBA).txt`

## Related Endpoints
- POST `/api/legal/soba/issue`
- POST `/api/legal/soba/sign`

## RBAC Level
- Required at transition to `SEAT_HOLDER`

## Notes
- Updates may require an “Updated SOBA” document for team expansion.
