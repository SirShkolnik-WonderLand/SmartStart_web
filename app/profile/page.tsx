'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '../services/api'

const ProfilePage = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    skills: '',
    experience: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const userData = await apiService.getCurrentUser()
      setUser(userData)
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        bio: userData.bio || '',
        skills: userData.skills || '',
        experience: userData.experience || ''
      })
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      // Here you would typically call an API to update the user profile
      console.log('Saving profile:', formData)
      alert('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile')
    }
  }

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-muted mt-4">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#00ff88' }}>
          Profile Settings
        </h1>
        <p className="text-xl text-muted">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-2 gap-8">
        {/* Profile Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">👤 Personal Information</h3>
            <p className="text-muted">Your basic profile details</p>
          </div>
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="input w-full"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                    {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{user?.firstName || user?.name || 'User'}</h4>
                    <p className="text-muted">{user?.email}</p>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Bio</h5>
                  <p className="text-muted">{user?.bio || 'No bio provided'}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Skills & Experience */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">🎯 Skills & Experience</h3>
            <p className="text-muted">Your professional background</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h5 className="font-medium mb-2">Skills</h5>
                <p className="text-muted">{user?.skills || 'No skills listed'}</p>
              </div>
              <div>
                <h5 className="font-medium mb-2">Experience</h5>
                <p className="text-muted">{user?.experience || 'No experience listed'}</p>
              </div>
              <div>
                <h5 className="font-medium mb-2">Level</h5>
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ 
                  background: '#00ff88', 
                  color: '#000' 
                }}>
                  {user?.level || 'OWLET'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">⚙️ Account Settings</h3>
            <p className="text-muted">Manage your account preferences</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Email Notifications</h5>
                  <p className="text-sm text-muted">Receive updates about your ventures</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Team Invitations</h5>
                  <p className="text-sm text-muted">Get notified about team invitations</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Project Updates</h5>
                  <p className="text-sm text-muted">Stay updated on project progress</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">🔒 Security</h3>
            <p className="text-muted">Manage your account security</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <button className="btn btn-secondary w-full">
                Change Password
              </button>
              <button className="btn btn-secondary w-full">
                Two-Factor Authentication
              </button>
              <button className="btn btn-secondary w-full">
                Download Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="text-center mt-8">
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

export default ProfilePage
