'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { apiService } from '../services/api'

interface JourneyGuardProps {
  children: React.ReactNode
}

export default function JourneyGuard({ children }: JourneyGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isJourneyComplete, setIsJourneyComplete] = useState(false)

  // Pages that don't require journey completion
  const journeyPages = [
    '/',
    '/register',
    '/venture-gate',
    '/venture-gate/explore',
    '/venture-gate/verify',
    '/venture-gate/plans',
    '/venture-gate/legal',
    '/venture-gate/profile',
    '/venture-gate/help',
    '/documents',
    '/documents/soba/new',
    '/documents/puoha/new'
  ]

  // Check if current path is a journey page
  const isJourneyPage = journeyPages.some(page => pathname.startsWith(page))

  useEffect(() => {
    const checkJourneyStatus = async () => {
      try {
        // Get user ID
        const storedId = typeof window !== 'undefined' ? localStorage.getItem('user-id') : null
        if (!storedId) {
          setIsChecking(false)
          return
        }

        // Get journey state
        const journeyState = await apiService.getJourneyState(storedId)
        
        if (journeyState) {
          // Check if journey is complete (all 11 stages done)
          const isComplete = journeyState.progress === 100 && journeyState.currentStage >= 10
          setIsJourneyComplete(isComplete)

          // If journey is not complete and user is not on a journey page, redirect to journey
          if (!isComplete && !isJourneyPage) {
            console.log('Journey not complete, redirecting to venture-gate')
            router.push('/venture-gate')
            return
          }
        } else {
          // No journey state found, redirect to journey
          if (!isJourneyPage) {
            console.log('No journey state found, redirecting to venture-gate')
            router.push('/venture-gate')
            return
          }
        }
      } catch (error) {
        console.error('Error checking journey status:', error)
        // On error, allow access but log the issue
      } finally {
        setIsChecking(false)
      }
    }

    checkJourneyStatus()
  }, [pathname, router, isJourneyPage])

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="container" style={{ paddingTop: '4rem' }}>
        <div className="text-center">
          <div className="animate-pulse">
            <h1>Checking your journey status...</h1>
            <p>Please wait while we verify your progress</p>
          </div>
        </div>
      </div>
    )
  }

  // If journey is complete or user is on a journey page, show the content
  if (isJourneyComplete || isJourneyPage) {
    return <>{children}</>
  }

  // If journey is not complete and user is not on a journey page, show redirect message
  return (
    <div className="container" style={{ paddingTop: '4rem' }}>
      <div className="text-center">
        <div className="animate-pulse">
          <h1>Redirecting to your journey...</h1>
          <p>Please complete your onboarding to access this page</p>
        </div>
      </div>
    </div>
  )
}
