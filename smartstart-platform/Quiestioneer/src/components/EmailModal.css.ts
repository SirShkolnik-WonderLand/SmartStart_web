import { style, globalStyle } from '@vanilla-extract/css';
import { tokens } from '../styles/tokens.css';

export const overlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: tokens.color.overlay,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: tokens.space.lg
});

export const modal = style({
  background: tokens.color.surface,
  border: `1px solid rgba(123, 97, 255, 0.2)`,
  borderRadius: tokens.radius.lg,
  padding: tokens.space.xxxl,
  maxWidth: '500px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  position: 'relative',
  boxShadow: tokens.shadow.lg
});

export const header = style({
  textAlign: 'center',
  marginBottom: tokens.space.xl
});

export const title = style({
  fontSize: tokens.fontSize.lg,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.color.text,
  marginBottom: tokens.space.sm
});

export const description = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.muted,
  lineHeight: 1.6
});

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.space.lg
});

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.space.sm
});

export const label = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.text
});

export const input = style({
  background: tokens.color.bg,
  border: `1px solid rgba(123, 97, 255, 0.2)`,
  borderRadius: tokens.radius.sm,
  padding: `${tokens.space.md} ${tokens.space.lg}`,
  fontSize: tokens.fontSize.sm,
  color: tokens.color.text,
  transition: `all ${tokens.transition.fast}`
});

globalStyle(`${input}:focus`, {
  outline: 'none',
  borderColor: tokens.color.accent,
  boxShadow: `0 0 0 2px rgba(123, 97, 255, 0.2)`
});

export const inputError = style({
  borderColor: tokens.color.bad,
  boxShadow: `0 0 0 2px rgba(255, 92, 92, 0.2)`
});

export const errorMessage = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.color.bad,
  marginTop: tokens.space.xs
});

export const buttonGroup = style({
  display: 'flex',
  gap: tokens.space.md,
  marginTop: tokens.space.lg
});

export const button = style({
  flex: 1,
  padding: `${tokens.space.md} ${tokens.space.lg}`,
  borderRadius: tokens.radius.sm,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  cursor: 'pointer',
  transition: `all ${tokens.transition.fast}`,
  border: 'none'
});

export const primaryButton = style({
  background: `linear-gradient(135deg, ${tokens.color.accent} 0%, ${tokens.color.accentHover} 100%)`,
  color: tokens.color.bg,
  boxShadow: tokens.shadow.sm
});

export const secondaryButton = style({
  background: tokens.color.surfaceHover,
  color: tokens.color.text,
  border: `1px solid rgba(123, 97, 255, 0.2)`
});

export const buttonDisabled = style({
  opacity: 0.5,
  cursor: 'not-allowed'
});

export const closeButton = style({
  position: 'absolute',
  top: tokens.space.lg,
  right: tokens.space.lg,
  background: 'transparent',
  border: 'none',
  color: tokens.color.muted,
  cursor: 'pointer',
  padding: tokens.space.sm,
  borderRadius: tokens.radius.sm,
  transition: `all ${tokens.transition.fast}`
});

// Close button hover styles moved to globalStyle calls below

export const privacy = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.color.muted,
  lineHeight: 1.4,
  marginTop: tokens.space.lg,
  padding: tokens.space.md,
  background: tokens.color.bg,
  borderRadius: tokens.radius.sm,
  border: `1px solid rgba(123, 97, 255, 0.1)`
});

// Mobile styles
export const mobileModal = style({
  '@media': {
    '(max-width: 768px)': {
      padding: tokens.space.xl,
      margin: tokens.space.md
}
}
});

export const mobileButtonGroup = style({
  '@media': {
    '(max-width: 768px)': {
      flexDirection: 'column'
}
}
});

// Global hover styles
globalStyle(`${primaryButton}:hover`, {
  transform: 'translateY(-1px)',
  boxShadow: tokens.shadow.md,
});

globalStyle(`${secondaryButton}:hover`, {
  background: tokens.color.surface,
  borderColor: tokens.color.accent,
});

globalStyle(`${closeButton}:hover`, {
  color: tokens.color.text,
  background: tokens.color.surfaceHover,
});