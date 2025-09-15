'use client'

import { useEffect, useState } from 'react'
import { apiService, SubscriptionPlan, UserSubscription, Invoice } from '@/lib/api-unified'
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Star, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  Plus,
  Crown,
  Zap,
  Shield
} from 'lucide-react'

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'plans' | 'current' | 'billing'>('plans')

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true)
      
      const [plansResponse, subscriptionsResponse, invoicesResponse] = await Promise.all([
        apiService.getSubscriptionPlans(),
        apiService.getSubscriptions(),
        apiService.getInvoices()
      ])

      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data)
      }

      if (subscriptionsResponse.success && subscriptionsResponse.data) {
        setUserSubscriptions(subscriptionsResponse.data)
      }

      if (invoicesResponse.success && invoicesResponse.data) {
        setInvoices(invoicesResponse.data)
      }
      
    } catch (error) {
      console.error('Error loading subscription data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('pro')) return Crown
    if (planName.toLowerCase().includes('enterprise')) return Shield
    if (planName.toLowerCase().includes('basic')) return Star
    return Zap
  }

  const getPlanColor = (planName: string) => {
    if (planName.toLowerCase().includes('pro')) return 'from-purple-500 to-pink-500'
    if (planName.toLowerCase().includes('enterprise')) return 'from-blue-500 to-cyan-500'
    if (planName.toLowerCase().includes('basic')) return 'from-green-500 to-emerald-500'
    return 'from-gray-500 to-slate-500'
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { color: 'bg-success/20 text-success border-success/30', text: 'Active', icon: CheckCircle },
      INACTIVE: { color: 'bg-foreground-muted/20 text-foreground-muted border-foreground-muted/30', text: 'Inactive', icon: Clock },
      CANCELLED: { color: 'bg-error/20 text-error border-error/30', text: 'Cancelled', icon: AlertCircle },
      EXPIRED: { color: 'bg-warning/20 text-warning border-warning/30', text: 'Expired', icon: AlertCircle },
      SUSPENDED: { color: 'bg-warning/20 text-warning border-warning/30', text: 'Suspended', icon: AlertCircle }
    }
    const { color, text, icon: Icon } = config[status as keyof typeof config] || config.INACTIVE
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color} border`}>
        <Icon className="w-3 h-3" />
        {text}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wonderland-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Subscriptions</h1>
            <p className="text-xl text-foreground-muted mt-1">Manage your subscription plans and billing</p>
          </div>
          <button 
            onClick={loadSubscriptionData}
            className="wonder-button flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'plans', name: 'Available Plans', icon: Star },
            { id: 'current', name: 'Current Subscription', icon: CheckCircle },
            { id: 'billing', name: 'Billing History', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-foreground-muted hover:bg-glass-surface hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Available Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const Icon = getPlanIcon(plan.name)
                const gradient = getPlanColor(plan.name)
                
                return (
                  <div key={plan.id} className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {plan.isActive && (
                        <span className="px-2 py-1 bg-success/20 text-success text-xs font-medium rounded-full">
                          Available
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-foreground-muted mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-foreground">
                        {formatCurrency(plan.price, plan.currency)}
                      </div>
                      <div className="text-sm text-foreground-muted">
                        per {plan.interval.toLowerCase()}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-foreground-muted">
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <button className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r ${gradient} text-white hover:shadow-lg`}>
                      {userSubscriptions.some(sub => sub.planId === plan.id) ? 'Current Plan' : 'Subscribe'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Current Subscription Tab */}
        {activeTab === 'current' && (
          <div className="space-y-6">
            {userSubscriptions.length > 0 ? (
              userSubscriptions.map((subscription) => (
                <div key={subscription.id} className="glass rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{subscription.plan.name}</h3>
                        <p className="text-foreground-muted">{subscription.plan.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-glass-surface rounded-lg p-4">
                      <div className="text-sm text-foreground-muted mb-1">Price</div>
                      <div className="text-lg font-bold text-foreground">
                        {formatCurrency(subscription.plan.price, subscription.plan.currency)}
                      </div>
                      <div className="text-xs text-foreground-muted">
                        per {subscription.plan.interval.toLowerCase()}
                      </div>
                    </div>
                    
                    <div className="bg-glass-surface rounded-lg p-4">
                      <div className="text-sm text-foreground-muted mb-1">Start Date</div>
                      <div className="text-lg font-bold text-foreground">
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="bg-glass-surface rounded-lg p-4">
                      <div className="text-sm text-foreground-muted mb-1">Auto Renew</div>
                      <div className="text-lg font-bold text-foreground">
                        {subscription.autoRenew ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                  
                  {subscription.endDate && (
                    <div className="bg-glass-surface rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-foreground-muted">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {subscription.status === 'ACTIVE' ? 'Renews on' : 'Expires on'} {new Date(subscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <button className="wonder-button">
                      <Plus className="w-4 h-4" />
                      Upgrade Plan
                    </button>
                    {subscription.status === 'ACTIVE' && (
                      <button className="glass-button">
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass rounded-xl p-12 text-center">
                <CreditCard className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Active Subscriptions</h3>
                <p className="text-foreground-muted mb-6">
                  You don't have any active subscriptions. Choose a plan to get started.
                </p>
                <button 
                  onClick={() => setActiveTab('plans')}
                  className="wonder-button"
                >
                  <Star className="w-5 h-5 mr-2" />
                  View Available Plans
                </button>
              </div>
            )}
          </div>
        )}

        {/* Billing History Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {invoices.length > 0 ? (
              <div className="glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-glass-surface border-b border-glass-border">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Invoice</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Due Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-glass-surface transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-foreground">
                              #{invoice.id.slice(-8)}
                            </div>
                            <div className="text-sm text-foreground-muted">
                              {invoice.subscription?.planName || 'One-time payment'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-foreground">
                              {formatCurrency(invoice.amount, invoice.currency)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(invoice.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground-muted">
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-foreground-muted hover:text-primary hover:bg-glass-highlight rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                              </button>
                              {invoice.status === 'PENDING' && (
                                <button className="wonder-button text-sm px-3 py-1">
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="glass rounded-xl p-12 text-center">
                <CreditCard className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Billing History</h3>
                <p className="text-foreground-muted mb-6">
                  You don't have any invoices yet. Your billing history will appear here once you subscribe to a plan.
                </p>
                <button 
                  onClick={() => setActiveTab('plans')}
                  className="wonder-button"
                >
                  <Star className="w-5 h-5 mr-2" />
                  View Available Plans
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
