import { style, styleVariants } from '@vanilla-extract/css';
import { tokens } from '../styles/tokens.css';

const baseButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.space.sm,
  padding: `${tokens.space.lg} ${tokens.space.xxl}`,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.semibold,
  borderRadius: tokens.radius.md,
  border: 'none',
  cursor: 'pointer',
  transition: `all ${tokens.transition.fast}`,
  textDecoration: 'none',
  minHeight: '48px',
  
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed'
},
  
  ':focus-visible': {
    outline: `2px solid ${tokens.color.accent}`,
    outlineOffset: '2px'
},
  
  '@media': {
    '(max-width: 768px)': {
      minHeight: '56px',
      fontSize: tokens.fontSize.md
}
}
});

export const button = styleVariants({
  primary: [
    baseButton,
    {
      background: `linear-gradient(135deg, ${tokens.color.accent} 0%, #6b4eff 100%)`,
      color: tokens.color.text,
      boxShadow: tokens.shadow.glow,
      
      ':hover:not(:disabled)': {
        transform: 'translateY(-2px) scale(1.02)',
        boxShadow: `${tokens.shadow.glow}, ${tokens.shadow.md}`
},
      
      ':active:not(:disabled)': {
        transform: 'scale(0.98)'
}
},
  ],
  secondary: [
    baseButton,
    {
      background: tokens.color.surface,
      color: tokens.color.text,
      border: `1px solid rgba(255, 255, 255, 0.1)`,
      
      ':hover:not(:disabled)': {
        background: tokens.color.surfaceHover,
        borderColor: 'rgba(255, 255, 255, 0.2)'
}
},
  ],
  choice: [
    baseButton,
    {
      background: tokens.color.surface,
      color: tokens.color.text,
      border: `2px solid rgba(255, 255, 255, 0.1)`,
      padding: tokens.space.xl,
      width: '100%',
      fontSize: tokens.fontSize.md,
      fontWeight: tokens.fontWeight.medium,
      textAlign: 'left',
      justifyContent: 'flex-start',
      minHeight: '64px',
      
      ':hover:not(:disabled)': {
        borderColor: tokens.color.accent,
        background: tokens.color.surfaceHover,
        transform: 'translateX(4px) scale(1.01)'
},
      
      '@media': {
        '(max-width: 768px)': {
          minHeight: '72px'
}
}
},
  ],
  choiceSelected: [
    baseButton,
    {
      background: `linear-gradient(135deg, ${tokens.color.accent}15 0%, ${tokens.color.accent}25 100%)`,
      color: tokens.color.text,
      border: `2px solid ${tokens.color.accent}`,
      padding: tokens.space.xl,
      width: '100%',
      fontSize: tokens.fontSize.md,
      fontWeight: tokens.fontWeight.semibold,
      textAlign: 'left',
      justifyContent: 'flex-start',
      minHeight: '64px',
      
      '@media': {
        '(max-width: 768px)': {
          minHeight: '72px'
}
}
},
  ]
});

