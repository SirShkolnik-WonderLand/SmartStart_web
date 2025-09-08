'use client'

import { useEffect, useState } from 'react'
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Star, 
  Edit3, 
  Camera,
  Save,
  X,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { comprehensiveApiService as apiService, User as UserType } from '@/lib/api-comprehensive'

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    bio: ''
  })

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await apiService.getCurrentUser()
        if (response.success && response.data) {
          setUser(response.data)
          setEditData({
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            bio: response.data.bio || ''
          })
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  const handleSave = async () => {
    try {
      if (!user) return
      
      const response = await apiService.updateUserProfile(user.id, editData)
      if (response.success && response.data) {
        setUser(response.data)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || ''
      })
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <User className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-foreground-muted">Unable to load your profile information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="wonderland-card glass-surface p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/80 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {user.name || 'Unknown User'}
              </h1>
              <p className="text-foreground-muted mb-2">{user.email}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Level {user.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{user.xp} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{user.status}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-sm font-medium">Reputation</div>
                <div className="text-lg font-bold text-purple-600">{user.reputation}</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium">Last Active</div>
                <div className="text-sm text-blue-600">
                  {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium">Member Since</div>
                <div className="text-sm text-green-600">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="wonderland-card glass-surface p-8">
        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="text-foreground-body">{user.firstName || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="text-foreground-body">{user.lastName || 'Not set'}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted" />
              <p className="text-foreground-body">{user.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-foreground-body">{user.bio || 'No bio provided'}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
