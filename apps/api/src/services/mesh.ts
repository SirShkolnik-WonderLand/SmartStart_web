import { PrismaClient } from '@prisma/client'
import { MeshItemType, MeshPriority, InsightType } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateMeshItemData {
  type: MeshItemType
  title: string
  description: string
  authorId: string
  projectId?: string
  priority?: MeshPriority
  metadata?: any
}

export interface CreateInsightData {
  type: InsightType
  title: string
  description: string
  priority: number
  confidence: number
  actionItems: string[]
  relevantUsers: string[]
}

export class MeshService {
  // Create a new mesh item
  async createMeshItem(data: CreateMeshItemData) {
    return await prisma.meshItem.create({
      data: {
        ...data,
        metadata: data.metadata || undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })
  }

  // Get mesh items with filtering
  async getMeshItems(filters?: {
    type?: MeshItemType
    projectId?: string
    authorId?: string
    priority?: MeshPriority
    limit?: number
    offset?: number
  }) {
    const where: any = {}
    
    if (filters?.type) where.type = filters.type
    if (filters?.projectId) where.projectId = filters.projectId
    if (filters?.authorId) where.authorId = filters.authorId
    if (filters?.priority) where.priority = filters.priority

    return await prisma.meshItem.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    })
  }

  // Add reaction to mesh item
  async addReaction(meshItemId: string, userId: string, emoji: string) {
    return await prisma.meshReaction.create({
      data: {
        meshItemId,
        userId,
        emoji
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  // Remove reaction from mesh item
  async removeReaction(meshItemId: string, userId: string, emoji: string) {
    return await prisma.meshReaction.deleteMany({
      where: {
        meshItemId,
        userId,
        emoji
      }
    })
  }

  // Create community insight
  async createInsight(data: CreateInsightData) {
    return await prisma.communityInsight.create({
      data: {
        ...data,
        actionItems: JSON.stringify(data.actionItems),
        relevantUsers: JSON.stringify(data.relevantUsers)
      }
    })
  }

  // Get community insights
  async getInsights(filters?: {
    type?: InsightType
    priority?: number
    limit?: number
  }) {
    const where: any = {}
    
    if (filters?.type) where.type = filters.type
    if (filters?.priority) where.priority = filters.priority

    return await prisma.communityInsight.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: filters?.limit || 10
    })
  }

  // Get mesh statistics
  async getMeshStats() {
    const [totalItems, totalReactions, activeUsers] = await Promise.all([
      prisma.meshItem.count(),
      prisma.meshReaction.count(),
      prisma.user.count({
        where: {
          lastActive: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ])

    return {
      totalItems,
      totalReactions,
      activeUsers
    }
  }

  // Generate AI insights based on community activity
  async generateInsights() {
    // This would integrate with AI service to generate insights
    // For now, return mock insights
    const insights = [
      {
        type: 'TRENDING' as InsightType,
        title: 'AI & Machine Learning Projects',
        description: '3 out of 5 active projects involve AI/ML components. Community interest in AI is at an all-time high.',
        priority: 8,
        confidence: 0.85,
        actionItems: ['Consider AI-focused community challenge', 'Share AI/ML resources', 'Connect AI enthusiasts'],
        relevantUsers: ['user-1', 'user-4', 'user-6']
      },
      {
        type: 'OPPORTUNITY' as InsightType,
        title: 'Growth Marketing Skills Gap',
        description: 'Multiple projects seeking growth marketing help. Consider organizing a growth sprint or skill-sharing session.',
        priority: 9,
        confidence: 0.92,
        actionItems: ['Organize growth marketing workshop', 'Create skill-sharing program', 'Match projects with available talent'],
        relevantUsers: ['user-2', 'user-5']
      }
    ]

    // Save insights to database
    for (const insight of insights) {
      await this.createInsight(insight)
    }

    return insights
  }
}
