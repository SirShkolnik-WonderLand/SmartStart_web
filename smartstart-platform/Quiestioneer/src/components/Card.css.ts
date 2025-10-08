import { style, globalStyle } from '@vanilla-extract/css';
import { tokens } from '../styles/tokens.css';

export const card = style({
  background: `linear-gradient(135deg, ${tokens.color.surface} 0%, rgba(26, 34, 48, 0.8) 100%)`,
  borderRadius: tokens.radius.lg,
  padding: tokens.space.xxl,
  boxShadow: tokens.shadow.md,
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  transition: `all ${tokens.transition.normal}`,
  
  '@media': {
    '(max-width: 768px)': {
      padding: tokens.space.xl,
      borderRadius: tokens.radius.md
}
}
});

export const cardHover = style({
  ':hover': {
    boxShadow: tokens.shadow.lg,
    transform: 'translateY(-2px)'
}
});

