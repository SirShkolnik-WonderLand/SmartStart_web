# Safe Folder Re‑Org Proposal (Non‑Breaking)

Objectives
- Reduce duplication; group related code by domain.
- Keep public routes and imports stable using path aliases.
- Zero runtime changes in phase 1.

Current Highlights
- Frontend in `stellar-den/client` (React + Tailwind)
- Backend in `stellar-den/server` (Express)
- Assets spread across `/assets`, `stellar-den/public/*`, external URLs
- Many docs in root and `stellar-den/*`

Proposed Structure (Phase 1 - aliases only)
- `stellar-den/client/`
  - `app/` (app shell: `App.tsx`, `global.css`, providers)
  - `pages/` (route components)
  - `components/` (shared UI + feature components)
  - `features/` (scoped modules, e.g., `smartstart/`, `community/`)
  - `lib/` (utils, hooks)
  - `assets/` (local images, svgs)
- `stellar-den/server/`
  - `routes/`, `services/`, `cron/`, `templates/`
- `stellar-den/public/` (served static assets only)
- `docs/` (move markdown docs here; keep product guides tidy)

Path Aliases (tsconfig)
- `@/*` → `stellar-den/client`
- `@features/*` → `stellar-den/client/features`
- `@components/*` → `stellar-den/client/components`
- `@server/*` → `stellar-den/server`

Phases
1) Document & alias (this plan) — no file moves; add docs and aliases.
2) Move assets: consolidate logos/images to `stellar-den/public/logos` and update references.
3) Group feature code under `client/features/smartstart`, `features/community` (barrel exports), keep imports stable via aliases.
4) Clean duplicates/unused files after moves (codemods + lint).

Risk Controls
- One feature at a time (start with SmartStart pages/components).
- Keep route paths unchanged.
- Add CI lint/typecheck per step.

Next Actions
- Add/confirm tsconfig path aliases.
- Produce a duplicates/unused report.
- Propose phase‑2 move list for SmartStart feature.
