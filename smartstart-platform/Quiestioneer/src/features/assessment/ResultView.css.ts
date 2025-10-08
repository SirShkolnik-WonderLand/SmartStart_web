import { style, globalStyle } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: tokens.color.bg,
  padding: tokens.space.xl
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '1000px',
  margin: '0 auto',
  width: '100%'
});

export const header = style({
  textAlign: 'center',
  marginBottom: tokens.space.xxxl
});

export const title = style({
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.bold,
  color: tokens.color.text,
  marginBottom: tokens.space.lg
});

export const gaugeContainer = style({
  marginBottom: tokens.space.xxxl,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});

export const tierBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: `${tokens.space.md} ${tokens.space.lg}`,
  borderRadius: tokens.radius.md,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.semibold,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginTop: tokens.space.lg
});

export const tierBadgeRed = style({
  background: 'rgba(255, 92, 92, 0.1)',
  color: '#ff5c5c',
  border: '1px solid rgba(255, 92, 92, 0.2)'
});

export const tierBadgeAmber = style({
  background: 'rgba(255, 176, 32, 0.1)',
  color: '#ffb020',
  border: '1px solid rgba(255, 176, 32, 0.2)'
});

export const tierBadgeGreen = style({
  background: 'rgba(49, 208, 170, 0.1)',
  color: '#31d0aa',
  border: '1px solid rgba(49, 208, 170, 0.2)'
});

export const tierCopy = style({
  fontSize: tokens.fontSize.md,
  color: tokens.color.muted,
  marginBottom: tokens.space.xxxl,
  textAlign: 'center',
  lineHeight: 1.6
});

export const sections = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: tokens.space.xl,
  width: '100%',
  marginBottom: tokens.space.xxxl
});

export const section = style({
  background: tokens.color.surface,
  border: `1px solid rgba(123, 97, 255, 0.1)`,
  borderRadius: tokens.radius.lg,
  padding: tokens.space.xl
});

export const sectionTitle = style({
  fontSize: tokens.fontSize.lg,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.color.text,
  marginBottom: tokens.space.lg,
  display: 'flex',
  alignItems: 'center',
  gap: tokens.space.sm
});

export const fixList = style({
  listStyle: 'none',
  padding: 0,
  margin: 0
});

export const fixItem = style({
  padding: `${tokens.space.md} 0`,
  borderBottom: `1px solid rgba(123, 97, 255, 0.05)`
});

export const fixItemLast = style({
  borderBottom: 'none'
});

export const fixTitle = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.text,
  marginBottom: tokens.space.xs
});

export const fixDescription = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.color.muted,
  lineHeight: 1.4
});

export const complianceSection = style({
  background: `linear-gradient(135deg, ${tokens.color.surface} 0%, ${tokens.color.surfaceHover} 100%)`,
  border: `1px solid rgba(123, 97, 255, 0.2)`,
  borderRadius: tokens.radius.lg,
  padding: tokens.space.xl,
  marginBottom: tokens.space.xxxl,
  textAlign: 'center'
});

export const complianceTitle = style({
  fontSize: tokens.fontSize.lg,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.color.text,
  marginBottom: tokens.space.md
});

export const complianceText = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.muted,
  lineHeight: 1.6,
  marginBottom: tokens.space.lg
});

export const ctaSection = style({
  display: 'flex',
  gap: tokens.space.lg,
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: tokens.space.xxxl
});

export const ctaButton = style({
  background: `linear-gradient(135deg, ${tokens.color.accent} 0%, ${tokens.color.accentHover} 100%)`,
  color: tokens.color.bg,
  border: 'none',
  borderRadius: tokens.radius.md,
  padding: `${tokens.space.lg} ${tokens.space.xl}`,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.semibold,
  cursor: 'pointer',
  transition: `all ${tokens.transition.normal}`,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.space.sm,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  boxShadow: tokens.shadow.md
});

export const ctaButtonSecondary = style({
  background: tokens.color.surface,
  color: tokens.color.text,
  border: `1px solid rgba(123, 97, 255, 0.2)`
});

// Hover styles moved to globalStyle calls below

export const footer = style({
  textAlign: 'center',
  fontSize: tokens.fontSize.sm,
  color: tokens.color.muted,
  padding: `${tokens.space.xl} 0`,
  borderTop: `1px solid rgba(123, 97, 255, 0.1)`
});

export const footerLink = style({
  color: tokens.color.accent,
  textDecoration: 'none'
});

// Footer link hover styles moved to globalStyle calls below

// Mobile styles
export const mobileContainer = style({
  '@media': {
    '(max-width: 768px)': {
      padding: tokens.space.lg
}
}
});

export const mobileSections = style({
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: tokens.space.lg
}
}
});

export const mobileSection = style({
  '@media': {
    '(max-width: 768px)': {
      padding: tokens.space.lg
}
}
});

export const mobileCtaSection = style({
  '@media': {
    '(max-width: 768px)': {
      flexDirection: 'column',
      gap: tokens.space.md
}
}
});

export const mobileCtaButton = style({
  '@media': {
    '(max-width: 768px)': {
      width: '100%',
      justifyContent: 'center'
}
}
});

// Global hover styles
globalStyle(`${ctaButton}:hover`, {
  transform: 'translateY(-2px)',
  boxShadow: tokens.shadow.lg,
});

globalStyle(`${ctaButtonSecondary}:hover`, {
  background: tokens.color.surfaceHover,
  borderColor: tokens.color.accent,
});

globalStyle(`${footerLink}:hover`, {
  textDecoration: 'underline',
});