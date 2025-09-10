# API Lifecycle Policy

## Versioning
- URL-based versioning: `/api/v1/*`
- Backward-compatible changes allowed within minor/patch
- Breaking changes only in new major versions (v2, v3)

## Deprecation
- Announce deprecations in `CHANGELOG.md` and API changelog
- Provide minimum 90-day deprecation window
- Deprecation headers:
  - `Deprecation: true`
  - `Sunset: <RFC 1123 date>`
  - `Link: <migration guide>`

## Compatibility Guarantees
- Response envelope fields remain stable within a major version
- Error codes stable; adding new codes is non-breaking
- Pagination and filtering parameters remain backward compatible

## SDK Support Matrix
- JavaScript/Node: maintained for last 2 major API versions
- Python: maintained for last 1 major API version
- PHP: community support

## Change Management
- All API changes require docs updates and tests
- Add examples and Postman updates for new endpoints

## EOL Policy
- EOL versions receive 30-day sunset notice and 410 responses after cutoff
