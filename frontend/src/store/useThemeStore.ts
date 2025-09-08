import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme, themes, defaultTheme, applyTheme, toggleTheme } from '@/lib/theme'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initializeTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: defaultTheme,
      
      setTheme: (theme: Theme) => {
        applyTheme(theme)
        set({ theme })
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = toggleTheme(currentTheme)
        set({ theme: newTheme })
      },
      
      initializeTheme: () => {
        if (typeof window === 'undefined') return
        
        const stored = localStorage.getItem('wonderland-theme') as Theme
        const theme = stored && themes[stored] ? stored : defaultTheme
        applyTheme(theme)
        set({ theme })
      }
    }),
    {
      name: 'wonderland-theme',
      partialize: (state) => ({ theme: state.theme })
    }
  )
)

