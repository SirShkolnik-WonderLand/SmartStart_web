# Accessibility (A11y) Audit Checklist

## WCAG 2.1 AA Checklist
- Perceivable: text alternatives, captions, adaptability
- Operable: keyboard access, enough time, seizures and flashes, navigation
- Understandable: readable, predictable, input assistance
- Robust: compatible with assistive technologies

## Testing Protocol
- Keyboard-only navigation and focus order
- Screen reader (NVDA/VoiceOver) basic flows
- Color contrast automated checks
- Form labels, errors, and ARIA attributes

## CI Integration
- Lint with axe/pa11y on critical pages
- Fail CI on severity thresholds
