'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingFlow from '@/components/OnboardingFlow'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get userId from authenticated user (JWT token) or localStorage
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('auth-token')
    
    if (token && storedUser) {
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
  }, [router])

  const handleOnboardingComplete = () => {
    // Redirect to dashboard after onboarding completion
    router.push('/dashboard')
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
    <OnboardingFlow 
      userId={userId} 
      onComplete={handleOnboardingComplete}
    />
  )
}
