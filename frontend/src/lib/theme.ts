export type Theme = 'light' | 'midnight' | 'ocean' | 'forest' | 'sunset' | 'aurora' | 'rose' | 'cosmic' | 'emerald' | 'crimson'

export interface ThemeConfig {
  name: Theme
  displayName: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    highlight: string
    background: string
    surface: string
    text: string
    muted: string
  }
}

export const themes: Record<Theme, ThemeConfig> = {
  light: {
    name: 'light',
    displayName: 'Alice\'s Garden',
    description: 'Magical garden with enchanted purples, mystical blues, and golden accents',
    colors: {
      primary: '#8B5CF6', // Enchanted purple
      secondary: '#3B82F6', // Mystical blue
      accent: '#EC4899', // Magical pink
      highlight: '#F59E0B', // Golden hour
      background: '#F8FAFF', // Soft magical white
      surface: '#F1F5FF', // Light lavender mist
      text: '#1E1B4B', // Deep indigo
      muted: '#6B7280' // Soft gray
    }
  },
  midnight: {
    name: 'midnight',
    displayName: 'Midnight Glass',
    description: 'Deep midnight with frosted glass surfaces',
    colors: {
      primary: '#3A7BDE',
      secondary: '#6B39D1',
      accent: '#DE6EA6',
      highlight: '#F59E0B',
      background: '#0B1021',
      surface: '#121736',
      text: '#F5F7FA',
      muted: '#98A2B8'
    }
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean Depths',
    description: 'Deep blue ocean with teal accents',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      accent: '#10B981',
      highlight: '#F59E0B',
      background: '#0C1821',
      surface: '#1E293B',
      text: '#E2E8F0',
      muted: '#94A3B8'
    }
  },
  forest: {
    name: 'forest',
    displayName: 'Enchanted Forest',
    description: 'Deep green forest with golden highlights',
    colors: {
      primary: '#059669',
      secondary: '#0D9488',
      accent: '#D97706',
      highlight: '#F59E0B',
      background: '#0F1419',
      surface: '#1F2937',
      text: '#F3F4F6',
      muted: '#9CA3AF'
    }
  },
  sunset: {
    name: 'sunset',
    displayName: 'Golden Sunset',
    description: 'Warm sunset with orange and pink tones',
    colors: {
      primary: '#EA580C',
      secondary: '#DC2626',
      accent: '#EC4899',
      highlight: '#F59E0B',
      background: '#1C1917',
      surface: '#292524',
      text: '#FEF3C7',
      muted: '#A78BFA'
    }
  },
  aurora: {
    name: 'aurora',
    displayName: 'Aurora Borealis',
    description: 'Mystical aurora with green and blue waves',
    colors: {
      primary: '#10B981',
      secondary: '#06B6D4',
      accent: '#8B5CF6',
      highlight: '#F59E0B',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      muted: '#94A3B8'
    }
  },
  rose: {
    name: 'rose',
    displayName: 'Rose Garden',
    description: 'Elegant rose garden with pink and red tones',
    colors: {
      primary: '#E11D48',
      secondary: '#BE185D',
      accent: '#F43F5E',
      highlight: '#F59E0B',
      background: '#1F0A1A',
      surface: '#2D1B2D',
      text: '#FDF2F8',
      muted: '#F9A8D4'
    }
  },
  cosmic: {
    name: 'cosmic',
    displayName: 'Cosmic Space',
    description: 'Deep space with purple and blue nebula',
    colors: {
      primary: '#7C3AED',
      secondary: '#3B82F6',
      accent: '#EC4899',
      highlight: '#F59E0B',
      background: '#0A0A0F',
      surface: '#1A1A2E',
      text: '#E2E8F0',
      muted: '#A78BFA'
    }
  },
  emerald: {
    name: 'emerald',
    displayName: 'Emerald City',
    description: 'Rich emerald with gold accents',
    colors: {
      primary: '#059669',
      secondary: '#0D9488',
      accent: '#D97706',
      highlight: '#F59E0B',
      background: '#0F1419',
      surface: '#1F2937',
      text: '#F3F4F6',
      muted: '#9CA3AF'
    }
  },
  crimson: {
    name: 'crimson',
    displayName: 'Crimson Fire',
    description: 'Bold crimson with fiery red tones',
    colors: {
      primary: '#DC2626',
      secondary: '#B91C1C',
      accent: '#F59E0B',
      highlight: '#FBBF24',
      background: '#1A0A0A',
      surface: '#2D1B1B',
      text: '#FEF2F2',
      muted: '#FCA5A5'
    }
  }
}

export const defaultTheme: Theme = 'midnight'

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  
  // Remove all theme attributes first
  root.removeAttribute('data-theme')
  
  // Apply the specific theme
  if (theme !== 'light') {
    root.setAttribute('data-theme', theme)
  }
  
  localStorage.setItem('wonderland-theme', theme)
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return defaultTheme
  const stored = localStorage.getItem('wonderland-theme') as Theme
  return stored && themes[stored] ? stored : defaultTheme
}

export function toggleTheme(currentTheme: Theme): Theme {
  const themeOrder: Theme[] = ['midnight', 'ocean', 'forest', 'sunset', 'light']
  const currentIndex = themeOrder.indexOf(currentTheme)
  const nextIndex = (currentIndex + 1) % themeOrder.length
  const newTheme = themeOrder[nextIndex]
  applyTheme(newTheme)
  return newTheme
}

