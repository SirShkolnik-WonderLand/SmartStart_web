'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

  const plans: Plan[] = [
    {
      id: 'member',
      name: 'Member',
      description: 'Perfect for contributors looking to join projects',
      price: 29,
      period: 'month',
      icon: '👤',
      color: 'var(--accent-secondary)',
      features: [
        'Submit contribution offers',
        'Access to project briefs',
        'Basic profile features',
        'Community access',
        'Email support'
      ],
      limitations: [
        'Cannot create ventures',
        'Limited project access',
        'Basic analytics'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For active contributors and small teams',
      price: 79,
      period: 'month',
      icon: '🚀',
      color: 'var(--accent-primary)',
      popular: true,
      features: [
        'Everything in Member',
        'Create up to 3 ventures',
        'Advanced project access',
        'Priority support',
        'Advanced analytics',
        'Team collaboration tools',
        'Custom integrations'
      ],
      limitations: [
        'Limited to 3 ventures',
        'Standard SLA'
      ]
    },
    {
      id: 'founder',
      name: 'Founder',
      description: 'For serious entrepreneurs and growing companies',
      price: 199,
      period: 'month',
      icon: '👑',
      color: 'var(--accent-warning)',
      features: [
        'Everything in Pro',
        'Unlimited ventures',
        'Full platform access',
        'White-label options',
        'Dedicated support',
        'Custom legal templates',
        'Advanced security features',
        'API access',
        'Custom integrations'
      ],
      limitations: []
    }
  ]

  const handlePlanSelection = async (planId: string) => {
    setSelectedPlan(planId)
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      // Navigate to next stage
      router.push('/venture-gate/legal')
    }, 3000)
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1>Choose Your Plan</h1>
        <p className="text-secondary">
          Select the plan that best fits your needs and unlock platform features
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-3 gap-6 mb-8">
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
              transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                style={{
                  background: 'var(--accent-primary)',
                  color: 'var(--bg-primary)',
                  padding: '4px 16px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Most Popular
              </div>
            )}

            <div className="text-center">
              <div className="text-4xl mb-4">{plan.icon}</div>
              <h3 className="card-title">{plan.name}</h3>
              <p className="text-secondary mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <div className="text-4xl font-bold mb-2" style={{ color: plan.color }}>
                  ${plan.price}
                </div>
                <div className="text-muted">per {plan.period}</div>
              </div>

              <div className="mb-6">
                <h4 className="mb-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Features:
                </h4>
                <ul className="text-sm text-secondary text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="mb-2 flex items-start">
                      <span className="text-accent-primary mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Limitations:
                  </h4>
                  <ul className="text-sm text-muted text-left">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="mb-2 flex items-start">
                        <span className="text-accent-warning mr-2">•</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className={`btn w-full ${
                  plan.popular ? 'btn-primary' : 'btn-secondary'
                }`}
                onClick={() => handlePlanSelection(plan.id)}
                disabled={isProcessing}
              >
                {isProcessing && selectedPlan === plan.id ? 'Processing...' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Processing */}
      {isProcessing && (
        <div className="card animate-fade-in">
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <div className="text-4xl mb-4">💳</div>
              <h3>Processing Payment</h3>
              <p className="text-secondary">
                Setting up your subscription and preparing your account...
              </p>
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Plan Comparison */}
      <div className="card animate-slide-in">
        <div className="card-header">
          <h3>Plan Comparison</h3>
          <p className="text-muted">
            Compare features across all plans to make the right choice
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <th className="text-left p-4">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center p-4">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <td className="p-4">Submit Offers</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4">
                    <span className="text-accent-primary">✓</span>
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <td className="p-4">Create Ventures</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.id === 'member' ? (
                      <span className="text-muted">✗</span>
                    ) : (
                      <span className="text-accent-primary">✓</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <td className="p-4">Advanced Analytics</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.id === 'member' ? (
                      <span className="text-muted">✗</span>
                    ) : (
                      <span className="text-accent-primary">✓</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <td className="p-4">API Access</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.id === 'founder' ? (
                      <span className="text-accent-primary">✓</span>
                    ) : (
                      <span className="text-muted">✗</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4">Support Level</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4">
                    <span className="text-sm">
                      {plan.id === 'member' ? 'Email' :
                       plan.id === 'pro' ? 'Priority' : 'Dedicated'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div className="card mt-8 animate-fade-in">
        <div className="text-center">
          <h3>🛡️ 30-Day Money Back Guarantee</h3>
          <p className="text-muted mb-4">
            Not satisfied? Get a full refund within 30 days, no questions asked.
          </p>
          <div className="grid grid-3 gap-4 text-sm">
            <div>
              <div className="text-accent-primary mb-1">💳</div>
              <div>Secure Payments</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">🔄</div>
              <div>Easy Cancellation</div>
            </div>
            <div>
              <div className="text-accent-primary mb-1">💰</div>
              <div>Full Refund</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChoosePlans
