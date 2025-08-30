import { prisma } from '../db.js';

export interface ProjectSubmissionData {
  title: string;
  description: string;
  category: string;
  marketSize?: string;
  targetAudience?: string;
  competitiveAdvantage?: string;
  revenueModel?: string;
  estimatedFunding?: number;
  timeline?: string;
  ownerEquityProposal: number;
  aliceEquityProposal: number;
  contributorEquityPool: number;
  reserveEquity: number;
  marketValidation?: string;
  technicalFeasibility?: string;
  financialProjections?: string;
  sprintGoals: string[];
  keyMilestones: string[];
  successMetrics: string[];
  requiredSkills: string[];
  teamSize: number;
  timeCommitment: string;
  marketingStrategy?: string;
  launchChannels: string[];
  pricingStrategy?: string;
}

export interface EquityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface SprintPlan {
  sprintNumber: number;
  phase: string;
  goals: string;
  duration: number;
  deliverables: string[];
  keyMilestones: string[];
  successCriteria: string[];
}

export interface MarketingRecommendation {
  category: string;
  channels: string[];
  strategy: string;
  budget: string;
  timeline: string;
  successMetrics: string[];
}

export class ProjectSubmissionService {
  
  /**
   * Validates equity proposal against AliceSolutions Ventures business rules
   */
  static validateEquityProposal(data: ProjectSubmissionData): EquityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Rule 1: Owner must retain minimum 35% equity
    if (data.ownerEquityProposal < 35) {
      errors.push('Owner must retain minimum 35% equity according to AliceSolutions Ventures framework');
    }

    // Rule 2: AliceSolutions cannot exceed 25% equity
    if (data.aliceEquityProposal > 25) {
      errors.push('AliceSolutions Ventures cannot exceed 25% equity stake');
    }

    // Rule 3: Total equity must equal 100%
    const totalEquity = data.ownerEquityProposal + data.aliceEquityProposal + 
                       data.contributorEquityPool + data.reserveEquity;
    if (totalEquity !== 100) {
      errors.push(`Equity percentages must total 100%. Current total: ${totalEquity}%`);
    }

    // Rule 4: Contributors cannot exceed 5% per contribution (but can accumulate)
    if (data.contributorEquityPool > 40) {
      warnings.push('Contributor equity pool is high. Consider if this aligns with contribution value');
    }

    // Rule 5: Reserve pool should be reasonable for future growth
    if (data.reserveEquity < 10) {
      warnings.push('Reserve equity is low. Consider maintaining 15-20% for future investors');
    } else if (data.reserveEquity > 50) {
      warnings.push('Reserve equity is very high. Consider if this is optimal for current stage');
    }

    // Recommendations
    if (data.ownerEquityProposal >= 35 && data.ownerEquityProposal <= 45) {
      recommendations.push('Owner equity is well-balanced for founder protection and team motivation');
    }

    if (data.aliceEquityProposal >= 15 && data.aliceEquityProposal <= 25) {
      recommendations.push('AliceSolutions equity is appropriate for infrastructure and support provided');
    }

