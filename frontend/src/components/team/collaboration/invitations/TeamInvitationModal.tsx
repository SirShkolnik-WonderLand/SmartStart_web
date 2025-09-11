'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Mail, Crown, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { comprehensiveApiService as apiService, User, Team, Venture } from '@/lib/api-comprehensive'
import { TeamInvitation, TeamRole } from '../types/team-collaboration.types'
import { TEAM_ROLES, INVITATION_STATUSES } from '../constants/team-constants'

interface TeamInvitationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (invitation: TeamInvitation) => void
  teamId: string
  ventureId?: string
}

export default function TeamInvitationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  teamId, 
  ventureId 
}: TeamInvitationModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    role: 'member' as string,
    message: '',
    expiresIn: '7' // days
  })
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [ventures, setVentures] = useState<Venture[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      const [usersResponse, teamsResponse, venturesResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getTeams(),
        apiService.getVentures()
      ])

      if (usersResponse.success && usersResponse.data) {
        setAvailableUsers(usersResponse.data)
      }
      if (teamsResponse.success && teamsResponse.data) {
        setTeams(teamsResponse.data)
      }
      if (venturesResponse.success && venturesResponse.data) {
        setVentures(venturesResponse.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const filteredUsers = availableUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {}
    
    if (stepNumber === 1) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email'
      }
    }
    
    if (stepNumber === 2) {
      if (!formData.role) {
        newErrors.role = 'Please select a role'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrev = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return

    setIsSubmitting(true)
    try {
      const invitationData = {
        teamId,
        ventureId,
        email: formData.email,
        role: formData.role,
        message: formData.message,
        expiresIn: parseInt(formData.expiresIn)
      }

      // This would call the actual API
      // const response = await apiService.inviteTeamMember(invitationData)
      
      // Mock success for now
      const mockInvitation: TeamInvitation = {
        id: `inv_${Date.now()}`,
        teamId,
        ventureId,
        invitedUserId: 'user_123',
        invitedByUserId: 'current_user',
        role: TEAM_ROLES.find(r => r.id === formData.role)!,
        permissions: [],
        status: 'pending',
        message: formData.message,
        expiresAt: new Date(Date.now() + parseInt(formData.expiresIn) * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      onSuccess(mockInvitation)
      onClose()
    } catch (error) {
      console.error('Error sending invitation:', error)
      setErrors({ submit: 'Failed to send invitation' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Invite Team Member</h2>
              <p className="text-white/80 mt-1">Add new members to your team</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-white text-primary'
                      : 'bg-white/20 text-white/60'
                  }`}
                >
                  {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      step > stepNumber ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Who would you like to invite?</h3>
                  <p className="text-foreground-muted">Enter the email address of the person you want to invite</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="colleague@example.com"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      errors.email 
                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                        : 'border-gray-200 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* User Search Results */}
                {searchTerm && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Search Results</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => setFormData({ ...formData, email: user.email })}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-foreground-muted">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">What role should they have?</h3>
                  <p className="text-foreground-muted">Choose the appropriate role and permissions</p>
                </div>

                <div className="space-y-3">
                  {TEAM_ROLES.map((role) => (
                    <label
                      key={role.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.role === role.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.id}
                        checked={formData.role === role.id}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{role.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{role.name}</div>
                          <div className="text-sm text-foreground-muted">{role.description}</div>
                          <div className="text-xs text-foreground-muted mt-1">
                            Level {role.level} • {role.permissions.length} permissions
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${role.color}`}>
                          {role.level}/10
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role}</p>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Personalize the invitation</h3>
                  <p className="text-foreground-muted">Add a personal message and set expiration</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Personal Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Hi! I'd love for you to join our team..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Invitation Expires In
                  </label>
                  <select
                    value={formData.expiresIn}
                    onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Invitation Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Email:</span>
                      <span className="text-foreground">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Role:</span>
                      <span className="text-foreground">
                        {TEAM_ROLES.find(r => r.id === formData.role)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Expires:</span>
                      <span className="text-foreground">{formData.expiresIn} days</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex justify-between">
            <button
              onClick={step > 1 ? handlePrev : onClose}
              className="px-6 py-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              {step > 1 ? 'Previous' : 'Cancel'}
            </button>
            <button
              onClick={step < 3 ? handleNext : handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : step < 3 ? 'Next' : 'Send Invitation'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
