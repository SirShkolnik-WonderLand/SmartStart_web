import { create } from 'zustand'

export interface UIState {
  // Navigation
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  
  // Modals and overlays
  activeModal: string | null
  activeSheet: string | null
  
  // Notifications
  notifications: Notification[]
  
  // Loading states
  globalLoading: boolean
  pageLoading: boolean
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  openSheet: (sheetId: string) => void
  closeSheet: () => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setGlobalLoading: (loading: boolean) => void
  setPageLoading: (loading: boolean) => void
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  // Navigation
  sidebarOpen: false,
  mobileMenuOpen: false,
  
  // Modals and overlays
  activeModal: null,
  activeSheet: null,
  
  // Notifications
  notifications: [],
  
  // Loading states
  globalLoading: false,
  pageLoading: false,
  
  // Actions
  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open })
  },
  
  setMobileMenuOpen: (open: boolean) => {
    set({ mobileMenuOpen: open })
  },
  
  openModal: (modalId: string) => {
    set({ activeModal: modalId })
  },
  
  closeModal: () => {
    set({ activeModal: null })
  },
  
  openSheet: (sheetId: string) => {
    set({ activeSheet: sheetId })
  },
  
  closeSheet: () => {
    set({ activeSheet: null })
  },
  
  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      duration: 4000,
      ...notification
    }
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }))
    
    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id)
      }, newNotification.duration)
    }
  },
  
  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },
  
  clearNotifications: () => {
    set({ notifications: [] })
  },
  
  setGlobalLoading: (loading: boolean) => {
    set({ globalLoading: loading })
  },
  
  setPageLoading: (loading: boolean) => {
    set({ pageLoading: loading })
  }
}))

