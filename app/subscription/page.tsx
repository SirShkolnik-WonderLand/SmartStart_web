'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../services/api'

const SubscriptionPage = () => {
  const router = useRouter()
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const userData = await apiService.getCurrentUser()
      setUser(userData)
      
      const response = await fetch('https://smartstart-api.onrender.com/api/subscriptions/plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setPlans(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanSelection = async (planId: string) => {
    try {
      const userId = apiService.getCurrentUserId()
      if (!userId) {
        console.error('No user ID found')
        return
      }
      
      const response = await fetch('https://smartstart-api.onrender.com/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, planId })
      })
      
      const data = await response.json()
      if (data.success) {
        alert('Subscription updated successfully!')
        loadData() // Reload data
      } else {
        alert('Failed to update subscription')
      }
    } catch (error) {
      console.error('Plan selection error:', error)
      alert('Error updating subscription')
    }
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading subscription plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#00ff88' }}>
          Subscription Plans
        </h1>
        <p className="text-xl text-muted">
          Choose the plan that best fits your needs
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div key={plan.id} className="card">
            <div className="card-header">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-muted">{plan.description}</p>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2" style={{ color: '#00ff88' }}>
                  ${plan.price}
                </div>
                <div className="text-muted">
                  per {plan.interval?.toLowerCase() || 'month'}
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {plan.features?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="text-green-400">✓</div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <button 
                className="btn btn-primary w-full"
                onClick={() => handlePlanSelection(plan.id)}
              >
                {plan.isActive ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Back to Dashboard */}
      <div className="text-center">
        <button 
          className="btn btn-secondary"
          onClick={() => router.push('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default SubscriptionPage
