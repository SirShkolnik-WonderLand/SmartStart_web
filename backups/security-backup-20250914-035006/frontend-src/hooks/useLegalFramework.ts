/**
 * Legal Framework React Hook
 * Provides easy integration with the legal framework for components
 */

import { useState, useEffect, useCallback } from 'react'
import { legalFrameworkService, ActionPermission, DocumentCompliance } from '@/lib/legal-framework'

interface UseLegalFrameworkOptions {
  action?: string
  context?: Record<string, unknown>
  autoCheck?: boolean
}

interface UseLegalFrameworkReturn {
  // State
  isLoading: boolean
  error: string | null
  permission: ActionPermission | null
  compliance: DocumentCompliance | null
  
  // Actions
  checkPermission: (action: string, context?: Record<string, unknown>) => Promise<ActionPermission>
  checkCompliance: (userId: string, rbacLevel: string) => Promise<DocumentCompliance>
  canPerformAction: (action: string, context?: Record<string, unknown>) => boolean
  
  // Utilities
  getRequiredDocuments: (action: string) => string[]
  getMissingDocuments: (action: string) => string[]
  needsSigning: (action: string) => boolean
}

export function useLegalFramework(options: UseLegalFrameworkOptions = {}): UseLegalFrameworkReturn {
  const { action, context, autoCheck = true } = options
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permission, setPermission] = useState<ActionPermission | null>(null)
  const [compliance, setCompliance] = useState<DocumentCompliance | null>(null)

  const checkPermission = useCallback(async (actionToCheck: string, contextToCheck?: Record<string, unknown>): Promise<ActionPermission> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await legalFrameworkService.canPerformAction(actionToCheck, contextToCheck || context)
      setPermission(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [context])

  const checkCompliance = useCallback(async (userId: string, rbacLevel: string): Promise<DocumentCompliance> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await legalFrameworkService.checkCompliance(userId, rbacLevel)
      setCompliance(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const canPerformAction = useCallback((actionToCheck: string, contextToCheck?: Record<string, unknown>): boolean => {
    if (!permission || permission.requiredDocuments.length === 0) {
      return false
    }
    
    // Check if this is the same action we have permission for
    if (actionToCheck === action && JSON.stringify(contextToCheck || {}) === JSON.stringify(context || {})) {
      return permission.allowed
    }
    
    return false
  }, [permission, action, context])

  const getRequiredDocuments = useCallback((actionToCheck: string): string[] => {
    if (permission && actionToCheck === action) {
      return permission.requiredDocuments
    }
    return []
  }, [permission, action])

  const getMissingDocuments = useCallback((actionToCheck: string): string[] => {
    if (permission && actionToCheck === action) {
      return permission.missingDocuments
    }
    return []
  }, [permission, action])

  const needsSigning = useCallback((actionToCheck: string): boolean => {
    if (permission && actionToCheck === action) {
      return !permission.allowed && permission.missingDocuments.length > 0
    }
    return false
  }, [permission, action])

  // Auto-check permission when action or context changes
  useEffect(() => {
    if (autoCheck && action) {
      checkPermission(action, context).catch(console.error)
    }
  }, [action, context, autoCheck, checkPermission])

  return {
    // State
    isLoading,
    error,
    permission,
    compliance,
    
    // Actions
    checkPermission,
    checkCompliance,
    canPerformAction,
    
    // Utilities
    getRequiredDocuments,
    getMissingDocuments,
    needsSigning
  }
}

/**
 * Hook for checking specific action permissions
 */
export function useActionPermission(action: string, context?: Record<string, unknown>) {
  return useLegalFramework({ action, context, autoCheck: true })
}

/**
 * Hook for checking user compliance
 */
export function useUserCompliance(userId: string, rbacLevel: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compliance, setCompliance] = useState<DocumentCompliance | null>(null)

  const checkCompliance = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await legalFrameworkService.checkCompliance(userId, rbacLevel)
      setCompliance(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId, rbacLevel])

  useEffect(() => {
    if (userId && rbacLevel) {
      checkCompliance().catch(console.error)
    }
  }, [userId, rbacLevel, checkCompliance])

  return {
    isLoading,
    error,
    compliance,
    checkCompliance,
    isCompliant: compliance?.compliant ?? false,
    missingDocuments: compliance?.missingDocuments ?? [],
    requiredDocuments: compliance?.requiredDocuments ?? []
  }
}

/**
 * Hook for document signing workflow
 */
export function useDocumentSigning() {
  const [isSigning, setIsSigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signedDocuments, setSignedDocuments] = useState<string[]>([])

  const signDocuments = useCallback(async (action: string, context?: Record<string, unknown>) => {
    setIsSigning(true)
    setError(null)
    setSignedDocuments([])
    
    try {
      const result = await legalFrameworkService.completeSigningWorkflow(action, context)
      
      if (result.success) {
        setSignedDocuments(result.signedDocuments)
      } else {
        setError(result.errors.join(', '))
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setIsSigning(false)
    }
  }, [])

  return {
    isSigning,
    error,
    signedDocuments,
    signDocuments
  }
}

/**
 * Hook for security tier requirements
 */
export function useSecurityTier(tier: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requirements, setRequirements] = useState<{
    tier: string
    name: string
    description: string
    documents: string[]
    securityControls: string[]
  } | null>(null)

  const loadRequirements = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await legalFrameworkService.getSecurityTierRequirements(tier)
      setRequirements(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [tier])

  useEffect(() => {
    if (tier) {
      loadRequirements().catch(console.error)
    }
  }, [tier, loadRequirements])

  return {
    isLoading,
    error,
    requirements,
    loadRequirements,
    documents: requirements?.documents ?? [],
    securityControls: requirements?.securityControls ?? []
  }
}
