'use client'

import { useEffect, useState } from 'react'
import { comprehensiveApiService as apiService, LeaderboardEntry, Badge, User } from '@/lib/api-comprehensive'
import { Trophy, Medal, Award, Star, Crown, Zap, Target, Filter } from 'lucide-react'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'weekly' | 'monthly' | 'yearly'>('all')

  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        const leaderboardResponse = await apiService.getLeaderboard()
        if (leaderboardResponse.success && leaderboardResponse.data) {
          setLeaderboard(leaderboardResponse.data)
        }

        const userResponse = await apiService.getCurrentUser()
        if (userResponse.success && userResponse.data) {
          setCurrentUser(userResponse.data)
          
          // Load user badges
          const badgesResponse = await apiService.getUserBadges(userResponse.data.id)
          if (badgesResponse.success && badgesResponse.data) {
            setBadges(badgesResponse.data)
          }
        }
      } catch (error) {
        console.error('Error loading leaderboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLeaderboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-foreground-muted font-bold">
          {rank}
        </span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
      default:
        return 'bg-glass-surface text-foreground-muted'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-xl text-foreground-muted">
            See who&apos;s leading the pack in contributions and achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-foreground-muted" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'weekly' | 'monthly' | 'yearly')}
            className="bg-glass-surface border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          >
            <option value="all">All Time</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
          </select>
        </div>
      </div>

      {/* Current User Stats */}
      {currentUser && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-warning" />
            Your Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{currentUser.xp || 0}</div>
              <div className="text-sm text-foreground-muted">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{currentUser.level || '1'}</div>
              <div className="text-sm text-foreground-muted">Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{badges.length}</div>
              <div className="text-sm text-foreground-muted">Badges Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {leaderboard.find(entry => entry.userId === currentUser.id)?.rank || 'N/A'}
              </div>
              <div className="text-sm text-foreground-muted">Current Rank</div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">🏆 Top Performers</h2>
          <div className="flex justify-center items-end gap-4">
            {/* 2nd Place */}
            {leaderboard[1] && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="text-sm font-medium text-foreground">{leaderboard[1].name}</div>
                <div className="text-xs text-foreground-muted">{leaderboard[1].xp} XP</div>
              </div>
            )}
            
            {/* 1st Place */}
            {leaderboard[0] && (
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-bold text-foreground">{leaderboard[0].name}</div>
                <div className="text-sm text-foreground-muted">{leaderboard[0].xp} XP</div>
              </div>
            )}
            
            {/* 3rd Place */}
            {leaderboard[2] && (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="text-sm font-medium text-foreground">{leaderboard[2].name}</div>
                <div className="text-xs text-foreground-muted">{leaderboard[2].xp} XP</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          Complete Rankings
        </h2>
        
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div 
              key={entry.userId} 
              className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                entry.userId === currentUser?.id 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-glass-surface'
              }`}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="flex-1 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {entry.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{entry.name}</h3>
                    {entry.userId === currentUser?.id && (
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {entry.xp} XP
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Level {entry.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {entry.badges} badges
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRankBadge(entry.rank)}`}>
                  #{entry.rank}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No rankings yet</h3>
            <p className="text-foreground-muted">Start contributing to climb the leaderboard!</p>
          </div>
        )}
      </div>

      {/* Badges Showcase */}
      {badges.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-warning" />
            Your Badges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl">{badge.icon}</span>
                </div>
                <div className="text-sm font-medium text-foreground">{badge.name}</div>
                <div className="text-xs text-foreground-muted capitalize">{badge.rarity}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
