// Equity Management Feature
// Handles portfolio equity tracking, visualization, and management
// Based on AliceSolutions Ventures Equity Framework

import { apiCallWithAuth } from '../../utils/api';

export interface EquityPortfolio {
  totalEquityOwned: number;
  averageEquityPerProject: number;
  portfolioDiversity: number;
  highestEquityProject: string;
  lowestEquityProject: string;
  equityGrowthRate: number;
  riskScore: number;
  opportunityScore: number;
  projects: EquityProject[];
}

export interface EquityProject {
  id: string;
  name: string;
  userRole: 'OWNER' | 'ADMIN' | 'CONTRIBUTOR' | 'MEMBER';
  userOwnership: number;
  totalValue: number;
  completionRate: number;
  lastActivity: Date;
  equityBreakdown: {
    owner: number;
    aliceSolutions: number;
    contributors: number;
    reserve: number;
  };
  vestingSchedule: EquityVestingSchedule;
  contributions: Contribution[];
}

export interface Contribution {
  id: string;
  type: 'CODE' | 'DESIGN' | 'MARKETING' | 'OPS' | 'SALES' | 'COMPLIANCE';
  description: string;
  equityEarned: number;
  effort: number;
  impact: number;
  date: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface EquityVestingSchedule {
  type: 'IMMEDIATE' | 'CLIFF' | 'GRADUAL';
  startDate: Date;
  endDate?: Date;
  cliffDate?: Date;
  vestedPercentage: number;
  totalEquity: number;
}

export interface EquityInsight {
  type: 'DIVERSIFICATION' | 'CONCENTRATION' | 'GROWTH' | 'RISK';
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  recommendations: string[];
}

// Equity Management Service
export class EquityManagementService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  // Fetch user's equity portfolio
  async fetchEquityPortfolio(userId: string): Promise<EquityPortfolio> {
    try {
      const response = await apiCallWithAuth(`/smart-contracts/portfolio-insights/${userId}`, this.token);
      return this.transformPortfolioData(response);
    } catch (error) {
      console.error('Error fetching equity portfolio:', error);
      throw error;
    }
  }

  // Get equity insights and recommendations
  async getEquityInsights(userId: string): Promise<EquityInsight[]> {
    try {
      const portfolio = await this.fetchEquityPortfolio(userId);
      return this.generateEquityInsights(portfolio);
    } catch (error) {
      console.error('Error generating equity insights:', error);
      return [];
    }
  }

  // Calculate portfolio diversity score
  calculatePortfolioDiversity(projects: EquityProject[]): number {
    if (projects.length <= 1) return 0;
    
    const categories = new Set(projects.map(p => p.userRole));
    const totalProjects = projects.length;
    
    // Diversity based on role distribution and project types
    const roleDiversity = categories.size / totalProjects;
    const valueDistribution = this.calculateValueDistribution(projects);
    
    return (roleDiversity + valueDistribution) / 2;
  }

  // Calculate risk score based on portfolio concentration
  calculateRiskScore(projects: EquityProject[]): number {
    if (projects.length === 0) return 0;
    
    const totalValue = projects.reduce((sum, p) => sum + p.totalValue, 0);
    const maxProjectValue = Math.max(...projects.map(p => p.totalValue));
    
    // Risk increases with concentration in single project
    const concentrationRisk = maxProjectValue / totalValue;
    
    // Risk decreases with more projects
    const diversificationBenefit = Math.min(1, projects.length / 5);
    
    return Math.max(0, concentrationRisk - diversificationBenefit);
  }

  // Calculate opportunity score
  calculateOpportunityScore(projects: EquityProject[]): number {
    if (projects.length === 0) return 0;
    
    const avgCompletion = projects.reduce((sum, p) => sum + p.completionRate, 0) / projects.length;
    const activeProjects = projects.filter(p => p.completionRate < 100).length;
    const recentActivity = projects.filter(p => 
      new Date().getTime() - p.lastActivity.getTime() < 30 * 24 * 60 * 60 * 1000
    ).length;
    
    return (avgCompletion + (activeProjects / projects.length) * 100 + (recentActivity / projects.length) * 100) / 3;
  }

