import { PrismaClient } from '@prisma/client'
import { Role, UserStatus, UserLevel } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateUserData {
  email: string
  name?: string
  role?: Role
  status?: UserStatus
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: Role
  status?: UserStatus
  level?: UserLevel
  xp?: number
  reputation?: number
}

export interface UserFilters {
  role?: Role
  status?: UserStatus
  level?: UserLevel
  search?: string
  limit?: number
  offset?: number
}

export class UserManagementService {
  // Get all users with filtering
  async getUsers(filters?: UserFilters) {
    const where: any = {}
    
    if (filters?.role) where.account = { role: filters.role }
    if (filters?.status) where.status = filters.status
    if (filters?.level) where.level = filters.level
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        account: {
          select: {
            role: true
          }
        },
        userBadges: {
          include: {
            badge: true
          }
        },
        userSkills: {
          include: {
            skill: true
          }
        },
        projectsOwned: {
          select: {
            id: true,
            name: true
          }
        },
        contributions: {
          select: {
            id: true,
            finalPct: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    })

    // Calculate portfolio value and contribution counts
    const usersWithStats = users.map(user => {
      const totalContributions = user.contributions.filter(c => c.status === 'APPROVED').length
      const portfolioValue = user.contributions
        .filter(c => c.status === 'APPROVED' && c.finalPct)
        .reduce((sum, c) => sum + (c.finalPct || 0), 0)

      return {
        ...user,
        totalContributions,
        portfolioValue: Math.round(portfolioValue * 10000), // Convert to dollars
        skills: user.userSkills.map(us => ({
          name: us.skill.name,
          level: us.level,
          category: us.skill.category
        })),
        badges: user.userBadges.map(ub => ({
          name: ub.badge.name,
          icon: ub.badge.icon,
          earnedAt: ub.earnedAt
        }))
      }
    })

    return usersWithStats
  }

  // Get user by ID
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        account: {
          select: {
            role: true
          }
        },
        userBadges: {
          include: {
            badge: true
          }
        },
        userSkills: {
          include: {
            skill: true
          }
        },
        projectsOwned: {
          select: {
            id: true,
            name: true
          }
        },
        contributions: {
          include: {
            task: {
              include: {
                project: true
              }
            }
          }
        },
        projectMemberships: {
          include: {
            project: true
          }
        }
      }
    })

    if (!user) return null

    // Calculate portfolio value and contribution counts
    const totalContributions = user.contributions.filter(c => c.status === 'APPROVED').length
    const portfolioValue = user.contributions
      .filter(c => c.status === 'APPROVED' && c.finalPct)
      .reduce((sum, c) => sum + (c.finalPct || 0), 0)

    return {
      ...user,
      totalContributions,
      portfolioValue: Math.round(portfolioValue * 10000),
      skills: user.userSkills.map(us => ({
        name: us.skill.name,
        level: us.level,
        category: us.skill.category
      })),
      badges: user.userBadges.map(ub => ({
        name: ub.badge.name,
        icon: ub.badge.icon,
        earnedAt: ub.earnedAt
      }))
    }
  }

  // Update user
  async updateUser(userId: string, data: UpdateUserData) {
    const updateData: any = { ...data }
    
    // Update lastActive if any field is changed
    if (Object.keys(data).length > 0) {
      updateData.lastActive = new Date()
    }

    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        account: {
          select: {
            role: true
          }
        }
      }
    })
  }

  // Update user role (requires account update)
  async updateUserRole(userId: string, role: Role) {
    return await prisma.account.update({
      where: { userId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Update user status
  async updateUserStatus(userId: string, status: UserStatus) {
    return await prisma.user.update({
      where: { id: userId },
      data: { status, lastActive: new Date() }
    })
  }

  // Add XP to user
  async addXP(userId: string, xpAmount: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true }
    })

    if (!user) throw new Error('User not found')

    const newXP = user.xp + xpAmount
    let newLevel = user.level

    // Level up logic
    if (newXP >= 10000 && user.level === 'OWLET') {
      newLevel = 'NIGHT_WATCHER'
    } else if (newXP >= 25000 && user.level === 'NIGHT_WATCHER') {
      newLevel = 'WISE_OWL'
    } else if (newXP >= 50000 && user.level === 'WISE_OWL') {
      newLevel = 'SKY_MASTER'
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { 
        xp: newXP, 
        level: newLevel,
        lastActive: new Date()
      }
    })
  }

  // Add reputation to user
  async addReputation(userId: string, reputationAmount: number) {
    return await prisma.user.update({
      where: { id: userId },
      data: { 
        reputation: { increment: reputationAmount },
        lastActive: new Date()
      }
    })
  }

  // Get user statistics
  async getUserStats() {
    const [totalUsers, activeUsers, pendingUsers, suspendedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } })
    ])

    const roleStats = await prisma.account.groupBy({
      by: ['role'],
      _count: { role: true }
    })

    const levelStats = await prisma.user.groupBy({
      by: ['level'],
      _count: { level: true }
    })

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      roleStats: roleStats.map(stat => ({
        role: stat.role,
        count: stat._count.role
      })),
      levelStats: levelStats.map(stat => ({
        level: stat.level,
        count: stat._count.level
      }))
    }
  }

  // Search users
  async searchUsers(query: string, limit: number = 10) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        account: {
          select: {
            role: true
          }
        },
        userSkills: {
          include: {
            skill: true
          }
        }
      },
      take: limit
    })
  }

  // Get users by role
  async getUsersByRole(role: Role) {
    return await prisma.user.findMany({
      where: {
        account: {
          role
        }
      },
      include: {
        account: {
          select: {
            role: true
          }
        }
      }
    })
  }

  // Get recently active users
  async getRecentlyActiveUsers(limit: number = 10) {
    return await prisma.user.findMany({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: {
        lastActive: 'desc'
      },
      take: limit,
      include: {
        account: {
          select: {
            role: true
          }
        }
      }
    })
  }
}
