// Portfolio Analytics Feature
// Comprehensive portfolio analysis and visualization data

import { apiCallWithAuth } from '../../utils/api';

export interface PortfolioAnalytics {
  overview: PortfolioOverview;
  performance: PerformanceMetrics;
  diversification: DiversificationAnalysis;
  trends: TrendAnalysis;
  projections: ProjectionData;
  riskAnalysis: RiskAnalysis;
}

export interface PortfolioOverview {
  totalValue: number;
  totalEquity: number;
  projectCount: number;
  activeProjects: number;
  completionRate: number;
  growthRate: number;
  lastUpdated: Date;
}

export interface PerformanceMetrics {
  totalReturn: number;
  monthlyReturn: number;
  annualizedReturn: number;
  bestPerformer: ProjectPerformance;
  worstPerformer: ProjectPerformance;
  performanceHistory: PerformancePoint[];
}

export interface ProjectPerformance {
  projectId: string;
  projectName: string;
  return: number;
  equityValue: number;
  growthRate: number;
}

export interface PerformancePoint {
  date: Date;
  value: number;
  equity: number;
  projects: number;
}

export interface DiversificationAnalysis {
  sectorBreakdown: SectorBreakdown[];
  roleBreakdown: RoleBreakdown[];
  geographicBreakdown: GeographicBreakdown[];
  concentrationRisk: number;
  diversificationScore: number;
}

export interface SectorBreakdown {
  sector: string;
  value: number;
  percentage: number;
  projectCount: number;
}

export interface RoleBreakdown {
  role: string;
  value: number;
  percentage: number;
  projectCount: number;
}

export interface GeographicBreakdown {
  region: string;
  value: number;
  percentage: number;
  projectCount: number;
}

export interface TrendAnalysis {
  equityGrowth: TrendLine[];
  valueGrowth: TrendLine[];
  projectGrowth: TrendLine[];
  activityTrend: TrendLine[];
}

export interface TrendLine {
  period: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface ProjectionData {
  shortTerm: Projection;
  mediumTerm: Projection;
  longTerm: Projection;
  scenarios: ProjectionScenario[];
}

export interface Projection {
  timeframe: string;
  projectedValue: number;
  projectedEquity: number;
  confidence: number;
  assumptions: string[];
}

export interface ProjectionScenario {
  name: string;
  probability: number;
  projectedValue: number;
  projectedEquity: number;
  description: string;
}

export interface RiskAnalysis {
  overallRisk: number;
  riskFactors: RiskFactor[];
  riskMitigation: RiskMitigation[];
  stressTest: StressTestResult;
}

export interface RiskFactor {
  factor: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  description: string;
  mitigation: string;
}

export interface RiskMitigation {
  strategy: string;
  effectiveness: number;
  cost: number;
  implementation: string;
}

export interface StressTestResult {
  scenario: string;
  impact: number;
  probability: number;
  recommendations: string[];
}

export class PortfolioAnalyticsService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getAnalytics(userId: string): Promise<PortfolioAnalytics> {
    try {
      const response = await apiCallWithAuth(`/users/${userId}/portfolio-analytics`, this.token);
      return this.transformAnalyticsData(response);
    } catch (error) {
      console.error('Error fetching portfolio analytics:', error);
      return this.generateDefaultAnalytics();
    }
  }

  async getPerformanceHistory(userId: string, period: string): Promise<PerformancePoint[]> {
    try {
      const response = await apiCallWithAuth(`/users/${userId}/performance-history?period=${period}`, this.token);
      return response.history || [];
    } catch (error) {
      console.error('Error fetching performance history:', error);
      return [];
    }
  }

  async getProjections(userId: string): Promise<ProjectionData> {
    try {
      const response = await apiCallWithAuth(`/users/${userId}/projections`, this.token);
      return response.projections || this.generateDefaultProjections();
    } catch (error) {
      console.error('Error fetching projections:', error);
      return this.generateDefaultProjections();
    }
  }

  async getRiskAnalysis(userId: string): Promise<RiskAnalysis> {
    try {
      const response = await apiCallWithAuth(`/users/${userId}/risk-analysis`, this.token);
      return response.riskAnalysis || this.generateDefaultRiskAnalysis();
    } catch (error) {
      console.error('Error fetching risk analysis:', error);
      return this.generateDefaultRiskAnalysis();
    }
  }