  // Private helper methods
  private transformPortfolioData(data: any): EquityPortfolio {
    return {
      totalEquityOwned: data.totalEquityOwned || 0,
      averageEquityPerProject: data.averageEquityPerProject || 0,
      portfolioDiversity: data.portfolioDiversity || 0,
      highestEquityProject: data.highestEquityProject || '',
      lowestEquityProject: data.lowestEquityProject || '',
      equityGrowthRate: data.equityGrowthRate || 0,
      riskScore: data.riskScore || 0,
      opportunityScore: data.opportunityScore || 0,
      projects: data.projects || []
    };
  }

  private generateEquityInsights(portfolio: EquityPortfolio): EquityInsight[] {
    const insights: EquityInsight[] = [];

    // Diversification insight
    if (portfolio.portfolioDiversity < 0.5) {
      insights.push({
        type: 'DIVERSIFICATION',
        title: 'Portfolio Concentration Risk',
        description: 'Your portfolio is concentrated in a few projects. Consider diversifying to reduce risk.',
        priority: 'HIGH',
        confidence: 0.85,
        recommendations: [
          'Contribute to different project types',
          'Seek opportunities in new domains',
          'Consider smaller equity stakes in more projects'
        ]
      });
    }

    // Growth insight
    if (portfolio.equityGrowthRate < 0.1) {
      insights.push({
        type: 'GROWTH',
        title: 'Slow Equity Growth',
        description: 'Your equity growth rate is below optimal levels. Focus on high-impact contributions.',
        priority: 'MEDIUM',
        confidence: 0.75,
        recommendations: [
          'Target high-value projects',
          'Increase contribution frequency',
          'Focus on strategic skills development'
        ]
      });
    }

    // Risk insight
    if (portfolio.riskScore > 0.7) {
      insights.push({
        type: 'RISK',
        title: 'High Portfolio Risk',
        description: 'Your portfolio has high concentration risk. Consider rebalancing.',
        priority: 'CRITICAL',
        confidence: 0.9,
        recommendations: [
          'Diversify across more projects',
          'Reduce exposure to single large project',
          'Build emergency fund from equity sales'
        ]
      });
    }

    return insights;
  }

  private calculateValueDistribution(projects: EquityProject[]): number {
    if (projects.length === 0) return 0;
    
    const totalValue = projects.reduce((sum, p) => sum + p.totalValue, 0);
    const values = projects.map(p => p.totalValue / totalValue);
    
    // Calculate Gini coefficient (lower is better for distribution)
    const sortedValues = values.sort((a, b) => a - b);
    const n = sortedValues.length;
    let sum = 0;
    
    for (let i = 0; i < n; i++) {
      sum += (2 * (i + 1) - n - 1) * sortedValues[i];
    }
    
    const gini = sum / (n * n * sortedValues.reduce((a, b) => a + b, 0));
    return Math.max(0, 1 - gini); // Convert to distribution score
  }
}

// Equity Management Hooks
export const useEquityManagement = (token: string) => {
  const service = new EquityManagementService(token);

  const fetchPortfolio = async (userId: string) => {
    return await service.fetchEquityPortfolio(userId);
  };

  const getInsights = async (userId: string) => {
    return await service.getEquityInsights(userId);
  };

  const calculateDiversity = (projects: EquityProject[]) => {
    return service.calculatePortfolioDiversity(projects);
  };

  const calculateRisk = (projects: EquityProject[]) => {
    return service.calculateRiskScore(projects);
  };

  const calculateOpportunity = (projects: EquityProject[]) => {
    return service.calculateOpportunityScore(projects);
  };

  return {
    fetchPortfolio,
    getInsights,
    calculateDiversity,
    calculateRisk,
    calculateOpportunity
  };
};
