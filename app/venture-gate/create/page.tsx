'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../services/api'

interface VentureFormData {
  name: string
  purpose: string
  region: string
  description: string
  industry: string
  targetMarket: string
  businessModel: string
}

const CreateVenture = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<VentureFormData>({
    name: '',
    purpose: '',
    region: 'US',
    description: '',
    industry: '',
    targetMarket: '',
    businessModel: ''
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Failed to load user:', error)
        router.push('/')
      }
    }
    loadUser()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch('https://smartstart-api.onrender.com/api/ventures/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          ownerUserId: user.id
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Complete the platform orientation step
        await apiService.updateJourneyState('stage_5', 'COMPLETED')
        router.push('/venture-gate/welcome')
      } else {
        alert(`Failed to create venture: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to create venture:', error)
      alert('Failed to create venture. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#00ff88' }}>
          Create Your Venture
        </h1>
        <p className="text-xl text-muted mb-6">
          Let's build something amazing together
        </p>
      </div>

      {/* Venture Creation Form */}
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h2 className="text-2xl font-bold">Venture Details</h2>
          <p className="text-muted">Tell us about your venture idea</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2">Venture Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter your venture name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Industry *</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="input w-full"
                required
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Purpose & Mission *</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              className="input w-full"
              rows={3}
              placeholder="What problem does your venture solve? What's your mission?"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input w-full"
              rows={4}
              placeholder="Provide more details about your venture, your vision, and what makes it unique"
            />
          </div>

          <div className="grid grid-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2">Target Market</label>
              <input
                type="text"
                name="targetMarket"
                value={formData.targetMarket}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Who are your customers?"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Business Model</label>
              <select
                name="businessModel"
                value={formData.businessModel}
                onChange={handleInputChange}
                className="input w-full"
              >
                <option value="">Select Business Model</option>
                <option value="B2B">B2B (Business to Business)</option>
                <option value="B2C">B2C (Business to Consumer)</option>
                <option value="B2B2C">B2B2C (Business to Business to Consumer)</option>
                <option value="Marketplace">Marketplace</option>
                <option value="Subscription">Subscription</option>
                <option value="Freemium">Freemium</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Region *</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="input w-full"
              required
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="EU">European Union</option>
              <option value="AU">Australia</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push('/venture-gate/explore')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Venture...' : 'Create Venture'}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="card mt-8" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h3 className="text-xl font-bold">💡 Need Help?</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-2 gap-6">
            <div>
              <h4 className="font-bold mb-2">Venture Creation Tips</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• Choose a clear, memorable name</li>
                <li>• Define your target market clearly</li>
                <li>• Explain the problem you're solving</li>
                <li>• Be specific about your value proposition</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">What Happens Next?</h4>
              <ul className="text-sm text-muted space-y-1">
                <li>• Your venture will be created</li>
                <li>• You'll get access to team building tools</li>
                <li>• You can start inviting collaborators</li>
                <li>• Begin planning your first projects</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateVenture
