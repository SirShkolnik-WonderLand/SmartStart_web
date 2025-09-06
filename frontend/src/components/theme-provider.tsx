'use client'

import { createContext, useContext, useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'
import { Theme } from '@/lib/theme'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: 'wonderlight',
  setTheme: () => null,
  toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const { theme, setTheme, toggleTheme, initializeTheme } = useThemeStore()

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  const value = {
    theme,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}

