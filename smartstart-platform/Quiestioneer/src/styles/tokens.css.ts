import { createGlobalTheme } from '@vanilla-extract/css';

export const tokens = createGlobalTheme(':root', {
  color: {
    bg: '#0b0f14',
    surface: '#121821',
    surfaceHover: '#1a2230',
    text: '#e7edf5',
    muted: '#8b95a6',
    accent: '#7b61ff',
    accentHover: '#6b4eff',
    ok: '#31d0aa',
    warn: '#ffb020',
    bad: '#ff5c5c',
    overlay: 'rgba(11, 15, 20, 0.85)',
  },
  radius: {
    sm: '8px',
    md: '14px',
    lg: '20px',
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },
  fontSize: {
    xs: '14px',
    sm: '16px',
    md: '18px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  transition: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
  },
  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
    md: '0 4px 16px rgba(0, 0, 0, 0.3)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.4)',
    glow: '0 0 20px rgba(123, 97, 255, 0.3)',
  },
});