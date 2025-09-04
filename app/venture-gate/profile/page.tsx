'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Skill {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: string
}

const ProfileSetup = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  
  // Profile data
  const [profile, setProfile] = useState({
    firstName: 'Udi',
    lastName: 'Shkolnik',
    bio: '',
    location: '',
    timezone: '',
    availability: 'full-time',
    experience: '5+ years',
    interests: [] as string[],
    skills: [] as Skill[],
    portfolio: {
      github: '',
      linkedin: '',
      website: '',
      projects: [] as string[]
    },
    preferences: {
      ndaLanguage: 'english',
      notifications: true,
      publicProfile: true
    }
  })

  const steps = [
    { id: 1, title: 'Basic Info', icon: '👤' },
    { id: 2, title: 'Skills & Experience', icon: '🎯' },
    { id: 3, title: 'Portfolio & Links', icon: '🔗' },
    { id: 4, title: 'Preferences', icon: '⚙️' }
  ]

  const skillCategories = [
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'Mobile Development',
    'DevOps & Infrastructure',
    'Data Science & AI',
    'Product Management',
    'Design & UX',
    'Marketing & Growth',
    'Business Development',
    'Legal & Compliance',
    'Finance & Accounting'
  ]

  const interestOptions = [
    'Startup Ecosystem',
    'Fintech',
    'Healthcare Tech',
    'EdTech',
    'SaaS',
    'E-commerce',
    'Blockchain & Crypto',
    'AI & Machine Learning',
    'IoT',
    'Cybersecurity',
    'Sustainability',
    'Social Impact'
  ]

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Save profile data to API
      const response = await fetch('/api/user-profile/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        router.push('/venture-gate/explore')
      } else {
        console.error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 'intermediate',
      category: skillCategories[0]
    }
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }))
  }

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }))
  }

  const removeSkill = (id: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }))
  }

  const toggleInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed'
    if (stepId === currentStep) return 'current'
    return 'pending'
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1>Profile & Fit Setup</h1>
        <p className="text-secondary">
          Complete your profile to improve matching and recommendations
        </p>
      </div>

      {/* Progress Steps */}
      <div className="card mb-8 animate-slide-in">
        <div className="card-header">
          <h3>Setup Progress</h3>
          <p className="text-muted">
            Complete each step to optimize your platform experience
          </p>
        </div>
        
        <div className="grid grid-4 gap-4">
          {steps.map((step) => {
            const status = getStepStatus(step.id)
            return (
              <div
                key={step.id}
                className={`card ${status === 'current' ? 'border-accent' : ''}`}
                style={{
                  opacity: status === 'pending' ? 0.6 : 1,
                  borderColor: status === 'current' ? 'var(--accent-primary)' : undefined,
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <h4 className="text-sm font-medium mb-2">{step.title}</h4>
                  <span className={`status ${
                    status === 'completed' ? 'status-success' :
                    status === 'current' ? 'status-info' :
                    'status-danger'
                  }`}>
                    {status === 'completed' ? '✓' :
                     status === 'current' ? '→' : '⏳'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="card animate-fade-in">
        {currentStep === 1 && (
          <div>
            <div className="card-header">
              <h3>👤 Basic Information</h3>
              <p className="text-muted">
                Tell us about yourself and your professional background
              </p>
            </div>
            
            <div className="grid grid-2 gap-6">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.firstName}
                  onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.lastName}
                  onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Bio</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Tell us about your professional background, experience, and what you're passionate about..."
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>

            <div className="grid grid-2 gap-6">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="City, Country"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select
                  className="form-input"
                  value={profile.timezone}
                  onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                >
                  <option value="">Select Timezone</option>
                  <option value="UTC-8">Pacific Time (UTC-8)</option>
                  <option value="UTC-5">Eastern Time (UTC-5)</option>
                  <option value="UTC+0">UTC (UTC+0)</option>
                  <option value="UTC+1">Central European Time (UTC+1)</option>
                  <option value="UTC+2">Eastern European Time (UTC+2)</option>
                  <option value="UTC+8">China Standard Time (UTC+8)</option>
                  <option value="UTC+9">Japan Standard Time (UTC+9)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-2 gap-6">
              <div className="form-group">
                <label className="form-label">Availability</label>
                <select
                  className="form-input"
                  value={profile.availability}
                  onChange={(e) => setProfile(prev => ({ ...prev, availability: e.target.value }))}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="consulting">Consulting</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select
                  className="form-input"
                  value={profile.experience}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                >
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5+ years">5+ years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <div className="card-header">
              <h3>🎯 Skills & Experience</h3>
              <p className="text-muted">
                Add your skills and areas of expertise
              </p>
            </div>
            
            {/* Skills */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4>Technical Skills</h4>
                <button className="btn btn-secondary" onClick={addSkill}>
                  Add Skill
                </button>
              </div>
              
              {profile.skills.map((skill) => (
                <div key={skill.id} className="grid grid-3 gap-4 mb-4 p-4" style={{ background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Skill Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., React, Python, Product Management"
                      value={skill.name}
                      onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={skill.category}
                      onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                    >
                      {skillCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Level</label>
                    <select
                      className="form-input"
                      value={skill.level}
                      onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeSkill(skill.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Interests */}
            <div>
              <h4 className="mb-4">Areas of Interest</h4>
              <div className="grid grid-3 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    className={`btn ${profile.interests.includes(interest) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <div className="card-header">
              <h3>🔗 Portfolio & Links</h3>
              <p className="text-muted">
                Connect your professional profiles and showcase your work
              </p>
            </div>
            
            <div className="grid grid-2 gap-6">
              <div className="form-group">
                <label className="form-label">GitHub Profile</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/username"
                  value={profile.portfolio.github}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    portfolio: { ...prev.portfolio, github: e.target.value }
                  }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn Profile</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://linkedin.com/in/username"
                  value={profile.portfolio.linkedin}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    portfolio: { ...prev.portfolio, linkedin: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Personal Website</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://yourwebsite.com"
                value={profile.portfolio.website}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  portfolio: { ...prev.portfolio, website: e.target.value }
                }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notable Projects</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="List your most impressive projects, achievements, or contributions..."
                value={profile.portfolio.projects.join('\n')}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  portfolio: { ...prev.portfolio, projects: e.target.value.split('\n').filter(p => p.trim()) }
                }))}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <div className="card-header">
              <h3>⚙️ Preferences</h3>
              <p className="text-muted">
                Configure your platform preferences and settings
              </p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Preferred NDA Language</label>
              <select
                className="form-input"
                value={profile.preferences.ndaLanguage}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  preferences: { ...prev.preferences, ndaLanguage: e.target.value }
                }))}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
              </select>
            </div>

            <div className="grid grid-2 gap-6">
              <div className="form-group">
                <label className="form-label">Email Notifications</label>
                <select
                  className="form-input"
                  value={profile.preferences.notifications ? 'enabled' : 'disabled'}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, notifications: e.target.value === 'enabled' }
                  }))}
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Public Profile</label>
                <select
                  className="form-input"
                  value={profile.preferences.publicProfile ? 'public' : 'private'}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, publicProfile: e.target.value === 'public' }
                  }))}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="card mt-6" style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid var(--accent-primary)' }}>
              <h4 className="mb-3" style={{ color: 'var(--accent-primary)' }}>Content Safety Policy</h4>
              <p className="text-secondary text-sm mb-4">
                By using the platform, you agree to our Content Safety Policy:
              </p>
              <ul className="text-secondary text-sm">
                <li className="mb-2">• No recording or screenshots of sensitive project content</li>
                <li className="mb-2">• No scraping or automated data collection</li>
                <li className="mb-2">• Respect intellectual property rights</li>
                <li className="mb-2">• Report any security vulnerabilities responsibly</li>
              </ul>
              <div className="mt-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">I agree to the Content Safety Policy</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </button>
          
          {currentStep < steps.length ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next Step
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </div>

      {/* Profile Preview */}
      <div className="card mt-8 animate-fade-in">
        <div className="card-header">
          <h3>👀 Profile Preview</h3>
          <p className="text-muted">
            This is how your profile will appear to other users
          </p>
        </div>
        
        <div className="grid grid-2 gap-6">
          <div>
            <h4 className="mb-3">{profile.firstName} {profile.lastName}</h4>
            <p className="text-secondary mb-4">{profile.bio || 'No bio provided'}</p>
            <div className="text-sm text-muted">
              <div>📍 {profile.location || 'Location not specified'}</div>
              <div>⏰ {profile.availability} • {profile.experience}</div>
            </div>
          </div>
          <div>
            <h5 className="mb-3">Skills</h5>
            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, 5).map((skill) => (
                <span key={skill.id} className="status status-info">
                  {skill.name} ({skill.level})
                </span>
              ))}
              {profile.skills.length > 5 && (
                <span className="status status-info">
                  +{profile.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSetup
