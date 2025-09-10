# Contributing to SmartStart

Thank you for contributing!

## Code of Conduct
- See `CODE_OF_CONDUCT.md`.

## Getting Started
- Branch from `main` using `feat/*`, `fix/*`, or `docs/*`.
- Install dependencies with `npm ci` (root and `frontend/` as needed).
- Keep PRs small and focused with clear descriptions.

## Development Workflow
- Conventional Commits (e.g., `feat(auth): add MFA`).
- Add/maintain tests; ensure `npm test` passes.
- Fix lint issues; preserve existing indentation styles.
- Never commit secrets.

## Documentation
- Update `docs/` when APIs, models, or behavior change.
- Cross-link new docs in `docs/README.md` and `docs/INDEX.md`.
- Respect `docs/11-reference/legal-docs-duplication-map.md` single-source rules.

## Legal Documents
- Runtime TXT lives in `server/Contracts/**`.
- Documentation MD lives in `docs/08-legal/**`.
- Update mappings in:
  - `server/services/legal-framework.js`
  - `server/services/legal-document-service.js`
  - `server/routes/legal-pack-helpers.js`
  - `frontend/src/lib/legal-framework.ts`

## Pull Requests
- Include purpose, scope, breaking changes, screenshots (UI), and tests.
- CI must pass; address review comments promptly.

## Releases
- Update `CHANGELOG.md`; tag per semver.
- Keep deployment docs accurate.

## Style & Quality
- Explicit types for public APIs.
- Use guard clauses and meaningful error handling.
- Comments explain "why" not "how".
- Do not change the UI theme/color scheme.