  private transformAnalyticsData(data: any): PortfolioAnalytics {
    return {
      overview: {
        totalValue: data.overview?.totalValue || 0,
        totalEquity: data.overview?.totalEquity || 0,
        projectCount: data.overview?.projectCount || 0,
        activeProjects: data.overview?.activeProjects || 0,
        completionRate: data.overview?.completionRate || 0,
        growthRate: data.overview?.growthRate || 0,
        lastUpdated: new Date(data.overview?.lastUpdated || Date.now())
      },
      performance: {
        totalReturn: data.performance?.totalReturn || 0,
        monthlyReturn: data.performance?.monthlyReturn || 0,
        annualizedReturn: data.performance?.annualizedReturn || 0,
        bestPerformer: data.performance?.bestPerformer || null,
        worstPerformer: data.performance?.worstPerformer || null,
        performanceHistory: data.performance?.performanceHistory || []
      },
      diversification: {
        sectorBreakdown: data.diversification?.sectorBreakdown || [],
        roleBreakdown: data.diversification?.roleBreakdown || [],
        geographicBreakdown: data.diversification?.geographicBreakdown || [],
        concentrationRisk: data.diversification?.concentrationRisk || 0,
        diversificationScore: data.diversification?.diversificationScore || 0
      },
      trends: {
        equityGrowth: data.trends?.equityGrowth || [],
        valueGrowth: data.trends?.valueGrowth || [],
        projectGrowth: data.trends?.projectGrowth || [],
        activityTrend: data.trends?.activityTrend || []
      },
      projections: data.projections || this.generateDefaultProjections(),
      riskAnalysis: data.riskAnalysis || this.generateDefaultRiskAnalysis()
    };
  }

  private generateDefaultAnalytics(): PortfolioAnalytics {
    return {
      overview: {
        totalValue: 0,
        totalEquity: 0,
        projectCount: 0,
        activeProjects: 0,
        completionRate: 0,
        growthRate: 0,
        lastUpdated: new Date()
      },
      performance: {
        totalReturn: 0,
        monthlyReturn: 0,
        annualizedReturn: 0,
        bestPerformer: null,
        worstPerformer: null,
        performanceHistory: []
      },
      diversification: {
        sectorBreakdown: [],
        roleBreakdown: [],
        geographicBreakdown: [],
        concentrationRisk: 0,
        diversificationScore: 0
      },
      trends: {
        equityGrowth: [],
        valueGrowth: [],
        projectGrowth: [],
        activityTrend: []
      },
      projections: this.generateDefaultProjections(),
      riskAnalysis: this.generateDefaultRiskAnalysis()
    };
  }

  private generateDefaultProjections(): ProjectionData {
    return {
      shortTerm: {
        timeframe: '3 months',
        projectedValue: 0,
        projectedEquity: 0,
        confidence: 0.8,
        assumptions: ['Current growth rate continues', 'No new projects added']
      },
      mediumTerm: {
        timeframe: '1 year',
        projectedValue: 0,
        projectedEquity: 0,
        confidence: 0.6,
        assumptions: ['Moderate growth rate', 'Some new projects added']
      },
      longTerm: {
        timeframe: '3 years',
        projectedValue: 0,
        projectedEquity: 0,
        confidence: 0.4,
        assumptions: ['Conservative growth rate', 'Portfolio diversification']
      },
      scenarios: [
        {
          name: 'Optimistic',
          probability: 0.25,
          projectedValue: 0,
          projectedEquity: 0,
          description: 'High growth scenario with successful projects'
        },
        {
          name: 'Base Case',
          probability: 0.5,
          projectedValue: 0,
          projectedEquity: 0,
          description: 'Moderate growth with some project success'
        },
        {
          name: 'Conservative',
          probability: 0.25,
          projectedValue: 0,
          projectedEquity: 0,
          description: 'Slow growth with project challenges'
        }
      ]
    };
  }

  private generateDefaultRiskAnalysis(): RiskAnalysis {
    return {
      overallRisk: 0,
      riskFactors: [
        {
          factor: 'Portfolio Concentration',
          impact: 'MEDIUM',
          probability: 0.3,
          description: 'High concentration in few projects',
          mitigation: 'Diversify across more projects'
        }
      ],
      riskMitigation: [
        {
          strategy: 'Diversification',
          effectiveness: 0.8,
          cost: 0.2,
          implementation: 'Contribute to different project types'
        }
      ],
      stressTest: {
        scenario: 'Market Downturn',
        impact: 0.2,
        probability: 0.1,
        recommendations: ['Maintain diversified portfolio', 'Focus on high-quality projects']
      }
    };
  }
}

export const usePortfolioAnalytics = (token: string) => {
  const service = new PortfolioAnalyticsService(token);

  return {
    getAnalytics: (userId: string) => service.getAnalytics(userId),
    getPerformanceHistory: (userId: string, period: string) => service.getPerformanceHistory(userId, period),
    getProjections: (userId: string) => service.getProjections(userId),
    getRiskAnalysis: (userId: string) => service.getRiskAnalysis(userId)
  };
};
