'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiService, Venture, User } from '@/lib/api-unified'
import { ArrowLeft, Building2, Users, TrendingUp, Briefcase, CheckCircle, AlertCircle, Save } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useActionPermission } from '@/hooks/useLegalFramework'

export default function EditVenturePage() {
  const params = useParams()
  const router = useRouter()
  const [venture, setVenture] = useState<Venture | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const ventureId = params.id as string

  // Legal framework integration
  const editPermission = useActionPermission('EDIT_VENTURE', { ventureId })

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    stage: 'idea' as 'idea' | 'mvp' | 'growth' | 'scale',
    teamSize: 0,
    lookingFor: [] as string[],
    rewardsType: 'equity' as 'equity' | 'cash' | 'hybrid',
    rewardsAmount: '',
    tags: [] as string[],
    residency: 'US'
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load venture and current user in parallel
        const [ventureResponse, userResponse] = await Promise.all([
          apiService.getVenture(ventureId),
          apiService.getCurrentUser()
        ])
        
        if (ventureResponse.success && ventureResponse.data) {
          const ventureData = ventureResponse.data
          setVenture(ventureData)
          
          // Populate form with existing data
          setFormData({
            name: ventureData.name || '',
            description: ventureData.ventureProfile?.description || ventureData.description || '',
            industry: ventureData.ventureProfile?.industry || ventureData.industry || '',
            stage: (ventureData.ventureProfile?.stage || ventureData.stage || 'idea') as 'idea' | 'mvp' | 'growth' | 'scale',
            teamSize: ventureData.ventureProfile?.teamSize || ventureData.teamSize || 0,
            lookingFor: ventureData.lookingFor || [],
            rewardsType: (ventureData.rewards?.type || 'equity') as 'equity' | 'cash' | 'hybrid',
            rewardsAmount: ventureData.rewards?.amount || '',
            tags: ventureData.tags || [],
            residency: ventureData.residency || ventureData.region || 'US'
          })
        } else {
          setError(ventureResponse.error || 'Failed to load venture')
        }
        
        if (userResponse.success && userResponse.data) {
          setCurrentUser(userResponse.data)
        }
      } catch (err) {
        setError('Failed to load data')
        console.error('Error loading data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (ventureId) {
      loadData()
    }
  }, [ventureId])

  const isOwner = currentUser && venture && currentUser.id === venture.owner?.id
  const isAuthenticated = !!currentUser
  const isVentureLoaded = !!venture
  const canEdit = editPermission.canPerformAction('EDIT_VENTURE', { ventureId }) || isOwner

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field: 'lookingFor' | 'tags', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData(prev => ({
      ...prev,
      [field]: items
    }))
  }

  const handleSave = async () => {
    if (!venture) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const ventureUpdateData = {
        name: formData.name,
        description: formData.description,
        industry: formData.industry,
        stage: formData.stage,
        teamSize: formData.teamSize,
        lookingFor: formData.lookingFor,
        rewards: {
          type: formData.rewardsType,
          amount: formData.rewardsAmount
        },
        tags: formData.tags,
        residency: formData.residency
      }
      
      const response = await apiService.updateVenture(ventureId, ventureUpdateData)
      
      if (response.success && response.data) {
        setSuccess('Venture updated successfully!')
        setVenture(response.data)
        
        // Redirect to venture detail page after a short delay
        setTimeout(() => {
          router.push(`/ventures/${ventureId}`)
        }, 1500)
      } else {
        setError(response.error || 'Failed to update venture')
      }
    } catch (err) {
      setError('Failed to update venture')
      console.error('Error updating venture:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading venture...</p>
        </div>
      </div>
    )
  }

  if (error && !venture) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Venture Not Found</h2>
          <p className="text-foreground-muted mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => router.back()}
              className="wonder-button-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
            <Link href="/ventures" className="wonder-button">
              <Briefcase className="w-4 h-4 mr-2" />
              All Ventures
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show access denied only if user is authenticated, venture is loaded, but user cannot edit
  if (isAuthenticated && isVentureLoaded && !canEdit) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-foreground-muted mb-6">Only the venture owner can edit this venture.</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => router.back()}
              className="wonder-button-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
            <Link href={`/ventures/${ventureId}`} className="wonder-button">
              <Briefcase className="w-4 h-4 mr-2" />
              View Venture
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen wonderland-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button - Above everything */}
          <div className="mb-4">
            <button 
              onClick={() => router.back()}
              className="wonder-button-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-foreground">Edit Venture</h1>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="wonder-button flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 mb-6 bg-green-500/10 border-green-500/20"
          >
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{success}</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 mb-6 bg-red-500/10 border-red-500/20"
          >
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Edit Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Venture Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-lg bg-glass-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter venture name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-glass-border rounded-lg bg-glass-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe your venture..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-glass-border rounded-lg bg-glass-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., Technology"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-2">
                      Stage
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => handleInputChange('stage', e.target.value)}
                      className="w-full px-3 py-2 border border-glass-border rounded-lg bg-glass-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select stage</option>
                      <option value="idea">Idea</option>
                      <option value="mvp">MVP</option>
                      <option value="early-stage">Early Stage</option>
                      <option value="growth">Growth</option>
                      <option value="scale">Scale</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Team Size
                  </label>
                  <input
                    type="number"
                    value={formData.teamSize}
                    onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-glass-border rounded-lg bg-glass-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 5"
                    min="0"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Team & Roles
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Looking For (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.lookingFor.join(', ')}
                    onChange={(e) => handleArrayChange('lookingFor', e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-lg bg-glass-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Developer, Designer, Marketer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Reward Type
                  </label>
                  <select
                    value={formData.rewardsType}
                    onChange={(e) => handleInputChange('rewardsType', e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-lg bg-glass-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="equity">Equity</option>
                    <option value="cash">Cash</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Reward Amount
                  </label>
                  <input
                    type="text"
                    value={formData.rewardsAmount}
                    onChange={(e) => handleInputChange('rewardsAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-lg bg-glass-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 5% equity or $50,000"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-highlight" />
                Additional Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleArrayChange('tags', e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-lg bg-glass-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., AI, SaaS, B2B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Region
                  </label>
                  <select
                    value={formData.residency}
                    onChange={(e) => handleInputChange('residency', e.target.value)}
                    className="w-full px-3 py-2 border border-glass-border rounded-lg bg-glass-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="US">United States</option>
                    <option value="EU">Europe</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="Global">Global</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Save Button for Mobile */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:hidden"
            >
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full wonder-button flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
