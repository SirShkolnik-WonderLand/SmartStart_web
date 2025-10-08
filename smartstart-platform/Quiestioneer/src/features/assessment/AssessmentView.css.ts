import { style, globalStyle } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: tokens.color.bg,
  position: 'relative'
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${tokens.space.lg} ${tokens.space.xl}`,
  background: tokens.color.surface,
  borderBottom: `1px solid rgba(123, 97, 255, 0.1)`
});

export const backButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.space.sm,
  background: 'transparent',
  border: 'none',
  color: tokens.color.muted,
  cursor: 'pointer',
  padding: `${tokens.space.sm} ${tokens.space.md}`,
  borderRadius: tokens.radius.sm,
  fontSize: tokens.fontSize.sm,
  transition: `all ${tokens.transition.fast}`
});

globalStyle(`${backButton}:hover`, {
  color: tokens.color.text,
  background: tokens.color.surfaceHover
});

export const progressSection = style({
  flex: 1,
  maxWidth: '300px',
  margin: '0 auto'
});

export const progressText = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.muted,
  textAlign: 'center',
  marginBottom: tokens.space.sm
});

export const progressBar = style({
  height: '4px',
  background: tokens.color.surfaceHover,
  borderRadius: tokens.radius.sm,
  overflow: 'hidden'
});

export const progressFill = style({
  height: '100%',
  background: `linear-gradient(90deg, ${tokens.color.accent} 0%, ${tokens.color.accentHover} 100%)`,
  borderRadius: tokens.radius.sm,
  transition: `width ${tokens.transition.slow}`
});

export const content = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: tokens.space.xl,
  maxWidth: '800px',
  margin: '0 auto',
  width: '100%'
});

export const questionCard = style({
  background: tokens.color.surface,
  border: `1px solid rgba(123, 97, 255, 0.2)`,
  borderRadius: tokens.radius.lg,
  padding: tokens.space.xxxl,
  width: '100%',
  marginBottom: tokens.space.xl,
  position: 'relative',
  overflow: 'hidden'
});

export const questionNumber = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.accent,
  fontWeight: tokens.fontWeight.medium,
  marginBottom: tokens.space.sm,
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
});

export const questionCategory = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.muted,
  marginBottom: tokens.space.md
});

export const questionText = style({
  fontSize: tokens.fontSize.lg,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.color.text,
  lineHeight: 1.4,
  marginBottom: tokens.space.xxxl
});

export const choices = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: tokens.space.lg
});

export const choice = style({
  background: tokens.color.surfaceHover,
  border: `1px solid rgba(123, 97, 255, 0.1)`,
  borderRadius: tokens.radius.md,
  padding: tokens.space.xl,
  cursor: 'pointer',
  transition: `all ${tokens.transition.normal}`,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.text,
  textAlign: 'center',
  lineHeight: 1.4,
  position: 'relative',
  overflow: 'hidden'
});

export const choiceSelected = style({
  background: `linear-gradient(135deg, ${tokens.color.accent} 0%, ${tokens.color.accentHover} 100%)`,
  color: tokens.color.bg,
  borderColor: tokens.color.accent,
  boxShadow: `0 0 0 1px ${tokens.color.accent}, ${tokens.shadow.glow}`
});

globalStyle(`${choice}:hover:not(${choiceSelected})`, {
  background: tokens.color.surface,
  borderColor: tokens.color.accent,
  transform: 'translateY(-2px)',
  boxShadow: tokens.shadow.md
});

export const navigation = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  maxWidth: '600px'
});

export const navButton = style({
  background: tokens.color.surface,
  border: `1px solid rgba(123, 97, 255, 0.2)`,
  borderRadius: tokens.radius.md,
  padding: `${tokens.space.md} ${tokens.space.lg}`,
  color: tokens.color.text,
  cursor: 'pointer',
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  transition: `all ${tokens.transition.normal}`
});

export const navButtonDisabled = style({
  opacity: 0.5,
  cursor: 'not-allowed'
});

globalStyle(`${navButton}:hover:not(${navButtonDisabled})`, {
  background: tokens.color.surfaceHover,
  borderColor: tokens.color.accent
});

export const navInfo = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.color.muted,
  textAlign: 'center'
});

// Mobile styles
export const mobileContent = style({
  '@media': {
    '(max-width: 768px)': {
      padding: tokens.space.lg
}
}
});

export const mobileQuestionCard = style({
  '@media': {
    '(max-width: 768px)': {
      padding: tokens.space.xl
}
}
});

export const mobileQuestionText = style({
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSize.md
}
}
});

export const mobileChoices = style({
  '@media': {
    '(max-width: 768px)': {
      gap: tokens.space.md
}
}
});

export const mobileChoice = style({
  '@media': {
    '(max-width: 768px)': {
      padding: tokens.space.lg,
      fontSize: tokens.fontSize.xs
}
}
});

export const mobileHeader = style({
  '@media': {
    '(max-width: 768px)': {
      padding: `${tokens.space.md} ${tokens.space.lg}`
}
}
});

export const mobileProgressSection = style({
  '@media': {
    '(max-width: 768px)': {
      maxWidth: '200px'
}
}
});