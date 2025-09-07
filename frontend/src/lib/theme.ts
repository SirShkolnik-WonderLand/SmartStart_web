export type Theme = 'wonderlight' | 'midnight'

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
  wonderlight: {
    name: 'wonderlight',
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
  }
}

export const defaultTheme: Theme = 'wonderlight'

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  localStorage.setItem('wonderland-theme', theme)
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return defaultTheme
  const stored = localStorage.getItem('wonderland-theme') as Theme
  return stored && themes[stored] ? stored : defaultTheme
}

export function toggleTheme(currentTheme: Theme): Theme {
  const newTheme = currentTheme === 'wonderlight' ? 'midnight' : 'wonderlight'
  applyTheme(newTheme)
  return newTheme
}

