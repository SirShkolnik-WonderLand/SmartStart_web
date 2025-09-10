# Frontend Coding Standards & Component Styleguide

## Principles
- Accessibility first; semantic HTML
- Performance and DX; avoid unnecessary re-renders
- Do not change theme or color scheme; follow theme docs

## Language & Framework
- Next.js (App Router), React 18, TypeScript 5
- Explicit types for public APIs and component props

## State Management
- Prefer server components and fetch caching
- Use React context sparingly; colocate state

## Components
- Name by intent; keep small and focused
- Extract reusable UI into `src/components/*`
- Follow standardized class mapping in theme docs

## Styling
- Tailwind with standardized classes from `THEME_STANDARDIZATION_*`
- No ad-hoc colors; use variables and mapped classes

## Linting & Formatting
- ESLint + TypeScript rules; fix all warnings
- Prettier where configured; do not alter indentation style

## Testing
- Unit tests for logic-rich components
- Integration tests for flows and accessibility checks

## Accessibility
- Keyboard navigation, focus management, aria-* as needed
- Color contrast per WCAG 2.1 AA
