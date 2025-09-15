import { createContext, useContext, useState, useEffect } from 'react'

export type Theme = 'alice-garden' | 'midnight-glass' | 'cyber-punk' | 'ocean-breeze' | 'sunset-glow'

export interface ThemeConfig {
  name: string
  displayName: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    card: string
    border: string
    muted: string
    success: string
    warning: string
    error: string
    info: string
  }
  gradients: {
    primary: string
    secondary: string
    background: string
    card: string
  }
  effects: {
    glass: string
    glow: string
    shadow: string
  }
  animations: {
    duration: string
    easing: string
  }
}

const themeConfigs: Record<Theme, ThemeConfig> = {
  'alice-garden': {
    name: 'alice-garden',
    displayName: "Alice's Garden",
    description: 'A magical light theme with enchanted purples and mystical blues',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#06B6D4',
      background: '#FEFEFE',
      foreground: '#1F2937',
      card: '#FFFFFF',
      border: '#E5E7EB',
      muted: '#F3F4F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      secondary: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      background: 'linear-gradient(135deg, #FEFEFE 0%, #F8FAFC 100%)',
      card: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)'
    },
    effects: {
      glass: 'rgba(255, 255, 255, 0.25)',
      glow: '0 0 20px rgba(139, 92, 246, 0.3)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    animations: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  'midnight-glass': {
    name: 'midnight-glass',
    displayName: 'Midnight Glass',
    description: 'A sophisticated dark theme with glass morphism effects',
    colors: {
      primary: '#6366F1',
      secondary: '#818CF8',
      accent: '#F59E0B',
      background: '#0F172A',
      foreground: '#F1F5F9',
      card: '#1E293B',
      border: '#334155',
      muted: '#475569',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
      secondary: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      card: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)'
    },
    effects: {
      glass: 'rgba(30, 41, 59, 0.8)',
      glow: '0 0 20px rgba(99, 102, 241, 0.4)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
    },
    animations: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  'cyber-punk': {
    name: 'cyber-punk',
    displayName: 'Cyber Punk',
    description: 'A futuristic neon theme with electric colors and cyber aesthetics',
    colors: {
      primary: '#00FF88',
      secondary: '#00D4FF',
      accent: '#FF0080',
      background: '#0A0A0A',
      foreground: '#00FF88',
      card: '#1A1A1A',
      border: '#333333',
      muted: '#2A2A2A',
      success: '#00FF88',
      warning: '#FFD700',
      error: '#FF0040',
      info: '#00D4FF'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #00FF88 0%, #00D4FF 100%)',
      secondary: 'linear-gradient(135deg, #FF0080 0%, #FFD700 100%)',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
      card: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)'
    },
    effects: {
      glass: 'rgba(0, 255, 136, 0.1)',
      glow: '0 0 20px rgba(0, 255, 136, 0.5)',
      shadow: '0 4px 6px -1px rgba(0, 255, 136, 0.2)'
    },
    animations: {
      duration: '200ms',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
  },
  'ocean-breeze': {
    name: 'ocean-breeze',
    displayName: 'Ocean Breeze',
    description: 'A calming blue theme inspired by the ocean and waves',
    colors: {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      accent: '#06B6D4',
      background: '#F0F9FF',
      foreground: '#0C4A6E',
      card: '#FFFFFF',
      border: '#BAE6FD',
      muted: '#E0F2FE',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0284C7'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
      secondary: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
      card: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)'
    },
    effects: {
      glass: 'rgba(255, 255, 255, 0.3)',
      glow: '0 0 20px rgba(14, 165, 233, 0.3)',
      shadow: '0 4px 6px -1px rgba(14, 165, 233, 0.1)'
    },
    animations: {
      duration: '400ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  'sunset-glow': {
    name: 'sunset-glow',
    displayName: 'Sunset Glow',
    description: 'A warm orange and pink theme inspired by beautiful sunsets',
    colors: {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#EC4899',
      background: '#FFF7ED',
      foreground: '#9A3412',
      card: '#FFFFFF',
      border: '#FED7AA',
      muted: '#FFEDD5',
      success: '#16A34A',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      secondary: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
      card: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)'
    },
    effects: {
      glass: 'rgba(255, 255, 255, 0.4)',
      glow: '0 0 20px rgba(249, 115, 22, 0.3)',
      shadow: '0 4px 6px -1px rgba(249, 115, 22, 0.1)'
    },
    animations: {
      duration: '350ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
}

interface ThemeContextType {
  theme: Theme
  config: ThemeConfig
  setTheme: (theme: Theme) => void
  availableThemes: ThemeConfig[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function EnhancedThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('alice-garden')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('smartstart-theme') as Theme
    if (savedTheme && themeConfigs[savedTheme]) {
      setThemeState(savedTheme)
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('smartstart-theme', newTheme)
    
    // Apply theme to document
    const config = themeConfigs[newTheme]
    const root = document.documentElement
    
    // Set CSS custom properties
    Object.entries(config.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    Object.entries(config.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value)
    })
    
    Object.entries(config.effects).forEach(([key, value]) => {
      root.style.setProperty(`--effect-${key}`, value)
    })
    
    Object.entries(config.animations).forEach(([key, value]) => {
      root.style.setProperty(`--animation-${key}`, value)
    })
  }

  const config = themeConfigs[theme]
  const availableThemes = Object.values(themeConfigs)

  return (
    <ThemeContext.Provider value={{ theme, config, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useEnhancedTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider')
  }
  return context
}

// CSS-in-JS styles for enhanced themes
export const getThemeStyles = (theme: Theme) => {
  const config = themeConfigs[theme]
  
  return `
    :root {
      --color-primary: ${config.colors.primary};
      --color-secondary: ${config.colors.secondary};
      --color-accent: ${config.colors.accent};
      --color-background: ${config.colors.background};
      --color-foreground: ${config.colors.foreground};
      --color-card: ${config.colors.card};
      --color-border: ${config.colors.border};
      --color-muted: ${config.colors.muted};
      --color-success: ${config.colors.success};
      --color-warning: ${config.colors.warning};
      --color-error: ${config.colors.error};
      --color-info: ${config.colors.info};
      
      --gradient-primary: ${config.gradients.primary};
      --gradient-secondary: ${config.gradients.secondary};
      --gradient-background: ${config.gradients.background};
      --gradient-card: ${config.gradients.card};
      
      --effect-glass: ${config.effects.glass};
      --effect-glow: ${config.effects.glow};
      --effect-shadow: ${config.effects.shadow};
      
      --animation-duration: ${config.animations.duration};
      --animation-easing: ${config.animations.easing};
    }
    
    .theme-${theme} {
      background: var(--gradient-background);
      color: var(--color-foreground);
    }
    
    .theme-${theme} .glass-effect {
      background: var(--effect-glass);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .theme-${theme} .glow-effect {
      box-shadow: var(--effect-glow);
    }
    
    .theme-${theme} .card {
      background: var(--gradient-card);
      border: 1px solid var(--color-border);
      box-shadow: var(--effect-shadow);
    }
    
    .theme-${theme} .btn-primary {
      background: var(--gradient-primary);
      color: white;
      transition: all var(--animation-duration) var(--animation-easing);
    }
    
    .theme-${theme} .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: var(--effect-glow);
    }
    
    .theme-${theme} .text-primary {
      color: var(--color-primary);
    }
    
    .theme-${theme} .text-secondary {
      color: var(--color-secondary);
    }
    
    .theme-${theme} .text-accent {
      color: var(--color-accent);
    }
    
    .theme-${theme} .bg-primary {
      background: var(--color-primary);
    }
    
    .theme-${theme} .bg-secondary {
      background: var(--color-secondary);
    }
    
    .theme-${theme} .bg-accent {
      background: var(--color-accent);
    }
  `
}

// Theme selector component
export function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useEnhancedTheme()
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Theme</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableThemes.map((themeConfig) => (
          <button
            key={themeConfig.name}
            onClick={() => setTheme(themeConfig.name as Theme)}
            className={`p-4 border rounded-lg text-left transition-all ${
              theme === themeConfig.name
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-muted/50'
            }`}
          >
            <div className="font-medium">{themeConfig.displayName}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {themeConfig.description}
            </div>
            <div className="flex gap-2 mt-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: themeConfig.colors.primary }}
              />
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: themeConfig.colors.secondary }}
              />
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: themeConfig.colors.accent }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
