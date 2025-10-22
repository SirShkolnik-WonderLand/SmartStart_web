/**
 * THEME SYSTEM
 * Neumorphic design with dark/light modes
 */

export interface DefaultTheme {
    name: 'light' | 'dark';
    colors: {
      // Base colors
      background: string;
      backgroundSecondary: string;
      card: string;
      cardHover: string;
      text: string;
      textSecondary: string;
      textMuted: string;
      border: string;
      
      // Brand colors
      primary: string;
      primaryLight: string;
      primaryDark: string;
      secondary: string;
      secondaryLight: string;
      accent: string;
      
      // Status colors
      success: string;
      successLight: string;
      warning: string;
      warningLight: string;
      error: string;
      errorLight: string;
      info: string;
      infoLight: string;
      
      // Chart colors
      chart1: string;
      chart2: string;
      chart3: string;
      chart4: string;
      chart5: string;
    };
    
    shadows: {
      neumorphic: string;
      neumorphicInset: string;
      neumorphicHover: string;
      soft: string;
      medium: string;
      large: string;
      glow: string;
    };
    
    gradients: {
      primary: string;
      secondary: string;
      success: string;
      danger: string;
      cosmic: string;
    };
    
    typography: {
      fontFamilyDisplay: string;
      fontFamilyBody: string;
      fontFamilyMono: string;
      
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      body: string;
      small: string;
      tiny: string;
    };
    
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      xxxl: string;
    };
    
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    
    transitions: {
      fast: string;
      normal: string;
      slow: string;
      xslow: string;
    };
    
    easing: {
      standard: string;
      decelerate: string;
      accelerate: string;
      sharp: string;
    };
}

// ============================================================================
// LIGHT THEME
// ============================================================================

export const lightTheme: DefaultTheme = {
  name: 'light',
  colors: {
    background: '#e0e5ec',
    backgroundSecondary: '#d1d9e6',
    card: '#e0e5ec',
    cardHover: '#d8dde6',
    text: '#2c3e50',
    textSecondary: '#5a6c7d',
    textMuted: '#8492a6',
    border: '#c4cad3',
    
    primary: '#4a90e2',
    primaryLight: '#6ba3e8',
    primaryDark: '#3a7bc8',
    secondary: '#6a5cff',
    secondaryLight: '#8b7fff',
    accent: '#1de0c1',
    
    success: '#10b981',
    successLight: '#34d399',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    error: '#ef4444',
    errorLight: '#f87171',
    info: '#3b82f6',
    infoLight: '#60a5fa',
    
    chart1: '#4a90e2',
    chart2: '#6a5cff',
    chart3: '#1de0c1',
    chart4: '#f59e0b',
    chart5: '#ef4444',
  },
  
  shadows: {
    neumorphic: '10px 10px 20px #c4c8d0, -10px -10px 20px #ffffff',
    neumorphicInset: 'inset 5px 5px 10px #c4c8d0, inset -5px -5px 10px #ffffff',
    neumorphicHover: '15px 15px 30px #b8bcc4, -15px -15px 30px #ffffff',
    soft: '0 2px 8px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
    large: '0 8px 32px rgba(0, 0, 0, 0.2)',
    glow: '0 0 30px rgba(74, 144, 226, 0.3)',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
    secondary: 'linear-gradient(135deg, #6a5cff 0%, #5547cc 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    cosmic: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  },
  
  typography: {
    fontFamilyDisplay: '"Space Grotesk", "Inter", -apple-system, system-ui, sans-serif',
    fontFamilyBody: '"Inter", -apple-system, system-ui, sans-serif',
    fontFamilyMono: '"JetBrains Mono", "Fira Code", monospace',
    
    h1: 'clamp(2rem, 5vw, 3.5rem)',
    h2: 'clamp(1.75rem, 4vw, 3rem)',
    h3: 'clamp(1.5rem, 3vw, 2.25rem)',
    h4: 'clamp(1.25rem, 2.5vw, 1.75rem)',
    body: '1rem',
    small: '0.875rem',
    tiny: '0.75rem',
  },
  
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    xxl: '3rem',      // 48px
    xxxl: '4rem',     // 64px
  },
  
  borderRadius: {
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
    full: '9999px',
  },
  
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    slow: '450ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    xslow: '600ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
  
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },
};

// ============================================================================
// DARK THEME
// ============================================================================

export const darkTheme: DefaultTheme = {
  name: 'dark',
  colors: {
    background: '#0f0f23',
    backgroundSecondary: '#1a1a2e',
    card: '#16213e',
    cardHover: '#1a2642',
    text: '#e6e6f0',
    textSecondary: '#a0a0b8',
    textMuted: '#6e6e8c',
    border: '#2a3656',
    
    primary: '#4a90e2',
    primaryLight: '#6ba3e8',
    primaryDark: '#3a7bc8',
    secondary: '#6a5cff',
    secondaryLight: '#8b7fff',
    accent: '#1de0c1',
    
    success: '#10b981',
    successLight: '#34d399',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    error: '#ef4444',
    errorLight: '#f87171',
    info: '#3b82f6',
    infoLight: '#60a5fa',
    
    chart1: '#4a90e2',
    chart2: '#6a5cff',
    chart3: '#1de0c1',
    chart4: '#f59e0b',
    chart5: '#ef4444',
  },
  
  shadows: {
    neumorphic: '10px 10px 20px #0a0a1a, -10px -10px 20px #1f1f38',
    neumorphicInset: 'inset 5px 5px 10px #0a0a1a, inset -5px -5px 10px #1f1f38',
    neumorphicHover: '15px 15px 30px #0a0a1a, -15px -15px 30px #242442',
    soft: '0 2px 8px rgba(0, 0, 0, 0.4)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.5)',
    large: '0 8px 32px rgba(0, 0, 0, 0.6)',
    glow: '0 0 30px rgba(74, 144, 226, 0.4)',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
    secondary: 'linear-gradient(135deg, #6a5cff 0%, #5547cc 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    cosmic: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  },
  
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  transitions: lightTheme.transitions,
  easing: lightTheme.easing,
};
