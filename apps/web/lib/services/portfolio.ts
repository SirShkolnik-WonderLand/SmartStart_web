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
  private static API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  static async getPortfolioStats(userId: string): Promise<PortfolioStats> {
    // TODO: Replace with real API call when backend is ready
    // For now, return realistic mock data that matches the database structure
    return {
      totalValue: 2500000,
      activeProjects: 5,
      teamSize: 12,
      totalEquity: 35,
      monthlyGrowth: 15.2,
      totalContributions: 25,
      systemHealth: 'GOOD',
      lastUpdated: new Date().toISOString()
    };
  }

  static async getProjects(userId: string): Promise<Project[]> {
    // TODO: Replace with real API call when backend is ready
    // For now, return realistic mock data that matches the database structure
    return [
      {
        id: '1',
        name: 'SmartStart Platform',
        summary: 'Community-driven development platform for building ventures together with transparent equity tracking, smart contracts, and collaborative project management.',
        progress: 75,
        equity: 35,
        nextMilestone: 'Launch v2.0',
        daysToMilestone: 3,
        status: 'LAUNCHING',
        teamSize: 4,
        totalValue: 1500000,
        contractVersion: 'v2.0',
        equityModel: 'DYNAMIC',
        vestingSchedule: 'IMMEDIATE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: 'owner-1',
          name: 'Udi Shkolnik',
          email: 'owner@demo.local'
        }
      },
      {
        id: '2',
        name: 'AI Marketing Tool',
        summary: 'AI-powered marketing automation platform for small businesses.',
        progress: 45,
        equity: 20,
        nextMilestone: 'Beta Testing',
        daysToMilestone: 7,
        status: 'ACTIVE',
        teamSize: 3,
        totalValue: 500000,
        contractVersion: 'v1.0',
        equityModel: 'DYNAMIC',
        vestingSchedule: 'IMMEDIATE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: 'owner-1',
          name: 'Udi Shkolnik',
          email: 'owner@demo.local'
        }
      },
      {
        id: '3',
        name: 'E-commerce Platform',
        summary: 'Modern e-commerce platform with advanced features.',
        progress: 30,
        equity: 15,
        nextMilestone: 'MVP Development',
        daysToMilestone: 14,
        status: 'PLANNING',
        teamSize: 2,
        totalValue: 300000,
        contractVersion: 'v1.0',
        equityModel: 'DYNAMIC',
        vestingSchedule: 'IMMEDIATE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: 'owner-1',
          name: 'Udi Shkolnik',
          email: 'owner@demo.local'
        }
      },
      {
        id: '4',
        name: 'Mobile App Framework',
        summary: 'Cross-platform mobile development framework for rapid app creation.',
        progress: 60,
        equity: 10,
        nextMilestone: 'Framework Release',
        daysToMilestone: 5,
        status: 'ACTIVE',
        teamSize: 3,
        totalValue: 200000,
        contractVersion: 'v1.5',
        equityModel: 'DYNAMIC',
        vestingSchedule: 'IMMEDIATE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: 'owner-1',
          name: 'Udi Shkolnik',
          email: 'owner@demo.local'
        }
      }
    ];
  }

  static async getRecentActivity(userId: string, limit: number = 10): Promise<Activity[]> {
    // TODO: Replace with real API call when backend is ready
    // For now, return realistic mock data that matches the database structure
    const activities: Activity[] = [
      {
        id: '1',
        type: 'MILESTONE',
        message: 'Contribution submitted for Build authentication system',
        timestamp: new Date().toISOString(),
        projectId: '1',
        projectName: 'SmartStart Platform',
        severity: 'SUCCESS',
        userId: 'contrib-1',
        userName: 'Demo Contributor'
      },
      {
        id: '2',
        type: 'EQUITY',
        message: 'Equity distribution completed for AI Marketing Tool',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        projectId: '2',
        projectName: 'AI Marketing Tool',
        severity: 'SUCCESS',
        userId: 'owner-1',
        userName: 'Udi Shkolnik'
      },
      {
        id: '3',
        type: 'CONTRACT',
        message: 'Smart contract deployed for E-commerce Platform',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        projectId: '3',
        projectName: 'E-commerce Platform',
        severity: 'INFO',
        userId: 'owner-1',
        userName: 'Udi Shkolnik'
      },
      {
        id: '4',
        type: 'TEAM',
        message: 'New team member joined Mobile App Framework project',
        timestamp: new Date(Date.now() - 432000000).toISOString(),
        projectId: '4',
        projectName: 'Mobile App Framework',
        severity: 'SUCCESS',
        userId: 'team-1',
        userName: 'Sarah Johnson'
      },
      {
        id: '5',
        type: 'SYSTEM',
        message: 'System backup completed successfully',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        severity: 'INFO',
        userId: 'system',
        userName: 'System'
      }
    ];
    
    return activities.slice(0, limit);
  }

  // Real API methods for when backend is ready
  static async getPortfolioStatsFromAPI(userId: string): Promise<PortfolioStats> {
    try {
      const response = await fetch(`${this.API_BASE}/api/portfolio/stats?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch portfolio stats');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching portfolio stats:', error);
      throw new Error(`Failed to fetch portfolio stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getProjectsFromAPI(userId: string): Promise<Project[]> {
    try {
      const response = await fetch(`${this.API_BASE}/api/portfolio/projects?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch projects');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getRecentActivityFromAPI(userId: string, limit: number = 10): Promise<Activity[]> {
    try {
      const response = await fetch(`${this.API_BASE}/api/portfolio/activity?userId=${userId}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch recent activity');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw new Error(`Failed to fetch recent activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
