'use client'

import { useEffect, useState } from 'react'
import { comprehensiveApiService as apiService, Team, AnalyticsData } from '@/lib/api-comprehensive'
import { Users, Target, TrendingUp, Plus, Search, Calendar, Award } from 'lucide-react'
import { TeamForm } from '@/components/team/TeamForm'

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const loadTeamsData = async () => {
      try {
        const teamsResponse = await apiService.getTeams()
        if (teamsResponse.success && teamsResponse.data) {
          setTeams(teamsResponse.data)
        }

        const analyticsResponse = await apiService.getAnalytics()
        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data)
        }
      } catch (error) {
        console.error('Error loading teams data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamsData()
  }, [])

  const handleTeamCreated = (newTeam: Team) => {
    setTeams(prev => [newTeam, ...prev])
    setShowCreateModal(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading teams...</p>
        </div>
      </div>
    )
  }

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0)
  const activeGoals = teams.reduce((sum, team) => sum + team.goals.filter(g => g.status === 'active').length, 0)
  const completedGoals = teams.reduce((sum, team) => sum + team.goals.filter(g => g.status === 'completed').length, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Teams</h1>
          <p className="text-xl text-foreground-muted">
            Collaborate and manage your teams effectively
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="wonder-button flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Team
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{teams.length}</div>
          <div className="text-sm text-foreground-muted">Active Teams</div>
          <div className="text-xs text-success mt-1">+{analytics?.teamGrowth || 0}%</div>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{totalMembers}</div>
          <div className="text-sm text-foreground-muted">Total Members</div>
          <div className="text-xs text-success mt-1">Active contributors</div>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-highlight/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Target className="w-6 h-6 text-highlight" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{activeGoals}</div>
          <div className="text-sm text-foreground-muted">Active Goals</div>
          <div className="text-xs text-success mt-1">In progress</div>
        </div>

        <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Award className="w-6 h-6 text-success" />
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{completedGoals}</div>
          <div className="text-sm text-foreground-muted">Completed Goals</div>
          <div className="text-xs text-success mt-1">Achievements</div>
        </div>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-foreground-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-glass-surface border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="glass rounded-xl p-6 cursor-pointer group hover:glass-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {team.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                    {team.members.length} members
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    {team.goals.filter(g => g.status === 'active').length} active goals
                  </span>
                </div>
              </div>
              <Users className="w-6 h-6 text-primary" />
            </div>
            
            <p className="text-foreground-muted mb-4 line-clamp-3">
              {team.description}
            </p>
            
            {/* Team Members Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Team Members</h4>
              <div className="flex flex-wrap gap-2">
                {team.members.slice(0, 3).map((member) => (
                  <div key={member.id} className="flex items-center gap-2 px-2 py-1 bg-glass-surface rounded-md">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-foreground-muted">{member.user.name}</span>
                  </div>
                ))}
                {team.members.length > 3 && (
                  <div className="px-2 py-1 bg-glass-surface rounded-md">
                    <span className="text-xs text-foreground-muted">+{team.members.length - 3} more</span>
                  </div>
                )}
              </div>
            </div>

            {/* Active Goals */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Active Goals</h4>
              <div className="space-y-2">
                {team.goals.filter(g => g.status === 'active').slice(0, 2).map((goal) => (
                  <div key={goal.id} className="flex items-center gap-2 p-2 bg-glass-surface rounded-md">
                    <Target className="w-4 h-4 text-highlight" />
                    <div className="flex-1">
                      <p className="text-xs text-foreground-body">{goal.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-glass-border rounded-full h-1">
                          <div 
                            className="bg-highlight h-1 rounded-full transition-all duration-300"
                            style={{ width: `${(goal.current / goal.target) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-foreground-muted">
                          {Math.round((goal.current / goal.target) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {team.goals.filter(g => g.status === 'active').length === 0 && (
                  <p className="text-xs text-foreground-muted">No active goals</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Calendar className="w-4 h-4" />
                Created: {new Date(team.createdAt).toLocaleDateString()}
              </div>
              <button className="px-3 py-1 border border-glass-border rounded-md hover:bg-glass-highlight transition-colors text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
        
        {filteredTeams.length === 0 && (
          <div className="col-span-full glass rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? 'No teams found' : 'No teams yet'}
            </h3>
            <p className="text-foreground-muted mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Create your first team to start collaborating and achieving goals together.'
              }
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="wonder-button"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Team
            </button>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-4xl">
            <TeamForm 
              onSuccess={handleTeamCreated}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
