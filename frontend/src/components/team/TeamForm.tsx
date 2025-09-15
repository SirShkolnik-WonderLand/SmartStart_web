'use client'

import { useState, useEffect } from 'react'
import { apiService, Team, User, Company, Venture } from '@/lib/api-unified'
import { Users, Target, UserPlus, Check, Building2 } from 'lucide-react'

interface TeamFormProps {
  onSuccess?: (team: Team) => void
  onCancel?: () => void
  initialData?: Partial<Team>
}

export function TeamForm({ onSuccess, onCancel, initialData }: TeamFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    companyId: initialData?.companyId || '',
    ventureId: initialData?.ventureId || '',
    leaderId: initialData?.leaderId || ''
  })
  
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [ventures, setVentures] = useState<Venture[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResponse, companiesResponse, venturesResponse] = await Promise.all([
          apiService.getUsers(),
          apiService.getCompanies(),
          apiService.getVentures()
        ])

        if (usersResponse.success && usersResponse.data) {
          setAvailableUsers(usersResponse.data)
        }
        if (companiesResponse.success && companiesResponse.data) {
          setCompanies(companiesResponse.data)
        }
        if (venturesResponse.success && venturesResponse.data) {
          setVentures(venturesResponse.data)
        }
      } catch (error) {
        console.error('Error loading form data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Team name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.leaderId) newErrors.leaderId = 'Team leader is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const response = await apiService.createTeam(formData)
      
      if (response.success && response.data) {
        onSuccess?.(response.data)
      } else {
        setErrors({ submit: 'Failed to create team. Please try again.' })
      }
    } catch (error) {
      console.error('Error creating team:', error)
      setErrors({ submit: 'An error occurred while creating the team.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-foreground-muted">Loading form data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {initialData ? 'Edit Team' : 'Create New Team'}
          </h2>
          <p className="text-foreground-muted">
            {initialData ? 'Update team information' : 'Build a new collaborative team'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Team Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Team Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                errors.name ? 'border-error' : 'border-border'
              }`}
              placeholder="Enter team name"
            />
            {errors.name && <p className="text-sm text-error mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                errors.description ? 'border-error' : 'border-border'
              }`}
              placeholder="Describe the team's purpose and goals..."
            />
            {errors.description && <p className="text-sm text-error mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Team Leader */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent" />
            Team Leadership
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Team Leader *
            </label>
            <select
              value={formData.leaderId}
              onChange={(e) => setFormData(prev => ({ ...prev, leaderId: e.target.value }))}
              className={`w-full px-3 py-2 bg-glass-surface border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground ${
                errors.leaderId ? 'border-error' : 'border-border'
              }`}
            >
              <option value="">Select team leader</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {errors.leaderId && <p className="text-sm text-error mt-1">{errors.leaderId}</p>}
          </div>
        </div>

        {/* Organization Context */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-highlight" />
            Organization Context
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company (Optional)
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              >
                <option value="">Select company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Venture (Optional)
              </label>
              <select
                value={formData.ventureId}
                onChange={(e) => setFormData(prev => ({ ...prev, ventureId: e.target.value }))}
                className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              >
                <option value="">Select venture</option>
                {ventures.map(venture => (
                  <option key={venture.id} value={venture.id}>
                    {venture.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Team Goals Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-success" />
            Next Steps
          </h3>
          
          <div className="p-4 bg-glass-surface rounded-lg border border-border">
            <p className="text-sm text-foreground-muted mb-2">
              After creating the team, you&apos;ll be able to:
            </p>
            <ul className="space-y-1 text-sm text-foreground-body">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Add team members and assign roles
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Set team goals and track progress
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Monitor team performance metrics
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Enable collaboration tools and communication
              </li>
            </ul>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-border rounded-lg hover:bg-glass-surface transition-colors text-foreground"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="wonder-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {initialData ? 'Update Team' : 'Create Team'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
