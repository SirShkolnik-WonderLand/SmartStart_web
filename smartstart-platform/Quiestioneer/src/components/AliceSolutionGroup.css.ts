import { style } from '@vanilla-extract/css';
import { tokens } from '../styles/tokens.css';

export const fullBrand = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.space.md,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeight: tokens.fontWeight.bold,
  color: tokens.color.text,
});

export const textOnly = style({
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeight: tokens.fontWeight.bold,
  color: tokens.color.text,
  display: 'flex',
  alignItems: 'center',
});

export const logo = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const logoIcon = style({
  width: '48px',
  height: '48px',
  borderRadius: tokens.radius.md,
  background: `linear-gradient(135deg, ${tokens.color.accent} 0%, #8B5CF6 50%, #A855F7 100%)`,
  color: tokens.color.bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: tokens.fontWeight.bold,
  letterSpacing: '1px',
  boxShadow: `0 4px 20px rgba(123, 97, 255, 0.3)`,
  border: `2px solid rgba(123, 97, 255, 0.2)`,
  position: 'relative',
  
  '::before': {
    content: '""',
    position: 'absolute',
    inset: '-2px',
    borderRadius: tokens.radius.md,
    background: `linear-gradient(135deg, ${tokens.color.accent}, #8B5CF6, #A855F7)`,
    zIndex: -1,
    opacity: 0.3,
    filter: 'blur(8px)',
  }
});

export const brandText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const alice = style({
  fontSize: '20px',
  fontWeight: tokens.fontWeight.bold,
  color: tokens.color.accent,
  lineHeight: 1,
});

export const solution = style({
  fontSize: '16px',
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.text,
  lineHeight: 1,
});

export const group = style({
  fontSize: '16px',
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.textSecondary,
  lineHeight: 1,
});

// Size variants
export const sm = style({
  selectors: {
    [`&`]: {
      transform: 'scale(0.8)',
    }
  }
});

export const md = style({
  selectors: {
    [`&`]: {
      transform: 'scale(1)',
    }
  }
});

export const lg = style({
  selectors: {
    [`&`]: {
      transform: 'scale(1.2)',
    }
  }
});

// Responsive adjustments
export const mobile = style({
  '@media': {
    '(max-width: 768px)': {
      selectors: {
        [`&`]: {
          transform: 'scale(0.9)',
        }
      }
    }
  }
});
