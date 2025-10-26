/**
 * DASHBOARD STORE
 * Global state management with Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '@shared/types';

interface DashboardState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Auth
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: AdminUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  
  // Date range filter
  dateRange: {
    startDate: string;
    endDate: string;
  };
  setDateRange: (startDate: string, endDate: string) => void;
  
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Real-time
  realtimeEnabled: boolean;
  toggleRealtime: () => void;
  
  // Preferences
  preferences: {
    autoRefresh: boolean;
    refreshInterval: number; // seconds
    showAnimations: boolean;
    compactMode: boolean;
  };
  updatePreferences: (preferences: Partial<DashboardState['preferences']>) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      
      // Auth
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set((state) => ({ 
        user, 
        isAuthenticated: !!user && !!state.token 
      })),
      setToken: (token) => set((state) => ({ 
        token, 
        isAuthenticated: !!state.user && !!token 
      })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      
      // Date range (default: last 7 days)
      dateRange: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
      setDateRange: (startDate, endDate) => set({ dateRange: { startDate, endDate } }),
      
      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Notifications
      notifications: [],
      addNotification: (type, message) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              id: Math.random().toString(36).substring(7),
              type,
              message,
              timestamp: new Date(),
            },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
      
      // Real-time
      realtimeEnabled: true,
      toggleRealtime: () => set((state) => ({ realtimeEnabled: !state.realtimeEnabled })),
      
      // Preferences
      preferences: {
        autoRefresh: true,
        refreshInterval: 30, // 30 seconds
        showAnimations: true,
        compactMode: false,
      },
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),
    }),
    {
      name: 'analytics-hub-storage',
      partialize: (state) => ({
        theme: state.theme,
        token: state.token,
        preferences: state.preferences,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
