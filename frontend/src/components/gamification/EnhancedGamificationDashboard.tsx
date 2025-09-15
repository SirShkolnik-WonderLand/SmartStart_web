'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, Star, Zap, Target, Crown, Medal, Award, 
  TrendingUp, Users, Calendar, Coins, Gift, 
  ChevronRight, Sparkles, Flame, Rocket, Diamond
} from 'lucide-react'

interface UserStats {
  level: number
  xp: number
  xpToNext: number
  totalXp: number
  rank: number
  totalUsers: number
  buzTokens: number
  venturesCreated: number
  venturesJoined: number
  milestonesCompleted: number
  daysActive: number
  streak: number
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

interface Achievement {
  id: string
  title: string
  description: string
  reward: number
  completed: boolean
  progress: number
  maxProgress: number
  category: string
}

const mockStats: UserStats = {
  level: 12,
  xp: 2450,
  xpToNext: 550,
  totalXp: 12450,
  rank: 47,
  totalUsers: 1250,
  buzTokens: 2840,
  venturesCreated: 3,
  venturesJoined: 7,
  milestonesCompleted: 23,
  daysActive: 45,
  streak: 12
}

const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Venture Creator',
    description: 'Created your first venture',
    icon: '🚀',
    rarity: 'common',
    unlockedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Team Player',
    description: 'Joined 5 different ventures',
    icon: '👥',
    rarity: 'rare',
    unlockedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Milestone Master',
    description: 'Completed 20 milestones',
    icon: '🎯',
    rarity: 'epic',
    unlockedAt: '2024-01-25T09:15:00Z'
  },
  {
    id: '4',
    name: 'BUZ Collector',
    description: 'Earned 10,000 BUZ tokens',
    icon: '💎',
    rarity: 'legendary',
    progress: 2840,
    maxProgress: 10000
  },
  {
    id: '5',
    name: 'Streak Keeper',
    description: 'Maintained a 30-day streak',
    icon: '🔥',
    rarity: 'epic',
    progress: 12,
    maxProgress: 30
  }
]

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Venture Visionary',
    description: 'Create 10 ventures',
    reward: 500,
    completed: false,
    progress: 3,
    maxProgress: 10,
    category: 'Creation'
  },
  {
    id: '2',
    title: 'Collaboration Champion',
    description: 'Join 20 ventures',
    reward: 750,
    completed: false,
    progress: 7,
    maxProgress: 20,
    category: 'Collaboration'
  },
  {
    id: '3',
    title: 'Milestone Marauder',
    description: 'Complete 100 milestones',
    reward: 1000,
    completed: false,
    progress: 23,
    maxProgress: 100,
    category: 'Progress'
  },
  {
    id: '4',
    title: 'BUZ Billionaire',
    description: 'Earn 50,000 BUZ tokens',
    reward: 2000,
    completed: false,
    progress: 2840,
    maxProgress: 50000,
    category: 'Economy'
  }
]

const rarityColors = {
  common: 'text-gray-600 bg-gray-100',
  rare: 'text-blue-600 bg-blue-100',
  epic: 'text-purple-600 bg-purple-100',
  legendary: 'text-yellow-600 bg-yellow-100'
}

const rarityIcons = {
  common: '⭐',
  rare: '💎',
  epic: '👑',
  legendary: '🏆'
}

export default function EnhancedGamificationDashboard() {
  const [stats, setStats] = useState<UserStats>(mockStats)
  const [badges, setBadges] = useState<Badge[]>(mockBadges)
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements)
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements' | 'leaderboard'>('overview')

  const getLevelProgress = () => {
    return (stats.xp / (stats.xp + stats.xpToNext)) * 100
  }

  const getRankPercentage = () => {
    return ((stats.totalUsers - stats.rank + 1) / stats.totalUsers) * 100
  }

  const getRarityIcon = (rarity: string) => {
    return rarityIcons[rarity as keyof typeof rarityIcons] || '⭐'
  }

  const getRarityColor = (rarity: string) => {
    return rarityColors[rarity as keyof typeof rarityColors] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                Gamification Dashboard
              </h1>
              <p className="text-muted-foreground">Track your progress, earn badges, and climb the leaderboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{stats.level}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent">{stats.rank}</div>
                <div className="text-sm text-muted-foreground">Rank</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {[
              { id: 'overview', label: 'Overview', icon: Target },
              { id: 'badges', label: 'Badges', icon: Medal },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Level Progress */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Level Progress</h2>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">Level {stats.level}</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.xp.toLocaleString()} / {(stats.xp + stats.xpToNext).toLocaleString()} XP
                  </div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-4 mb-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-accent h-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getLevelProgress()}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {stats.xpToNext.toLocaleString()} XP needed for next level
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.buzTokens.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">BUZ Tokens</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  +{Math.floor(Math.random() * 100)} this week
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.venturesCreated}</div>
                    <div className="text-sm text-muted-foreground">Ventures Created</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.venturesJoined} joined
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.milestonesCompleted}</div>
                    <div className="text-sm text-muted-foreground">Milestones</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.floor(Math.random() * 10)} this week
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.streak}</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.daysActive} days active
                </div>
              </div>
            </div>

            {/* Recent Badges */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Recent Badges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.filter(b => b.unlockedAt).slice(0, 3).map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold">{badge.name}</div>
                      <div className="text-sm text-muted-foreground">{badge.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(badge.unlockedAt!).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                      {getRarityIcon(badge.rarity)} {badge.rarity}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">All Badges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg transition-all ${
                      badge.unlockedAt 
                        ? 'bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20' 
                        : 'bg-muted/30 border-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">{badge.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{badge.name}</div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block mt-1 ${getRarityColor(badge.rarity)}`}>
                          {getRarityIcon(badge.rarity)} {badge.rarity}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">{badge.description}</div>
                    
                    {badge.unlockedAt ? (
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                      </div>
                    ) : badge.progress !== undefined ? (
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{badge.progress}/{badge.maxProgress}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Not started</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Achievements</h2>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border rounded-lg transition-all ${
                      achievement.completed 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          achievement.completed ? 'bg-green-100' : 'bg-muted'
                        }`}>
                          {achievement.completed ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Target className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{achievement.title}</div>
                          <div className="text-sm text-muted-foreground">{achievement.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {achievement.category} • {achievement.reward} BUZ reward
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">+{achievement.reward}</div>
                        <div className="text-xs text-muted-foreground">BUZ</div>
                      </div>
                    </div>
                    
                    {!achievement.completed && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Global Leaderboard</h2>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Alex Chen', xp: 45600, level: 25, buz: 12500 },
                  { rank: 2, name: 'Sarah Johnson', xp: 42300, level: 24, buz: 11800 },
                  { rank: 3, name: 'Mike Rodriguez', xp: 40100, level: 23, buz: 11200 },
                  { rank: 47, name: 'You', xp: stats.totalXp, level: stats.level, buz: stats.buzTokens, isCurrentUser: true },
                  { rank: 48, name: 'Emma Wilson', xp: 12100, level: 11, buz: 2800 },
                  { rank: 49, name: 'David Kim', xp: 11800, level: 11, buz: 2650 }
                ].map((user, index) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      user.isCurrentUser 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        user.rank <= 3 
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-muted-foreground">Level {user.level}</div>
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-sm font-medium">{user.xp.toLocaleString()} XP</div>
                      <div className="text-xs text-muted-foreground">{user.buz.toLocaleString()} BUZ</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
