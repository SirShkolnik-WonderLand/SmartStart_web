import { useState, useEffect } from 'react'

/**
 * Hook to ensure components only render on the client side
 * This prevents hydration mismatches between server and client
 */
export function useClientSide() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook to safely render dynamic content only on client side
 * @param defaultValue - The value to show during SSR
 * @param clientValue - The value to show on client side
 */
export function useClientSideValue<T>(defaultValue: T, clientValue: T): T {
  const isClient = useClientSide()
  return isClient ? clientValue : defaultValue
}
