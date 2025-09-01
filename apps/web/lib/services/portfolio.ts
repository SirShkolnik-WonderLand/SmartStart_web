import { prisma } from '../database';

export interface PortfolioStats {
  totalValue: number;
  activeProjects: number;
  teamSize: number;
  totalEquity: number;
  monthlyGrowth: number;
  totalContributions: number;
  systemHealth: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  lastUpdated: string;
}

export interface Project {
  id: string;
  name: string;
  summary: string;
  progress: number;
  equity: number;
  nextMilestone: string;
  daysToMilestone: number;
  status: 'ACTIVE' | 'LAUNCHING' | 'PLANNING' | 'COMPLETED' | 'PAUSED';
  teamSize: number;
  totalValue: number;
  contractVersion: string;
  equityModel: string;
  vestingSchedule: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Activity {
  id: string;
  type: 'EQUITY' | 'TEAM' | 'MILESTONE' | 'CONTRACT' | 'SYSTEM' | 'SECURITY';
  message: string;
  timestamp: string;
  projectId?: string;
  projectName?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  userId?: string;
  userName?: string;
}

export class PortfolioService {
  static async getPortfolioStats(userId: string): Promise<PortfolioStats> {
    try {
      // Get user's portfolio data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          projectMemberships: {
            include: {
              project: {
                include: {
                  capEntries: true,
                  members: true,
                  tasks: true,
                }
              }
            }
          },
          projectsOwned: {
            include: {
              capEntries: true,
              members: true,
              tasks: true,
            }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Calculate total portfolio value from all projects user is involved in
      const allProjects = [
        ...user.projectsOwned,
        ...user.projectMemberships.map(pm => pm.project)
      ];

      const totalValue = allProjects.reduce((sum, project) => {
        return sum + (project.totalValue || 0);
      }, 0);

      // Calculate active projects
      const activeProjects = allProjects.filter(project => 
        project.deletedAt === null && 
        project.completionRate < 100
      ).length;

      // Calculate team size (unique members across all projects)
      const uniqueMembers = new Set();
      allProjects.forEach(project => {
        project.members.forEach(member => {
          uniqueMembers.add(member.userId);
        });
      });

      // Calculate total equity owned
      const totalEquity = allProjects.reduce((sum, project) => {
        const userEquity = project.capEntries.find(entry => 
          entry.holderId === userId
        );
        return sum + (userEquity?.pct || 0);
      }, 0);

      // Calculate monthly growth (mock for now, would need historical data)
      const monthlyGrowth = 15.2; // This would be calculated from historical data

      // Calculate total contributions
      const totalContributions = await prisma.contribution.count({
        where: {
          contributorId: userId
        }
      });

      // Determine system health based on various metrics
      const systemHealth = this.calculateSystemHealth(allProjects);

      return {
        totalValue,
        activeProjects,
        teamSize: uniqueMembers.size,
        totalEquity,
        monthlyGrowth,
        totalContributions,
        systemHealth,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching portfolio stats:', error);
      throw error;
    }
  }

  static async getProjects(userId: string): Promise<Project[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          projectMemberships: {
            include: {
              project: {
                include: {
                  capEntries: true,
                  members: true,
                  tasks: true,
                  owner: true,
                }
              }
            }
          },
          projectsOwned: {
            include: {
              capEntries: true,
              members: true,
              tasks: true,
              owner: true,
            }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const allProjects = [
        ...user.projectsOwned,
        ...user.projectMemberships.map(pm => pm.project)
      ];

      return allProjects.map(project => {
        // Calculate user's equity in this project
        const userEquity = project.capEntries.find(entry => 
          entry.holderId === userId
        )?.pct || 0;

        // Calculate progress based on completed tasks
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(task => 
          task.status === 'DONE'
        ).length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Determine next milestone
        const nextMilestone = this.getNextMilestone(project);
        const daysToMilestone = this.getDaysToMilestone(project);

        // Determine project status
        const status = this.getProjectStatus(project);

        return {
          id: project.id,
          name: project.name,
          summary: project.summary || '',
          progress: Math.round(progress),
          equity: userEquity,
          nextMilestone,
          daysToMilestone,
          status,
          teamSize: project.members.length,
          totalValue: project.totalValue || 0,
          contractVersion: project.contractVersion,
          equityModel: project.equityModel,
          vestingSchedule: project.vestingSchedule,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          owner: {
            id: project.owner.id,
            name: project.owner.name || '',
            email: project.owner.email
          }
        };
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  static async getRecentActivity(userId: string, limit: number = 10): Promise<Activity[]> {
    try {
      // Get recent contributions
      const contributions = await prisma.contribution.findMany({
        where: {
          OR: [
            { contributorId: userId },
            {
              task: {
                project: {
                  OR: [
                    { ownerId: userId },
                    { members: { some: { userId: userId } } }
                  ]
                }
              }
            }
          ]
        },
        include: {
          contributor: true,
          task: {
            include: {
              project: true
            }
          }
        },
        take: limit
      });

      // Get recent project insights
      const insights = await prisma.projectInsight.findMany({
        where: {
          project: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId: userId } } }
            ]
          }
        },
        include: {
          project: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      // Combine and format activities
      const activities: Activity[] = [];

      contributions.forEach(contribution => {
        activities.push({
          id: contribution.id,
          type: 'MILESTONE',
          message: `Contribution submitted for ${contribution.task?.title || 'task'}`,
          timestamp: new Date().toISOString(), // Contribution doesn't have createdAt, using current time
          projectId: contribution.task?.projectId,
          projectName: contribution.task?.project?.name,
          severity: 'SUCCESS',
          userId: contribution.contributorId,
          userName: contribution.contributor.name || contribution.contributor.email
        });
      });

      insights.forEach(insight => {
        activities.push({
          id: insight.id,
          type: 'SYSTEM',
          message: insight.title,
          timestamp: insight.createdAt.toISOString(),
          projectId: insight.projectId,
          projectName: insight.project.name,
          severity: 'INFO',
          userId: undefined,
          userName: undefined
        });
      });

      // Sort by timestamp and return limited results
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  private static calculateSystemHealth(projects: any[]): 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' {
    // Simple health calculation based on project completion rates
    const avgCompletion = projects.reduce((sum, project) => 
      sum + (project.completionRate || 0), 0
    ) / Math.max(projects.length, 1);

    if (avgCompletion >= 80) return 'EXCELLENT';
    if (avgCompletion >= 60) return 'GOOD';
    if (avgCompletion >= 40) return 'WARNING';
    return 'CRITICAL';
  }

  private static getNextMilestone(project: any): string {
    // Simple milestone logic - in real app this would be more sophisticated
    if (project.completionRate < 25) return 'Project Setup';
    if (project.completionRate < 50) return 'MVP Development';
    if (project.completionRate < 75) return 'Beta Testing';
    if (project.completionRate < 90) return 'Launch Preparation';
    return 'Project Launch';
  }

  private static getDaysToMilestone(project: any): number {
    // Mock calculation - in real app this would be based on actual milestones
    const progress = project.completionRate || 0;
    if (progress < 25) return 14;
    if (progress < 50) return 21;
    if (progress < 75) return 7;
    if (progress < 90) return 3;
    return 1;
  }

  private static getProjectStatus(project: any): 'ACTIVE' | 'LAUNCHING' | 'PLANNING' | 'COMPLETED' | 'PAUSED' {
    const progress = project.completionRate || 0;
    if (progress >= 100) return 'COMPLETED';
    if (progress >= 90) return 'LAUNCHING';
    if (progress >= 50) return 'ACTIVE';
    if (progress >= 10) return 'PLANNING';
    return 'PLANNING';
  }
}
