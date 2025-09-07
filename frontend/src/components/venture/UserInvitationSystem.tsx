'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  X, 
  Filter,
  MapPin,
  Briefcase,
  Star,
  CheckCircle,
  Send
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  profession: string
  skills: string[]
  location: string
  experience: string
  rating: number
  avatar?: string
  isInvited?: boolean
}

interface UserInvitationSystemProps {
  ventureId: string
  ventureName: string
  requiredRoles: string[]
  onInvite: (userId: string, role: string) => void
  onClose: () => void
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    profession: 'Frontend Developer',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    location: 'San Francisco, CA',
    experience: '5 years',
    rating: 4.8,
    avatar: 'SC'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    profession: 'Backend Developer',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
    location: 'Austin, TX',
    experience: '7 years',
    rating: 4.9,
    avatar: 'MJ'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena.r@email.com',
    profession: 'UI/UX Designer',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    location: 'New York, NY',
    experience: '4 years',
    rating: 4.7,
    avatar: 'ER'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    profession: 'Product Manager',
    skills: ['Agile', 'Scrum', 'Product Strategy', 'Analytics'],
    location: 'Seattle, WA',
    experience: '6 years',
    rating: 4.6,
    avatar: 'DK'
  },
  {
    id: '5',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    profession: 'Marketing Manager',
    skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
    location: 'Los Angeles, CA',
    experience: '5 years',
    rating: 4.5,
    avatar: 'LW'
  },
  {
    id: '6',
    name: 'Alex Thompson',
    email: 'alex.t@email.com',
    profession: 'DevOps Engineer',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    location: 'Remote',
    experience: '8 years',
    rating: 4.9,
    avatar: 'AT'
  }
]

const professions = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer',
  'UI/UX Designer', 'Product Manager', 'Marketing Manager', 'Sales Manager',
  'Business Analyst', 'Data Scientist', 'DevOps Engineer', 'QA Engineer',
  'Content Writer', 'Graphic Designer', 'Project Manager', 'CEO/Founder',
  'CTO', 'CFO', 'COO', 'Legal Counsel', 'HR Manager'
]

const locations = [
  'All Locations', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 
  'Seattle, WA', 'Los Angeles, CA', 'Remote', 'Other'
]

export default function UserInvitationSystem({ 
  ventureId, 
  ventureName, 
  requiredRoles, 
  onInvite, 
  onClose 
}: UserInvitationSystemProps) {
  // Use ventureId to avoid unused parameter warning
  console.log('Invitation system for venture:', ventureId)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProfession, setSelectedProfession] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [minRating, setMinRating] = useState(0)
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set())
  const [selectedRole, setSelectedRole] = useState('')

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesProfession = !selectedProfession || user.profession === selectedProfession
    const matchesLocation = selectedLocation === 'All Locations' || user.location === selectedLocation
    const matchesRating = user.rating >= minRating

    return matchesSearch && matchesProfession && matchesLocation && matchesRating
  })

  const handleInvite = (userId: string) => {
    if (selectedRole) {
      setInvitedUsers(prev => new Set([...prev, userId]))
      onInvite(userId, selectedRole)
    }
  }

  const handleRemoveInvite = (userId: string) => {
    setInvitedUsers(prev => {
      const newSet = new Set(prev)
      newSet.delete(userId)
      return newSet
    })
  }

  const getRoleMatchScore = (user: User) => {
    if (!selectedRole) return 0
    const roleKeywords = selectedRole.toLowerCase().split(' ')
    const userSkills = user.skills.map(skill => skill.toLowerCase())
    const userProfession = user.profession.toLowerCase()
    
    let score = 0
    roleKeywords.forEach(keyword => {
      if (userProfession.includes(keyword)) score += 3
      if (userSkills.some(skill => skill.includes(keyword))) score += 1
    })
    
    return score
  }

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const scoreA = getRoleMatchScore(a)
    const scoreB = getRoleMatchScore(b)
    if (scoreA !== scoreB) return scoreB - scoreA
    return b.rating - a.rating
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-6xl max-h-[90vh] mx-4 bg-card border rounded-lg shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-muted/50">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Invite Team Members
            </h2>
            <p className="text-muted-foreground">Find and invite professionals for {ventureName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Filters Sidebar */}
          <div className="w-80 border-r bg-muted/20 p-6 overflow-y-auto">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>

            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Role to Fill
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Choose a role</option>
                  {requiredRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Profession Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Profession
                </label>
                <select
                  value={selectedProfession}
                  onChange={(e) => setSelectedProfession(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Professions</option>
                  {professions.map(profession => (
                    <option key={profession} value={profession}>{profession}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Rating: {minRating.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.0</span>
                  <span>5.0</span>
                </div>
              </div>

              {/* Invited Users */}
              {invitedUsers.size > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-green-600">
                    Invited ({invitedUsers.size})
                  </h4>
                  <div className="space-y-2">
                    {Array.from(invitedUsers).map(userId => {
                      const user = mockUsers.find(u => u.id === userId)
                      return user ? (
                        <div key={userId} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-700">
                              {user.avatar}
                            </div>
                            <span className="text-sm font-medium">{user.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveInvite(userId)}
                            className="p-1 hover:bg-green-200 rounded"
                          >
                            <X className="w-3 h-3 text-green-600" />
                          </button>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search Bar */}
            <div className="p-6 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, profession, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {sortedUsers.map((user) => {
                  const isInvited = invitedUsers.has(user.id)
                  const matchScore = getRoleMatchScore(user)
                  
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg transition-all duration-200 ${
                        isInvited 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-card hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
                            isInvited ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
                          }`}>
                            {user.avatar}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{user.name}</h3>
                              {matchScore > 0 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {matchScore} match
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {user.profession}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {user.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                {user.rating}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {user.skills.slice(0, 4).map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                                  {skill}
                                </span>
                              ))}
                              {user.skills.length > 4 && (
                                <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                                  +{user.skills.length - 4} more
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {user.experience} of experience
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isInvited ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Invited</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleInvite(user.id)}
                              disabled={!selectedRole}
                              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4" />
                              Invite
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                
                {sortedUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No users found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
