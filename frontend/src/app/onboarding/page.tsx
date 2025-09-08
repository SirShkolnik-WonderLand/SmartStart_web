'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import OnboardingFlow from '@/components/OnboardingFlow'
import { Header } from '@/components/layout/header'
import { Loader2 } from 'lucide-react'

function OnboardingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [initialStep, setInitialStep] = useState<number | null>(null)

  useEffect(() => {
    // Get step parameter from URL
    const stepParam = searchParams.get('step')
    if (stepParam) {
      const step = parseInt(stepParam, 10)
      if (!isNaN(step) && step >= 0 && step <= 4) {
        setInitialStep(step)
        console.log('Starting onboarding at step from URL:', step)
      }
    }

    // Get userId from JWT token (primary) or localStorage (fallback)
    const token = localStorage.getItem('auth-token')
    const storedUser = localStorage.getItem('user')
    
    if (token) {
      try {
        // Extract user ID from JWT token (primary method)
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload))
        const userIdFromToken = decoded.userId || decoded.id
        
        if (userIdFromToken) {
          setUserId(userIdFromToken)
          setIsLoading(false)
          return
        }
      } catch (tokenError) {
        console.warn('Error decoding JWT token:', tokenError)
      }
    }
    
    // Fallback to localStorage user data
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUserId(userData.id)
        setIsLoading(false)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        router.push('/auth/register')
      }
    } else {
      // No user data found, redirect to registration
      router.push('/auth/register')
    }
  }, [router, searchParams])

  const handleOnboardingComplete = () => {
    // Redirect to dashboard after onboarding completion (with hard fallback)
    try {
      router.push('/dashboard')
      setTimeout(() => {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard')) {
          window.location.href = '/dashboard'
        }
      }, 400)
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard'
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground-muted">Loading your onboarding journey...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-foreground-muted">No user found. Redirecting to registration...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <OnboardingFlow 
        userId={userId} 
        onComplete={handleOnboardingComplete}
        initialStep={initialStep}
      />
    </>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground-muted">Loading your onboarding journey...</p>
        </div>
      </div>
    }>
      <OnboardingPageContent />
    </Suspense>
  )
}
