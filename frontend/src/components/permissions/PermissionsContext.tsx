"use client"

import React, { createContext, useContext, useMemo } from 'react'

type PermissionsContextValue = {
  permissions: string[]
  role: string
  can: (permission: string) => boolean
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(undefined)

type PermissionsProviderProps = {
  permissions?: string[] | null
  role?: string
  children: React.ReactNode
}

export function PermissionsProvider({ permissions, role, children }: PermissionsProviderProps) {
  const value = useMemo<PermissionsContextValue>(() => {
    const list = Array.isArray(permissions) ? permissions : []
    const roleName = role || ''
    const can = (permission: string) => list.includes(permission)
    return { permissions: list, role: roleName, can }
  }, [permissions, role])

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext)
  if (!ctx) {
    return { permissions: [], role: '', can: () => false }
  }
  return ctx
}


