import { PrismaClient } from '@prisma/client';
import { AuditEventService } from './AuditEventService.js';

const prisma = new PrismaClient();

export class SmartDataService {
  private auditService: AuditEventService;

  constructor() {
    this.auditService = new AuditEventService();
  }

  // ============================================================================
  // USER PORTFOLIO & INSIGHTS
  // ============================================================================

  /**
   * Get comprehensive user portfolio with smart insights
   */
  async getUserPortfolio(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projectMemberships: {
          include: {
            project: {
              include: {
                capEntries: true,
                tasks: {
                  include: {
                    contributions: true
                  }
                },
                insights: true
              }
            }
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
        activityLog: {
          orderBy: { createdAt: 'desc' },
          take: 10
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
        }
      }
    });

    if (!user) throw new Error('User not found');

    // Calculate smart portfolio metrics
    const portfolioMetrics = await this.calculatePortfolioMetrics(userId);
    
    // Get smart insights
    const insights = await this.generateUserInsights(userId);
    
    // Get collaboration opportunities
    const opportunities = await this.findCollaborationOpportunities(userId);

    return {
      user: {
        ...user,
        ...portfolioMetrics
      },
      insights,
      opportunities,
      recentActivity: user.activityLog,
      badges: user.userBadges,
      skills: user.userSkills
    };
  }

  /**
   * Calculate comprehensive portfolio metrics
   */
  private async calculatePortfolioMetrics(userId: string) {
    const [
      totalPortfolioValue,
      activeProjectsCount,
      totalContributions,
      completionRate,
      reputation
    ] = await Promise.all([
      this.calculateTotalPortfolioValue(userId),
      this.getActiveProjectsCount(userId),
      this.getTotalContributions(userId),
      this.calculateCompletionRate(userId),
      this.calculateReputation(userId)
    ]);

    return {
      totalPortfolioValue,
      activeProjectsCount,
      totalContributions,
      completionRate,
      reputation
    };
  }

  /**
   * Calculate total portfolio value across all projects
   */
  private async calculateTotalPortfolioValue(userId: string): Promise<number> {
    const memberships = await prisma.projectMember.findMany({
      where: { userId, isActive: true },
      include: {
        project: {
          include: {
            capEntries: {
              where: { holderId: userId }
            }
          }
        }
      }
    });

    let totalValue = 0;
    for (const membership of memberships) {
      const userEquity = membership.project.capEntries.reduce((sum, entry) => sum + entry.pct, 0);
      const projectValue = membership.project.totalValue || 0;
      totalValue += (userEquity / 100) * projectValue;
    }

    return totalValue;
  }

  /**
   * Get count of active projects
   */
  private async getActiveProjectsCount(userId: string): Promise<number> {
    return await prisma.projectMember.count({
      where: { userId, isActive: true }
    });
  }

  /**
   * Get total contributions count
   */
  private async getTotalContributions(userId: string): Promise<number> {
    return await prisma.contribution.count({
      where: { contributorId: userId, status: 'APPROVED' }
    });
  }

  /**
   * Calculate completion rate across all tasks
   */
  private async calculateCompletionRate(userId: string): Promise<number> {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId }
    });

    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(task => task.status === 'DONE').length;
    return (completedTasks / tasks.length) * 100;
  }

  /**
   * Calculate user reputation based on contributions and kudos
   */
  private async calculateReputation(userId: string): Promise<number> {
    const [contributions, kudos] = await Promise.all([
      prisma.contribution.findMany({
        where: { contributorId: userId, status: 'APPROVED' }
      }),
      prisma.kudos.findMany({
        where: { toUserId: userId }
      })
    ]);

    const contributionScore = contributions.reduce((sum, c) => sum + c.quality + c.collaboration, 0);
    const kudosScore = kudos.reduce((sum, k) => sum + k.impact, 0);

    return contributionScore + kudosScore;
  }

  // ============================================================================
  // PROJECT INTELLIGENCE
  // ============================================================================

  /**
   * Get comprehensive project data with smart insights
   */
  async getProjectIntelligence(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
        members: {
          include: {
            user: true
          }
        },
        capEntries: true,
        tasks: {
          include: {
            assignee: true,
            contributions: true
          }
        },
        sprints: {
          include: {
            tasks: true
          }
        },
        ideas: {
          include: {
            proposer: true,
            insights: true
          }
        },
        polls: {
          include: {
            votes: true
          }
        },
        insights: true,
        meshItems: {
          include: {
            author: true,
            reactions: true
          }
        }
      }
    });

    if (!project) throw new Error('Project not found');

    // Calculate smart project metrics
    const metrics = await this.calculateProjectMetrics(projectId);
    
    // Generate project insights
    const insights = await this.generateProjectInsights(projectId);
    
    // Get team performance analytics
    const teamAnalytics = await this.getTeamPerformanceAnalytics(projectId);

    return {
      project: {
        ...project,
        ...metrics
      },
      insights,
      teamAnalytics
    };
  }

  /**
   * Calculate comprehensive project metrics
   */
  private async calculateProjectMetrics(projectId: string) {
    const [
      totalValue,
      activeMembers,
      completionRate,
      lastActivity
    ] = await Promise.all([
      this.calculateProjectValue(projectId),
      this.getActiveMembersCount(projectId),
      this.calculateProjectCompletionRate(projectId),
      this.getLastProjectActivity(projectId)
    ]);

    return {
      totalValue,
      activeMembers,
      completionRate,
      lastActivity
    };
  }

  /**
   * Calculate project total value from cap table
   */
  private async calculateProjectValue(projectId: string): Promise<number> {
    // This would typically come from external valuation or market data
    // For now, we'll use a base value that can be updated
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        capEntries: true
      }
    });

    if (!project) return 0;

    // Base value calculation (can be enhanced with real market data)
    const baseValue = 100000; // $100K base value
    const multiplier = 1 + (project.capEntries.length * 0.1); // 10% per stakeholder
    
    return baseValue * multiplier;
  }

  /**
   * Get count of active project members
   */
  private async getActiveMembersCount(projectId: string): Promise<number> {
    return await prisma.projectMember.count({
      where: { projectId, isActive: true }
    });
  }

  /**
   * Calculate project completion rate
   */
  private async calculateProjectCompletionRate(projectId: string): Promise<number> {
    const tasks = await prisma.task.findMany({
      where: { projectId }
    });

    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(task => task.status === 'DONE').length;
    return (completedTasks / tasks.length) * 100;
  }

  /**
   * Get last project activity
   */
  private async getLastProjectActivity(projectId: string): Promise<Date> {
    const activities = await Promise.all([
      prisma.task.findFirst({
        where: { projectId },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.contribution.findFirst({
        where: { task: { projectId } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.message.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const dates = activities
      .filter(Boolean)
      .map(activity => activity?.updatedAt || activity?.createdAt)
      .filter(Boolean);

    return dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();
  }

  // ============================================================================
  // COMMUNITY INTELLIGENCE
  // ============================================================================

  /**
   * Get comprehensive community insights
   */
  async getCommunityIntelligence() {
    const [
      trendingTopics,
      collaborationOpportunities,
      communityHealth,
      activeMembers
    ] = await Promise.all([
      this.getTrendingTopics(),
      this.findCollaborationOpportunities(),
      this.assessCommunityHealth(),
      this.getActiveCommunityMembers()
    ]);

    return {
      trendingTopics,
      collaborationOpportunities,
      communityHealth,
      activeMembers
    };
  }

  /**
   * Get trending topics across the community
   */
  private async getTrendingTopics() {
    const ideas = await prisma.idea.findMany({
      where: { votes: { gt: 0 } },
      orderBy: { votes: 'desc' },
      take: 10,
      include: {
        proposer: true,
        project: true
      }
    });

    const polls = await prisma.poll.findMany({
      where: { isActive: true },
      orderBy: { totalVotes: 'desc' },
      take: 5,
      include: {
        project: true
      }
    });

    const meshItems = await prisma.meshItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        author: true,
        project: true,
        reactions: true
      }
    });

    return {
      ideas,
      polls,
      meshItems
    };
  }

  /**
   * Find collaboration opportunities
   */
  private async findCollaborationOpportunities(userId?: string) {
    const needsHelp = await prisma.meshItem.findMany({
      where: { type: 'NEED_HELP' },
      include: {
        author: true,
        project: true
      },
      orderBy: { priority: 'desc' }
    });

    const openTasks = await prisma.task.findMany({
      where: { 
        status: 'TODO',
        assigneeId: null
      },
      include: {
        project: true
      },
      orderBy: { priority: 'desc' }
    });

    const collaborationIdeas = await prisma.idea.findMany({
      where: { 
        status: 'REVIEW',
        votes: { gt: 2 }
      },
      include: {
        proposer: true,
        project: true
      }
    });

    return {
      needsHelp,
      openTasks,
      collaborationIdeas
    };
  }

  /**
   * Assess overall community health
   */
  private async assessCommunityHealth() {
    const [
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      totalContributions,
      recentActivity
    ] = await Promise.all([
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ 
        where: { 
          status: 'ACTIVE',
          lastActive: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.project.count(),
      prisma.project.count({ 
        where: { 
          lastActivity: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.contribution.count({ where: { status: 'APPROVED' } }),
      prisma.userActivity.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    const activityScore = (recentActivity / totalUsers) * 100;
    const projectHealth = (activeProjects / totalProjects) * 100;
    const userEngagement = (activeUsers / totalUsers) * 100;

    return {
      metrics: {
        totalUsers,
        activeUsers,
        totalProjects,
        activeProjects,
        totalContributions,
        recentActivity
      },
      health: {
        activityScore,
        projectHealth,
        userEngagement,
        overall: (activityScore + projectHealth + userEngagement) / 3
      }
    };
  }

  /**
   * Get active community members
   */
  private async getActiveCommunityMembers() {
    return await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        lastActive: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      include: {
        userSkills: {
          include: {
            skill: true
          }
        },
        userBadges: {
          include: {
            badge: true
          }
        }
      },
      orderBy: { reputation: 'desc' },
      take: 20
    });
  }

  // ============================================================================
  // SMART INSIGHTS GENERATION
  // ============================================================================

  /**
   * Generate user-specific insights
   */
  private async generateUserInsights(userId: string) {
    const insights = [];

    // Skill gap analysis
    const skillGaps = await this.analyzeSkillGaps(userId);
    if (skillGaps.length > 0) {
      insights.push({
        type: 'SKILL_GAP',
        title: 'Skill Development Opportunities',
        description: `Consider developing these skills: ${skillGaps.join(', ')}`,
        priority: 3,
        confidence: 0.8
      });
    }

    // Collaboration opportunities
    const collabOpps = await this.findUserCollaborationOpportunities(userId);
    if (collabOpps.length > 0) {
      insights.push({
        type: 'COLLABORATION',
        title: 'Collaboration Opportunities',
        description: `${collabOpps.length} projects could benefit from your skills`,
        priority: 2,
        confidence: 0.7
      });
    }

    // Portfolio optimization
    const portfolioInsights = await this.analyzePortfolioOptimization(userId);
    if (portfolioInsights.length > 0) {
      insights.push(...portfolioInsights);
    }

    return insights;
  }

  /**
   * Generate project-specific insights
   */
  private async generateProjectInsights(projectId: string) {
    const insights = [];

    // Performance insights
    const performance = await this.analyzeProjectPerformance(projectId);
    if (performance) {
      insights.push(performance);
    }

    // Risk assessment
    const risks = await this.assessProjectRisks(projectId);
    if (risks.length > 0) {
      insights.push(...risks);
    }

    // Opportunity identification
    const opportunities = await this.identifyProjectOpportunities(projectId);
    if (opportunities.length > 0) {
      insights.push(...opportunities);
    }

    return insights;
  }

  /**
   * Analyze user skill gaps
   */
  private async analyzeSkillGaps(userId: string): Promise<string[]> {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true }
    });

    const userSkillNames = userSkills.map(us => us.skill.name);
    
    // Get high-demand skills the user doesn't have
    const highDemandSkills = await prisma.skill.findMany({
      where: {
        demand: { gte: 4 },
        name: { notIn: userSkillNames }
      }
    });

    return highDemandSkills.map(skill => skill.name);
  }

  /**
   * Find user-specific collaboration opportunities
   */
  private async findUserCollaborationOpportunities(userId: string) {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true }
    });

    const skillNames = userSkills.map(us => us.skill.name);

    // Find tasks that match user skills
    const matchingTasks = await prisma.task.findMany({
      where: {
        status: 'TODO',
        assigneeId: null,
        project: {
          members: {
            some: { userId: { not: userId } }
          }
        }
      },
      include: {
        project: true
      }
    });

    return matchingTasks.filter(task => {
      // Simple skill matching (can be enhanced with AI)
      return skillNames.some(skill => 
        task.title.toLowerCase().includes(skill.toLowerCase())
      );
    });
  }

  /**
   * Analyze portfolio optimization opportunities
   */
  private async analyzePortfolioOptimization(userId: string) {
    const insights = [];

    // Check for over-concentration
    const memberships = await prisma.projectMember.findMany({
      where: { userId, isActive: true },
      include: {
        project: {
          include: {
            capEntries: {
              where: { holderId: userId }
            }
          }
        }
      }
    });

    if (memberships.length === 1) {
      insights.push({
        type: 'PORTFOLIO_DIVERSIFICATION',
        title: 'Consider Portfolio Diversification',
        description: 'You\'re currently invested in only one project. Consider exploring other opportunities.',
        priority: 2,
        confidence: 0.6
      });
    }

    return insights;
  }

  /**
   * Analyze project performance
   */
  private async analyzeProjectPerformance(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        sprints: true
      }
    });

    if (!project) return null;

    const completionRate = project.tasks.length > 0 
      ? (project.tasks.filter(t => t.status === 'DONE').length / project.tasks.length) * 100
      : 0;

    if (completionRate < 50) {
      return {
        type: 'PERFORMANCE',
        title: 'Project Performance Alert',
        description: `Project completion rate is ${completionRate.toFixed(1)}%. Consider reviewing task assignments and priorities.`,
        priority: 4,
        confidence: 0.9
      };
    }

    return null;
  }

  /**
   * Assess project risks
   */
  private async assessProjectRisks(projectId: string) {
    const risks = [];

    // Check for overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        projectId,
        dueDate: { lt: new Date() },
        status: { not: 'DONE' }
      }
    });

    if (overdueTasks.length > 0) {
      risks.push({
        type: 'RISK',
        title: 'Overdue Tasks Detected',
        description: `${overdueTasks.length} tasks are overdue. This may impact project timeline.`,
        priority: 4,
        confidence: 0.8
      });
    }

    // Check for inactive members
    const inactiveMembers = await prisma.projectMember.findMany({
      where: {
        projectId,
        isActive: true,
        lastContribution: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    if (inactiveMembers.length > 0) {
      risks.push({
        type: 'RISK',
        title: 'Inactive Team Members',
        description: `${inactiveMembers.length} team members haven\'t contributed recently.`,
        priority: 3,
        confidence: 0.7
      });
    }

    return risks;
  }

  /**
   * Identify project opportunities
   */
  private async identifyProjectOpportunities(projectId: string) {
    const opportunities = [];

    // Check for high-vote ideas
    const popularIdeas = await prisma.idea.findMany({
      where: {
        projectId,
        votes: { gte: 5 }
      }
    });

    if (popularIdeas.length > 0) {
      opportunities.push({
        type: 'OPPORTUNITY',
        title: 'High-Interest Ideas',
        description: `${popularIdeas.length} ideas have strong community support. Consider prioritizing these.`,
        priority: 2,
        confidence: 0.8
      });
    }

    return opportunities;
  }

  // ============================================================================
  // TEAM PERFORMANCE ANALYTICS
  // ============================================================================

  /**
   * Get comprehensive team performance analytics
   */
  private async getTeamPerformanceAnalytics(projectId: string) {
    const members = await prisma.projectMember.findMany({
      where: { projectId, isActive: true },
      include: {
        user: true,
        project: {
          include: {
            tasks: {
              where: { assigneeId: { not: null } },
              include: {
                assignee: true,
                contributions: true
              }
            }
          }
        }
      }
    });

    const analytics = members.map(member => {
      const memberTasks = member.project.tasks.filter(t => t.assigneeId === member.userId);
      const completedTasks = memberTasks.filter(t => t.status === 'DONE').length;
      const totalEffort = memberTasks.reduce((sum, t) => sum + (t.effort || 0), 0);
      const avgQuality = memberTasks.length > 0 
        ? memberTasks.reduce((sum, t) => sum + (t.impact || 3), 0) / memberTasks.length
        : 0;

      return {
        userId: member.userId,
        userName: member.user.name,
        email: member.user.email,
        role: member.role,
        metrics: {
          totalTasks: memberTasks.length,
          completedTasks,
          completionRate: memberTasks.length > 0 ? (completedTasks / memberTasks.length) * 100 : 0,
          totalEffort,
          avgQuality,
          lastContribution: member.lastContribution
        }
      };
    });

    return analytics;
  }

  // ============================================================================
  // REAL-TIME UPDATES & NOTIFICATIONS
  // ============================================================================

  /**
   * Create smart notification based on user activity
   */
  async createSmartNotification(userId: string, type: string, data: any) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        kind: type,
        payload: data,
        priority: this.calculateNotificationPriority(type, data),
        actionUrl: this.generateActionUrl(type, data)
      }
    });

    // Log activity
    await this.logUserActivity(userId, type, data);

    return notification;
  }

  /**
   * Calculate notification priority
   */
  private calculateNotificationPriority(type: string, data: any): number {
    const priorityMap: { [key: string]: number } = {
      'TASK_ASSIGNED': 4,
      'CONTRIBUTION_APPROVED': 3,
      'IDEA_VOTED': 2,
      'POLL_CREATED': 2,
      'MESSAGE_RECEIVED': 1
    };

    return priorityMap[type] || 3;
  }

  /**
   * Generate action URL for notification
   */
  private generateActionUrl(type: string, data: any): string {
    const baseUrl = process.env.FRONTEND_URL || 'https://smartstart-web.onrender.com';
    
    switch (type) {
      case 'TASK_ASSIGNED':
        return `${baseUrl}/projects/${data.projectId}`;
      case 'CONTRIBUTION_APPROVED':
        return `${baseUrl}/portfolio`;
      case 'IDEA_VOTED':
        return `${baseUrl}/ideas`;
      case 'POLL_CREATED':
        return `${baseUrl}/polls`;
      case 'MESSAGE_RECEIVED':
        return `${baseUrl}/messages`;
      default:
        return baseUrl;
    }
  }

  /**
   * Log user activity
   */
  private async logUserActivity(userId: string, type: string, data: any) {
    await prisma.userActivity.create({
      data: {
        userId,
        type,
        entity: data.entityId,
        entityType: data.entityType,
        data
      }
    });

    // Update user's last active timestamp
    await prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() }
    });
  }

  // ============================================================================
  // DATA SYNCHRONIZATION & COMPUTED FIELDS
  // ============================================================================

  /**
   * Synchronize computed fields across all tables
   */
  async synchronizeComputedFields() {
    await Promise.all([
      this.syncUserPortfolioValues(),
      this.syncProjectMetrics(),
      this.syncTaskCompletionRates(),
      this.syncPollVoteCounts()
    ]);
  }

  /**
   * Sync user portfolio values
   */
  private async syncUserPortfolioValues() {
    const users = await prisma.user.findMany({
      include: {
        projectMemberships: {
          include: {
            project: {
              include: {
                capEntries: true
              }
            }
          }
        }
      }
    });

    for (const user of users) {
      const totalValue = await this.calculateTotalPortfolioValue(user.id);
      const activeProjects = await this.getActiveProjectsCount(user.id);
      const totalContributions = await this.getTotalContributions(user.id);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalPortfolioValue: totalValue,
          activeProjectsCount: activeProjects,
          totalContributions
        }
      });
    }
  }

  /**
   * Sync project metrics
   */
  private async syncProjectMetrics() {
    const projects = await prisma.project.findMany();

    for (const project of projects) {
      const totalValue = await this.calculateProjectValue(project.id);
      const activeMembers = await this.getActiveMembersCount(project.id);
      const completionRate = await this.calculateProjectCompletionRate(project.id);
      const lastActivity = await this.getLastProjectActivity(project.id);

      await prisma.project.update({
        where: { id: project.id },
        data: {
          totalValue,
          activeMembers,
          completionRate,
          lastActivity
        }
      });
    }
  }

  /**
   * Sync task completion rates
   */
  private async syncTaskCompletionRates() {
    const sprints = await prisma.sprint.findMany({
      include: { tasks: true }
    });

    for (const sprint of sprints) {
      if (sprint.tasks.length > 0) {
        const completedTasks = sprint.tasks.filter(t => t.status === 'DONE').length;
        const completionRate = (completedTasks / sprint.tasks.length) * 100;
        
        // Calculate velocity (completed tasks per day)
        const sprintDuration = (sprint.end.getTime() - sprint.start.getTime()) / (1000 * 60 * 60 * 24);
        const velocity = sprintDuration > 0 ? completedTasks / sprintDuration : 0;

        await prisma.sprint.update({
          where: { id: sprint.id },
          data: {
            completionRate,
            velocity
          }
        });
      }
    }
  }

  /**
   * Sync poll vote counts
   */
  private async syncPollVoteCounts() {
    const polls = await prisma.poll.findMany({
      include: { votes: true }
    });

    for (const poll of polls) {
      const totalVotes = poll.votes.length;
      const isActive = new Date() < poll.closesAt;

      await prisma.poll.update({
        where: { id: poll.id },
        data: {
          totalVotes,
          isActive
        }
      });
    }
  }
}

export default SmartDataService;