    if (data.contributorEquityPool >= 20 && data.contributorEquityPool <= 35) {
      recommendations.push('Contributor equity pool provides good incentive for team collaboration');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * Generates 30-day sprint plan based on project category and goals
   */
  static calculate30DayTimeline(data: ProjectSubmissionData): SprintPlan[] {
    const sprints: SprintPlan[] = [];
    const sprintDuration = 7; // 7 days per sprint

    // Sprint 1: Discovery Phase
    sprints.push({
      sprintNumber: 1,
      phase: 'DISCOVERY',
      goals: data.sprintGoals[0] || 'Market research, user interviews, competitive analysis',
      duration: sprintDuration,
      deliverables: [
        'Market size analysis',
        'User persona definition',
        'Competitive landscape report',
        'Problem-solution fit validation'
      ],
      keyMilestones: data.keyMilestones.slice(0, 2) || [
        'Complete market research',
        'Define target audience'
      ],
      successCriteria: data.successMetrics.slice(0, 2) || [
        'Market size > $1B',
        'Clear user persona defined'
      ]
    });

    // Sprint 2: Validation Phase
    sprints.push({
      sprintNumber: 2,
      phase: 'VALIDATION',
      goals: data.sprintGoals[1] || 'Product validation, MVP design, user feedback',
      duration: sprintDuration,
      deliverables: [
        'MVP wireframes/proototypes',
        'User feedback collection',
        'Technical feasibility assessment',
        'Financial projections'
      ],
      keyMilestones: data.keyMilestones.slice(2, 4) || [
        'MVP prototype completed',
        'User feedback collected'
      ],
      successCriteria: data.successMetrics.slice(2, 4) || [
        'MVP prototype ready',
        'Positive user feedback (>70%)'
      ]
    });

    // Sprint 3: Build Phase
    sprints.push({
      sprintNumber: 3,
      phase: 'BUILD',
      goals: data.sprintGoals[2] || 'MVP development, testing, iteration',
      duration: sprintDuration,
      deliverables: [
        'MVP development',
        'User testing',
        'Bug fixes and improvements',
        'Launch preparation'
      ],
      keyMilestones: data.keyMilestones.slice(4, 6) || [
        'MVP development complete',
        'User testing complete'
      ],
      successCriteria: data.successMetrics.slice(4, 6) || [
        'MVP fully functional',
        'All critical bugs resolved'
      ]
    });

    // Sprint 4: Launch Phase
    sprints.push({
      sprintNumber: 4,
      phase: 'LAUNCH',
      goals: data.sprintGoals[3] || 'Product launch, marketing, user acquisition',
      duration: sprintDuration,
      deliverables: [
        'Product launch',
        'Marketing campaign execution',
        'User acquisition',
        'Performance monitoring'
      ],
      keyMilestones: data.keyMilestones.slice(6, 8) || [
        'Product successfully launched',
        'First users acquired'
      ],
      successCriteria: data.successMetrics.slice(6, 8) || [
        'Product live and accessible',
        'First 10 users acquired'
      ]
    });

    return sprints;
  }

  /**
   * Determines the current phase of a sprint
   */
  static getSprintPhase(sprintNumber: number): string {
    switch (sprintNumber) {
      case 1: return 'DISCOVERY';
      case 2: return 'VALIDATION';
      case 3: return 'BUILD';
      case 4: return 'LAUNCH';
      default: return 'SCALE';
    }
  }

  /**
   * Submits a new project with comprehensive validation and setup
   */
  static async submitProject(userId: string, data: ProjectSubmissionData) {
    // Validate equity proposal
    const equityValidation = this.validateEquityProposal(data);
    if (!equityValidation.isValid) {
      throw new Error(`Equity validation failed: ${equityValidation.errors.join(', ')}`);
    }

    // Create project first
    const project = await prisma.project.create({
      data: {
        name: data.title,
        summary: `${data.description} | Category: ${data.category} | Marketing: ${data.marketingStrategy || 'TBD'} | Channels: ${data.launchChannels.join(', ')}`,
        ownerId: userId,
        capEntries: {
          createMany: {
            data: [
              { holderType: 'OWNER', holderId: userId, pct: data.ownerEquityProposal, source: 'Project Owner Proposal' },
              { holderType: 'ALICE', pct: data.aliceEquityProposal, source: 'AliceSolutions Ventures' },
              { holderType: 'RESERVE', pct: data.reserveEquity, source: 'Future Investors Reserve' },
            ],
          },
        },
        members: { create: { userId, role: 'OWNER' } },
      },
      include: { capEntries: true, owner: true, members: true },
    });

    // Create project submission record
    const submission = await prisma.projectSub.create({
      data: {
        projectId: project.id,
        title: data.title,
        description: data.description,
        category: data.category as any, // Type assertion for enum
        marketSize: data.marketSize,
        targetAudience: data.targetAudience,
        competitiveAdvantage: data.competitiveAdvantage,
        revenueModel: data.revenueModel,
        estimatedFunding: data.estimatedFunding,
        timeline: data.timeline,
        ownerEquityProposal: data.ownerEquityProposal,
        aliceEquityProposal: data.aliceEquityProposal,
        contributorEquityPool: data.contributorEquityPool,
        reserveEquity: data.reserveEquity,
        marketValidation: data.marketValidation,
        technicalFeasibility: data.technicalFeasibility,
        financialProjections: data.financialProjections,
        sprintGoals: data.sprintGoals,
        keyMilestones: data.keyMilestones,
        successMetrics: data.successMetrics,
        requiredSkills: data.requiredSkills,
        teamSize: data.teamSize,
        timeCommitment: data.timeCommitment,
        marketingStrategy: data.marketingStrategy,
        launchChannels: data.launchChannels,
        pricingStrategy: data.pricingStrategy,
        status: 'SUBMITTED'
      }
    });

    // Create 30-day sprint plan
    const sprintPlan = this.calculate30DayTimeline(data);
    const sprintDuration = 7; // 7 days per sprint

    for (let i = 0; i < sprintPlan.length; i++) {
      const sprintStart = new Date(Date.now() + (i * sprintDuration * 24 * 60 * 60 * 1000));
      const sprintEnd = new Date(sprintStart.getTime() + (sprintDuration * 24 * 60 * 60 * 1000));
      
      await prisma.sprint.create({
        data: {
          projectId: project.id,
          start: sprintStart,
          end: sprintEnd,
          goals: sprintPlan[i].goals,
          exitCriteria: `Complete ${sprintPlan[i].phase} phase objectives`
        }
      });
    }

    return {
      project,
      submission,
      sprintPlan,
      timeline: {
        totalSprints: sprintPlan.length,
        sprintDuration,
        targetLaunchDate: new Date(Date.now() + (sprintPlan.length * sprintDuration * 24 * 60 * 60 * 1000))
      },
      equityValidation
    };
  }

  /**
   * Reviews a project submission (admin only)
   */
  static async reviewSubmission(
    submissionId: string, 
    reviewerId: string, 
    status: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED',
    reviewNotes?: string
  ) {
    const submission = await prisma.projectSub.update({
      where: { id: submissionId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
        reviewNotes
      },
      include: { project: true }
    });

    // If approved, update project status and create contributor pool
    if (status === 'APPROVED') {
      await prisma.project.update({
        where: { id: submission.projectId },
        data: {
          summary: `${submission.project.summary} | STATUS: APPROVED | Review Notes: ${reviewNotes || 'No additional notes'}`
        }
      });

      // Create contributor pool cap table entry if not exists
      const existingContributorEntry = await prisma.capTableEntry.findFirst({
        where: {
          projectId: submission.projectId,
          holderType: 'RESERVE'
        }
      });

      if (!existingContributorEntry) {
        await prisma.capTableEntry.create({
          data: {
            projectId: submission.projectId,
            holderType: 'RESERVE',
            pct: submission.contributorEquityPool,
            source: 'Contributor Pool - Approved Project'
          }
        });
      }
    }

    return submission;
  }

  /**
   * Gets analytics on project submissions
   */
  static async getSubmissionAnalytics() {
    const totalSubmissions = await prisma.projectSub.count();
    const pendingReview = await prisma.projectSub.count({ where: { status: 'SUBMITTED' } });
    const approved = await prisma.projectSub.count({ where: { status: 'APPROVED' } });
    const rejected = await prisma.projectSub.count({ where: { status: 'REJECTED' } });

    const categoryBreakdown = await prisma.projectSub.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    const equityAnalysis = await prisma.projectSub.groupBy({
      by: ['status'],
      _avg: {
        ownerEquityProposal: true,
        aliceEquityProposal: true,
        contributorEquityPool: true,
        reserveEquity: true
      }
    });

    return {
      totalSubmissions,
      pendingReview,
      approved,
      rejected,
      approvalRate: totalSubmissions > 0 ? (approved / totalSubmissions) * 100 : 0,
      categoryBreakdown,
      equityAnalysis
    };
  }

  /**
   * Calculates equity for contributions based on effort and impact
   */
  static calculateContributionEquity(
    effort: number, // Hours
    impact: number, // 1-5 scale
    complexity: number = 3, // 1-5 scale
    skillRarity: number = 3 // 1-5 scale
  ): number {
    // Base equity calculation: 0.5% per 10 hours of high-impact work
    let baseEquity = (effort / 10) * 0.5;
    
    // Impact multiplier
    const impactMultiplier = impact / 3; // 3 is baseline
    
    // Complexity multiplier
    const complexityMultiplier = complexity / 3;
    
    // Skill rarity multiplier
    const rarityMultiplier = skillRarity / 3;
    
    // Calculate final equity
    let finalEquity = baseEquity * impactMultiplier * complexityMultiplier * rarityMultiplier;
    
    // Cap at 5% per contribution (business rule)
    finalEquity = Math.min(finalEquity, 5);
    
    // Minimum 0.1% for any meaningful contribution
    finalEquity = Math.max(finalEquity, 0.1);
    
    return Math.round(finalEquity * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Provides marketing recommendations based on project category
   */
  static getMarketingRecommendations(category: string): MarketingRecommendation {
    const recommendations: { [key: string]: MarketingRecommendation } = {
      'SAAS': {
        category: 'SAAS',
        channels: ['LinkedIn', 'Product Hunt', 'TechCrunch', 'Reddit r/SaaS', 'Twitter/X'],
        strategy: 'Content marketing, thought leadership, product demos, free trials',
        budget: '$2,000 - $5,000',
        timeline: '4-6 weeks pre-launch',
        successMetrics: ['Website traffic', 'Demo requests', 'Newsletter signups', 'Social engagement']
      },
      'MOBILE_APP': {
        category: 'MOBILE_APP',
        channels: ['App Store Optimization', 'Instagram', 'TikTok', 'App review sites', 'Influencer marketing'],
        strategy: 'App store optimization, social media campaigns, influencer partnerships',
        budget: '$3,000 - $8,000',
        timeline: '6-8 weeks pre-launch',
        successMetrics: ['App store rankings', 'Social media reach', 'Influencer engagement', 'Pre-launch signups']
      },
      'ECOMMERCE': {
        category: 'ECOMMERCE',
        channels: ['Google Ads', 'Facebook/Instagram Ads', 'Pinterest', 'Email marketing', 'Influencer partnerships'],
        strategy: 'Paid advertising, email marketing, social commerce, influencer collaborations',
        budget: '$5,000 - $15,000',
        timeline: '8-12 weeks pre-launch',
        successMetrics: ['Email list growth', 'Social media engagement', 'Website traffic', 'Conversion rate']
      },
      'AI_ML': {
        category: 'AI_ML',
        channels: ['ArXiv', 'Medium', 'GitHub', 'AI conferences', 'Tech podcasts', 'Research papers'],
        strategy: 'Technical content, research publications, open source contributions, conference presentations',
        budget: '$1,000 - $3,000',
        timeline: '12-16 weeks pre-launch',
        successMetrics: ['Research citations', 'GitHub stars', 'Conference invitations', 'Technical community engagement']
      }
    };

    return recommendations[category] || {
      category: 'OTHER',
      channels: ['Social media', 'Content marketing', 'Email marketing', 'PR outreach'],
      strategy: 'Multi-channel approach with focus on content and community building',
      budget: '$2,000 - $6,000',
      timeline: '6-10 weeks pre-launch',
      successMetrics: ['Brand awareness', 'Website traffic', 'Social engagement', 'Lead generation']
    };
  }
}
