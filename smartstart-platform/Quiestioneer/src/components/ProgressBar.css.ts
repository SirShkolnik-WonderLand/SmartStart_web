import { style, globalStyle } from '@vanilla-extract/css';
import { tokens } from '../styles/tokens.css';

export const container = style({
  width: '100%',
  height: '4px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: tokens.radius.sm,
  overflow: 'hidden',
  position: 'relative',
});

export const fill = style({
  height: '100%',
  background: `linear-gradient(90deg, ${tokens.color.accent} 0%, ${tokens.color.ok} 100%)`,
  borderRadius: tokens.radius.sm,
  transition: `all ${tokens.transition.normal}`,
  boxShadow: `0 0 10px ${tokens.color.accent}80`,
});

export const label = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: tokens.space.sm,
  fontSize: tokens.fontSize.xs,
  color: tokens.color.textMuted,
  fontWeight: tokens.fontWeight.medium,
});

