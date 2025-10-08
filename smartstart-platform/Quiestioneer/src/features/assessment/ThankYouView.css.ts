import { style, globalStyle } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: tokens.space.xxl,
  background: `linear-gradient(135deg, ${tokens.color.bg} 0%, ${tokens.color.surface} 100%)`,
  textAlign: 'center'
});

export const content = style({
  maxWidth: '600px',
  width: '100%'
});

export const icon = style({
  fontSize: '64px',
  marginBottom: tokens.space.xl,
  color: tokens.color.ok
});

export const title = style({
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.bold,
  color: tokens.color.text,
  marginBottom: tokens.space.lg
});

export const description = style({
  fontSize: tokens.fontSize.md,
  color: tokens.color.muted,
  lineHeight: 1.6,
  marginBottom: tokens.space.xxxl
});

export const actions = style({
  display: 'flex',
  gap: tokens.space.lg,
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: tokens.space.xxxl
});

export const button = style({
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
  boxShadow: tokens.shadow.md
});

export const buttonSecondary = style({
  background: tokens.color.surface,
  color: tokens.color.text,
  border: `1px solid rgba(123, 97, 255, 0.2)`
});

// Hover styles using globalStyle
globalStyle(`${button}:hover`, {
  transform: 'translateY(-2px)',
  boxShadow: tokens.shadow.lg
});

globalStyle(`${buttonSecondary}:hover`, {
  background: tokens.color.surfaceHover,
  borderColor: tokens.color.accent
});

export const footer = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.muted,
  lineHeight: 1.6
});

export const footerLink = style({
  color: tokens.color.accent,
  textDecoration: 'none'
});

globalStyle(`${footerLink}:hover`, {
  textDecoration: 'underline'
});

// Mobile styles
export const mobileContainer = style({
  '@media': {
    '(max-width: 768px)': {
      padding: tokens.space.lg
}
}
});

export const mobileActions = style({
  '@media': {
    '(max-width: 768px)': {
      flexDirection: 'column',
      gap: tokens.space.md
}
}
});

export const mobileButton = style({
  '@media': {
    '(max-width: 768px)': {
      width: '100%',
      justifyContent: 'center'
}
}
});
