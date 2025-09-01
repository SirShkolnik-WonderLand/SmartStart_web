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

  static async getProjects(userId: string): Promise<Project[]> {
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

  static async getRecentActivity(userId: string, limit: number = 10): Promise<Activity[]> {
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
