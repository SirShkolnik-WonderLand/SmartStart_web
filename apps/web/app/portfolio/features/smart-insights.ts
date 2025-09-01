// Smart Insights Feature
// AI-powered recommendations and portfolio optimization insights

import { apiCallWithAuth } from '../../utils/api';

export interface SmartInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  category: string;
  impact: number;
  recommendations: string[];
  actionItems: ActionItem[];
  expiresAt?: Date;
  createdAt: Date;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  type: 'CONTRIBUTION' | 'COLLABORATION' | 'SKILL_DEVELOPMENT' | 'PORTFOLIO_OPTIMIZATION';
  effort: number; // 1-5 scale
  impact: number; // 1-5 scale
  deadline?: Date;
  isCompleted: boolean;
}

export enum InsightType {
  PORTFOLIO_DIVERSIFICATION = 'PORTFOLIO_DIVERSIFICATION',
  SKILL_GAP = 'SKILL_GAP',
  COLLABORATION_OPPORTUNITY = 'COLLABORATION_OPPORTUNITY',
  RISK_MITIGATION = 'RISK_MITIGATION',
  GROWTH_OPPORTUNITY = 'GROWTH_OPPORTUNITY',
  PERFORMANCE_OPTIMIZATION = 'PERFORMANCE_OPTIMIZATION'
}

export class SmartInsightsService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getInsights(userId: string): Promise<SmartInsight[]> {
    try {
      const response = await apiCallWithAuth(`/users/${userId}/insights`, this.token);
      return this.transformInsightsData(response);
    } catch (error) {
      console.error('Error fetching insights:', error);
      return this.generateDefaultInsights();
    }
  }

  async markInsightRead(insightId: string): Promise<void> {
    try {
      await apiCallWithAuth(`/insights/${insightId}/read`, this.token, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  }

  async completeActionItem(actionItemId: string): Promise<void> {
    try {
      await apiCallWithAuth(`/action-items/${actionItemId}/complete`, this.token, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error completing action item:', error);
    }
  }

  private transformInsightsData(data: any): SmartInsight[] {
    return (data.insights || []).map((insight: any) => ({
      id: insight.id,
      type: insight.type,
      title: insight.title,
      description: insight.description,
      priority: insight.priority,
      confidence: insight.confidence,
      category: insight.category,
      impact: insight.impact,
      recommendations: insight.recommendations || [],
      actionItems: insight.actionItems || [],
      expiresAt: insight.expiresAt ? new Date(insight.expiresAt) : undefined,
      createdAt: new Date(insight.createdAt)
    }));
  }

  private generateDefaultInsights(): SmartInsight[] {
    return [
      {
        id: '1',
        type: InsightType.PORTFOLIO_DIVERSIFICATION,
        title: 'Portfolio Concentration Risk',
        description: 'Your portfolio is concentrated in a few projects. Consider diversifying to reduce risk.',
        priority: 'HIGH',
        confidence: 0.85,
        category: 'Risk Management',
        impact: 4,
        recommendations: [
          'Contribute to different project types',
          'Seek opportunities in new domains',
          'Consider smaller equity stakes in more projects'
        ],
        actionItems: [
          {
            id: '1',
            title: 'Explore new project categories',
            description: 'Look for opportunities in different project types',
            type: 'PORTFOLIO_OPTIMIZATION',
            effort: 2,
            impact: 4,
            isCompleted: false
          }
        ],
        createdAt: new Date()
      }
    ];
  }
}

export const useSmartInsights = (token: string) => {
  const service = new SmartInsightsService(token);

  return {
    getInsights: (userId: string) => service.getInsights(userId),
    markRead: (insightId: string) => service.markInsightRead(insightId),
    completeAction: (actionItemId: string) => service.completeActionItem(actionItemId)
  };
};
