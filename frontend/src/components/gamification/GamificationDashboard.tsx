'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Zap,
  Crown,
  Medal,
  Flame,
  Sparkles,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react'

interface UserStats {
  totalXp: number
  level: number
  badges: Badge[]
  achievements: Achievement[]
  recentActivity: XpTransaction[]
  leaderboardPosition: number
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  xpReward: number
  awardedAt: string
}

interface Achievement {
  id: string
  title: string
  description: string
  xpReward: number
  achievedAt: string
}

interface XpTransaction {
  id: string
  xpAmount: number
  activityType: string
  description: string
  createdAt: string
}

interface GamificationDashboardProps {
  userId: string
  onRefresh?: () => void
}

export function GamificationDashboard({ 
  userId, 
  onRefresh 
}: GamificationDashboardProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements' | 'leaderboard'>('overview')

  useEffect(() => {
    loadUserStats()
  }, [userId])

  const loadUserStats = async () => {
    try {
      setIsLoading(true)
      // This would call the actual API
      // const response = await apiService.getUserGamificationStats(userId)
      // setStats(response.data)
      
      // Mock data for now
      setStats({
        totalXp: 2450,
        level: 7,
        badges: [
          {
            id: '1',
            name: 'First Steps',
            description: 'Complete your first task',
            icon: '🎯',
            category: 'MILESTONE',
            rarity: 'COMMON',
            xpReward: 50,
            awardedAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            name: 'Team Player',
            description: 'Join your first team',
            icon: '👥',
            category: 'COLLABORATION',
            rarity: 'RARE',
            xpReward: 100,
            awardedAt: '2024-01-20T14:15:00Z'
          },
          {
            id: '3',
            name: 'Document Master',
            description: 'Sign 10 documents',
            icon: '📝',
            category: 'PRODUCTIVITY',
            rarity: 'EPIC',
            xpReward: 250,
            awardedAt: '2024-02-01T09:45:00Z'
          }
        ],
        achievements: [
          {
            id: '1',
            title: 'Rising Star',
            description: 'Reach level 5',
            xpReward: 200,
            achievedAt: '2024-01-25T16:20:00Z'
          },
          {
            id: '2',
            title: 'Goal Crusher',
            description: 'Complete 5 goals in a week',
            xpReward: 150,
            achievedAt: '2024-02-05T11:30:00Z'
          }
        ],
        recentActivity: [
          {
            id: '1',
            xpAmount: 50,
            activityType: 'DOCUMENT_SIGNED',
            description: 'Signed PPA document',
            createdAt: '2024-02-10T10:30:00Z'
          },
          {
            id: '2',
            xpAmount: 25,
            activityType: 'TEAM_JOINED',
            description: 'Joined Alpha Team',
            createdAt: '2024-02-09T15:45:00Z'
          },
          {
            id: '3',
            xpAmount: 100,
            activityType: 'GOAL_COMPLETED',
            description: 'Completed Q1 objectives',
            createdAt: '2024-02-08T09:15:00Z'
          }
        ],
        leaderboardPosition: 12
      })
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      'COMMON': 'bg-gray-100 text-gray-800',
      'RARE': 'bg-blue-100 text-blue-800',
      'EPIC': 'bg-purple-100 text-purple-800',
      'LEGENDARY': 'bg-yellow-100 text-yellow-800'
    }
    return colors[rarity as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getRarityIcon = (rarity: string) => {
    const icons = {
      'COMMON': <Star className="w-4 h-4" />,
      'RARE': <Award className="w-4 h-4" />,
      'EPIC': <Crown className="w-4 h-4" />,
      'LEGENDARY': <Trophy className="w-4 h-4" />
    }
    return icons[rarity as keyof typeof icons] || <Star className="w-4 h-4" />
  }

  const calculateXpToNextLevel = () => {
    if (!stats) return 0
    const currentLevelXp = (stats.level * stats.level) * 100
    const nextLevelXp = ((stats.level + 1) * (stats.level + 1)) * 100
    return nextLevelXp - stats.totalXp
  }

  const calculateXpProgress = () => {
    if (!stats) return 0
    const currentLevelXp = (stats.level * stats.level) * 100
    const nextLevelXp = ((stats.level + 1) * (stats.level + 1)) * 100
    const progress = ((stats.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
    return Math.max(0, Math.min(100, progress))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load gamification data</p>
        <Button onClick={loadUserStats} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gamification Dashboard</h2>
          <p className="text-muted-foreground">Track your progress and achievements</p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">{stats.totalXp.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">{stats.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Badges</p>
                <p className="text-2xl font-bold">{stats.badges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rank</p>
                <p className="text-2xl font-bold">#{stats.leaderboardPosition}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Level {stats.level} → Level {stats.level + 1}</span>
              <span className="text-sm text-muted-foreground">
                {calculateXpToNextLevel().toLocaleString()} XP to go
              </span>
            </div>
            <Progress value={calculateXpProgress()} className="h-2" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Level {stats.level}</span>
              <span>Level {stats.level + 1}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'badges', label: 'Badges', icon: Award },
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboard', icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Flame className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      +{activity.xpAmount} XP
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">This Week's XP</span>
                  <span className="font-medium">450 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">This Month's XP</span>
                  <span className="font-medium">1,850 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Streak</span>
                  <span className="font-medium">7 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Next Badge</span>
                  <span className="font-medium">50 XP away</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.badges.map((badge) => (
            <Card key={badge.id} className="relative">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-4xl">{badge.icon}</div>
                  <div>
                    <h3 className="font-semibold">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Badge className={getRarityColor(badge.rarity)}>
                      {getRarityIcon(badge.rarity)}
                      <span className="ml-1">{badge.rarity}</span>
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      +{badge.xpReward} XP
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awarded {new Date(badge.awardedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {stats.achievements.map((achievement) => (
            <Card key={achievement.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Achieved {new Date(achievement.achievedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    +{achievement.xpReward} XP
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Leaderboard coming soon!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Compete with other users and climb the ranks
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default GamificationDashboard
