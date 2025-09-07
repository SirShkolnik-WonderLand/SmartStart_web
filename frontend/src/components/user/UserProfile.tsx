'use client'

import { useState, useEffect } from 'react'
import { comprehensiveApiService as apiService, User, UserProfile as UserProfileType, Badge, LeaderboardEntry } from '@/lib/api-comprehensive'
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Award, 
  Trophy, 
  Star, 
  Target, 
  Edit3,
  Check,
  X,
  Plus,
  Zap
} from 'lucide-react'

interface UserProfileProps {
  userId?: string
  isEditable?: boolean
  onEdit?: (user: User) => void
}

export function UserProfile({ userId, isEditable = false, onEdit }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [leaderboardEntry, setLeaderboardEntry] = useState<LeaderboardEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<UserProfileType>>({})
  const [editUserData, setEditUserData] = useState<Partial<User>>({})

  useEffect(() => {
    const loadUserData = async () => {
      try {
        let userResponse
        if (userId) {
          userResponse = await apiService.getUser(userId)
        } else {
          userResponse = await apiService.getCurrentUser()
        }

        if (userResponse.success && userResponse.data) {
          const userData = userResponse.data
          setUser(userData)
          setEditUserData({
            name: userData.name,
            email: userData.email
          })
          
          // Load user profile
          const profileResponse = await apiService.getUserProfile(userData.id)
          if (profileResponse.success && profileResponse.data) {
            setUserProfile(profileResponse.data)
            setEditData({
              bio: profileResponse.data.bio || '',
              skills: profileResponse.data.skills || [],
              experience: profileResponse.data.experience || '',
              portfolio: profileResponse.data.portfolio || []
            })
          } else {
            // Create default profile data
            setEditData({
              bio: '',
              skills: [],
              experience: '',
              portfolio: []
            })
          }

          // Load user badges
          const badgesResponse = await apiService.getUserBadges(userData.id)
          if (badgesResponse.success && badgesResponse.data) {
            setBadges(badgesResponse.data)
          }

          // Load leaderboard entry
          const leaderboardResponse = await apiService.getLeaderboard()
          if (leaderboardResponse.success && leaderboardResponse.data) {
            const userEntry = leaderboardResponse.data.find(entry => entry.userId === userData.id)
            if (userEntry) {
              setLeaderboardEntry(userEntry)
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [userId])

  const handleSave = async () => {
    if (!user) return

    try {
      // Update user basic info
      const userResponse = await apiService.updateUser(user.id, editUserData)
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data)
      }

      // Update user profile
      const profileResponse = await apiService.updateUserProfile(user.id, editData)
      if (profileResponse.success && profileResponse.data) {
        setUserProfile(profileResponse.data)
      }

      setIsEditing(false)
      onEdit?.(user)
    } catch (error) {
      console.error('Error updating user profile:', error)
    }
  }

  const handleCancel = () => {
    setEditUserData({
      name: user?.name,
      email: user?.email
    })
    setEditData({
      bio: userProfile?.bio || '',
      skills: userProfile?.skills || [],
      experience: userProfile?.experience || '',
      portfolio: userProfile?.portfolio || []
    })
    setIsEditing(false)
  }

  const addSkill = (skill: string) => {
    if (skill.trim() && !editData.skills?.includes(skill.trim())) {
      setEditData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill.trim()]
      }))
    }
  }

  const removeSkill = (skill: string) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }))
  }

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-foreground-muted">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <UserIcon className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">User Not Found</h3>
        <p className="text-foreground-muted">The requested user profile could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="glass rounded-xl p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editUserData.name || ''}
                    onChange={(e) => setEditUserData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-glass-surface border border-border rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />
                ) : (
                  user.name
                )}
              </h1>
              <div className="flex items-center gap-4 text-foreground-muted">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editUserData.email || ''}
                      onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-glass-surface border border-border rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    />
                  ) : (
                    user.email
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          {isEditable && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-glass-surface transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bio and Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            About
          </h3>
          {isEditing ? (
            <textarea
              value={editData.bio || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-foreground-body">
              {userProfile?.bio || 'No bio available yet.'}
            </p>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Skills
          </h3>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a skill..."]') as HTMLInputElement
                    if (input) {
                      addSkill(input.value)
                      input.value = ''
                    }
                  }}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editData.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="hover:text-accent/70 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {userProfile?.skills?.length ? (
                userProfile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-foreground-muted">No skills listed yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* XP and Level */}
        {leaderboardEntry && (
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Experience
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-foreground-muted">Level</span>
                <span className="text-2xl font-bold text-warning">
                  {leaderboardEntry.level}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground-muted">XP</span>
                <span className="text-lg font-semibold text-foreground">
                  {leaderboardEntry.xp.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground-muted">Rank</span>
                <span className="text-lg font-semibold text-foreground">
                  #{leaderboardEntry.rank}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-highlight" />
            Badges
          </h3>
          <div className="space-y-3">
            {badges.length > 0 ? (
              badges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-highlight/10 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-highlight" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{badge.name}</p>
                    <p className="text-sm text-foreground-muted">{badge.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-foreground-muted">No badges earned yet.</p>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-success" />
            Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-foreground-muted">Role</span>
              <span className="text-foreground">
                {typeof user.role === 'string' ? user.role : user.role?.name || 'User'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground-muted">Level</span>
              <span className="text-foreground">
                {user.level || '1'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground-muted">XP</span>
              <span className="text-foreground">
                {user.xp || '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
