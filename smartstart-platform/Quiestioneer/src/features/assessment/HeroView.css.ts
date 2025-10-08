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
  position: 'relative',
  overflow: 'hidden'
});

export const backgroundPattern = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.03,
  backgroundImage: `radial-gradient(circle at 25% 25%, ${tokens.color.accent} 0%, transparent 50%),
                     radial-gradient(circle at 75% 75%, ${tokens.color.ok} 0%, transparent 50%)`,
  pointerEvents: 'none'
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '800px',
  width: '100%',
  zIndex: 1
});

export const logo = style({
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.bold,
  color: tokens.color.text,
  marginBottom: tokens.space.md,
  textAlign: 'center'
});

export const title = style({
  fontSize: tokens.fontSize.xxl,
  fontWeight: tokens.fontWeight.bold,
  color: tokens.color.text,
  textAlign: 'center',
  marginBottom: tokens.space.lg,
  lineHeight: 1.2
});

export const subtitle = style({
  fontSize: tokens.fontSize.md,
  color: tokens.color.muted,
  textAlign: 'center',
  marginBottom: tokens.space.xxxl,
  lineHeight: 1.6,
  maxWidth: '600px'
});

export const modeSelector = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: tokens.space.lg,
  width: '100%',
  maxWidth: '600px',
  marginBottom: tokens.space.xxxl
});

export const modeCard = style({
  background: tokens.color.surface,
  border: `1px solid rgba(123, 97, 255, 0.2)`,
  borderRadius: tokens.radius.lg,
  padding: tokens.space.xl,
  cursor: 'pointer',
  transition: `all ${tokens.transition.normal}`,
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  paddingTop: tokens.space.xxl, // Extra space for the default badge
});

export const modeCardSelected = style({
  background: `linear-gradient(135deg, ${tokens.color.surface} 0%, ${tokens.color.surfaceHover} 100%)`,
  borderColor: tokens.color.accent,
  boxShadow: `0 0 0 1px ${tokens.color.accent}, ${tokens.shadow.glow}`
});

globalStyle(`${modeCard}:hover`, {
  background: tokens.color.surfaceHover,
  borderColor: tokens.color.accent,
  transform: 'translateY(-4px)',
  boxShadow: tokens.shadow.md
});

export const modeName = style({
  fontSize: tokens.fontSize.lg,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.color.text,
  marginBottom: tokens.space.sm
});

export const modeQuestions = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.accent,
  fontWeight: tokens.fontWeight.medium,
  marginBottom: tokens.space.sm
});

export const modeTime = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.color.muted,
  marginBottom: tokens.space.md
});

export const modeDescription = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.color.muted,
  lineHeight: 1.4
});

export const defaultBadge = style({
  position: 'absolute',
  top: tokens.space.sm,
  right: tokens.space.sm,
  background: tokens.color.accent,
  color: tokens.color.bg,
  fontSize: '9px',
  fontWeight: tokens.fontWeight.medium,
  padding: `${tokens.space.xs} ${tokens.space.sm}`,
  borderRadius: tokens.radius.sm,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  zIndex: 1,
  pointerEvents: 'none',
  opacity: 0.9
});

export const startButton = style({
  background: `linear-gradient(135deg, ${tokens.color.accent} 0%, ${tokens.color.accentHover} 100%)`,
  color: tokens.color.bg,
  border: 'none',
  borderRadius: tokens.radius.md,
  padding: `${tokens.space.lg} ${tokens.space.xxxl}`,
  fontSize: tokens.fontSize.md,
  fontWeight: tokens.fontWeight.semibold,
  cursor: 'pointer',
  transition: `all ${tokens.transition.normal}`,
  boxShadow: tokens.shadow.md,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  position: 'relative',
  overflow: 'hidden'
});

globalStyle(`${startButton}:hover`, {
  transform: 'translateY(-2px)',
  boxShadow: tokens.shadow.lg
});

globalStyle(`${startButton}:active`, {
  transform: 'translateY(0)'
});

export const badge = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.muted,
  textAlign: 'center',
  marginTop: tokens.space.xxxl,
  padding: `${tokens.space.lg} ${tokens.space.xl}`,
  background: tokens.color.surface,
  borderRadius: tokens.radius.md,
  border: `1px solid rgba(123, 97, 255, 0.1)`
});

export const footer = style({
  position: 'absolute',
  bottom: tokens.space.xl,
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: tokens.fontSize.xs,
  color: tokens.color.muted,
  textAlign: 'center'
});

// Mobile styles
export const mobile = style({
  '@media': {
    '(max-width: 768px)': {
      padding: tokens.space.lg
}
}
});

export const mobileTitle = style({
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSize.xl
}
}
});

export const mobileModeSelector = style({
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: tokens.space.md
}
}
});

export const mobileModeCard = style({
  '@media': {
    '(max-width: 768px)': {
      padding: tokens.space.lg
}
}
});