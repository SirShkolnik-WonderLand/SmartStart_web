'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../../services/api'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  period: string
  features: string[]
  limitations: string[]
  popular?: boolean
  color: string
  icon: string
}

const ChoosePlans = () => {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const resp = await fetch('https://smartstart-api.onrender.com/api/subscriptions/plans')
        const data = await resp.json()
        if (Array.isArray(data?.plans)) {
          const mapped: Plan[] = data.plans.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: p.price,
            period: p.period || 'month',
            features: p.features || [],
            limitations: p.limitations || [],
            icon: p.icon || '💳',
            color: 'var(--accent-primary)',
            popular: p.popular || false
          }))
          setPlans(mapped)
        } else {
          setPlans([])
        }
      } catch (e) {
        setPlans([])
      } finally {
        setLoadingPlans(false)
      }
    }
    loadPlans()
  }, [])

  const handlePlanSelection = async (planId: string) => {
    setSelectedPlan(planId)
    setIsProcessing(true)
    try {
      const resp = await apiService.fetchWithAuth('/api/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({ planId })
      } as any)
      if (resp?.success) {
        router.push('/venture-gate/legal')
      } else {
        setIsProcessing(false)
      }
    } catch (e) {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
      {/* Compact Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="text-3xl">💳</div>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Choose Your Plan</h1>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Select the plan that best fits your needs</p>
          </div>
        </div>
      </div>

      {/* Compact Pricing Cards */}
      <div className="grid grid-3 gap-4 mb-6" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {loadingPlans && (
          <div className="card">
            <div className="text-center p-4">Loading plans…</div>
          </div>
        )}
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card ${plan.popular ? 'border-accent' : ''} ${
              selectedPlan === plan.id ? 'border-accent' : ''
            }`}
            style={{
              borderColor: plan.popular ? 'var(--accent-primary)' : undefined,
              position: 'relative',
              cursor: 'pointer',
              transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div 
                className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                style={{
                  background: 'var(--accent-primary)',
                  color: 'var(--bg-primary)',
                  padding: '2px 12px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Popular
              </div>
            )}

            <div className="text-center p-4">
              <div className="text-2xl mb-2">{plan.icon}</div>
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className="text-secondary text-sm mb-3">{plan.description}</p>
              
              <div className="mb-4">
                <div className="text-2xl font-bold mb-1" style={{ color: plan.color }}>
                  ${plan.price}
                </div>
                <div className="text-muted text-xs">per {plan.period}</div>
              </div>

              <div className="mb-4">
                <ul className="text-xs text-secondary text-left">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="mb-1 flex items-start">
                      <span className="text-accent-primary mr-2 text-xs">✓</span>
                      <span className="text-xs">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-muted text-xs">+{plan.features.length - 3} more features</li>
                  )}
                </ul>
              </div>

              <button
                className={`btn w-full text-sm ${
                  plan.popular ? 'btn-primary' : 'btn-secondary'
                }`}
                onClick={() => handlePlanSelection(plan.id)}
                disabled={isProcessing}
                style={{ padding: '8px 16px' }}
              >
                {isProcessing && selectedPlan === plan.id ? 'Processing...' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Processing */}
      {isProcessing && (
        <div className="card animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="text-center p-4">
            <div className="animate-pulse mb-3">
              <div className="text-2xl mb-2">💳</div>
              <h3 style={{ fontSize: '1.1rem' }}>Processing Payment</h3>
              <p className="text-secondary text-sm">
                Setting up your subscription...
              </p>
            </div>
            <div className="progress" style={{ height: '4px' }}>
              <div className="progress-bar" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Compact Guarantee */}
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="text-center p-4">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>🛡️ 30-Day Money Back Guarantee</h3>
          <p className="text-muted text-sm mb-3">
            Not satisfied? Get a full refund within 30 days, no questions asked.
          </p>
          <div className="flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-1">
              <div className="text-accent-primary">💳</div>
              <div>Secure</div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-accent-primary">🔄</div>
              <div>Easy Cancel</div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-accent-primary">💰</div>
              <div>Full Refund</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChoosePlans
