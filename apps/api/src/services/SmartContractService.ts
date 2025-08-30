import { PrismaClient } from '@prisma/client';
import { getCapTableState, assertCapTableGuardrails } from './guardrails.js';

const prisma = new PrismaClient();

export interface ContractOfferData {
  projectId: string;
  recipientId: string;
  equityPercentage: number;
  vestingSchedule: string;
  contributionType: string;
  effortRequired: number;
  impactExpected: number;
  terms: string;
  deliverables: string[];
  milestones: string[];
  createdBy: string;
}

export interface EquityCalculation {
  baseEquity: number;
  effortBonus: number;
  impactBonus: number;
  qualityBonus: number;
  collaborationBonus: number;
  totalEquity: number;
  vestingSchedule: string;
  estimatedValue: number;
}

export interface PortfolioInsight {
  totalEquityOwned: number;
  averageEquityPerProject: number;
  portfolioDiversity: number;
  highestEquityProject: string;
  lowestEquityProject: string;
  equityGrowthRate: number;
  riskScore: number;
  opportunityScore: number;
}

export class SmartContractService {
  
  // ============================================================================
  // CONTRACT CREATION & MANAGEMENT
  // ============================================================================
  
  /**
   * Create a new contract offer between a project and user
   */
  async createContractOffer(data: ContractOfferData) {
    try {
      // Validate equity percentage within bounds
      if (data.equityPercentage < 0.5 || data.equityPercentage > 5) {
        throw new Error('Equity percentage must be between 0.5% and 5%');
      }
      
      // Check if project has sufficient reserve
      const capTableState = await getCapTableState(data.projectId);
      if (capTableState.reserve < data.equityPercentage) {
        throw new Error(`Insufficient project reserve. Available: ${capTableState.reserve}%, Requested: ${data.equityPercentage}%`);
      }
      
      // Create contract offer
      const contractOffer = await prisma.contractOffer.create({
        data: {
          projectId: data.projectId,
          recipientId: data.recipientId,
          equityPercentage: data.equityPercentage,
          vestingSchedule: data.vestingSchedule as any,
          contributionType: data.contributionType as any,
          effortRequired: data.effortRequired,
          impactExpected: data.impactExpected,
          terms: data.terms,
          deliverables: data.deliverables,
          milestones: data.milestones,
          createdBy: data.createdBy,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        include: {
          project: true,
          recipient: true,
        }
      });
      
      // Create audit event
      await this.createAuditEvent({
        entity: 'ContractOffer',
        action: 'CREATE',
        actorId: data.createdBy,
        payload: contractOffer,
      });
      
      return contractOffer;
    } catch (error) {
      console.error('Error creating contract offer:', error);
      throw error;
    }
  }
  
  /**
   * Accept a contract offer
   */
  async acceptContractOffer(contractId: string, userId: string) {
    try {
      const contract = await prisma.contractOffer.findUnique({
        where: { id: contractId },
        include: { project: true, recipient: true }
      });
      
      if (!contract) {
        throw new Error('Contract offer not found');
      }
      
      if (contract.recipientId !== userId) {
        throw new Error('Only the recipient can accept this contract');
      }
      
      if (contract.status !== 'PENDING') {
        throw new Error('Contract is not in pending status');
      }
      
      if (contract.expiresAt < new Date()) {
        throw new Error('Contract offer has expired');
      }
      
      // Update contract status
      const updatedContract = await prisma.contractOffer.update({
        where: { id: contractId },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        }
      });
      
      // Create contract signature
      await prisma.contractSignature.create({
        data: {
          contractId: contractId,
          signerId: userId,
          projectId: contract.projectId,
          signatureHash: this.generateSignatureHash(contract, userId),
          termsAccepted: true,
          privacyAccepted: true,
        }
      });
      
      // Create equity vesting schedule
      await this.createEquityVesting(contract);
      
      // Update cap table
      await this.addEquityToCapTable(contract);
      
      // Update user portfolio metrics
      await this.updateUserPortfolioMetrics(userId);
      
      // Create audit event
      await this.createAuditEvent({
        entity: 'ContractOffer',
        action: 'ACCEPT',
        actorId: userId,
        payload: updatedContract,
      });
      
      return updatedContract;
    } catch (error) {
      console.error('Error accepting contract offer:', error);
      throw error;
    }
  }
  
  /**
   * Reject a contract offer
   */
  async rejectContractOffer(contractId: string, userId: string, reason?: string) {
    try {
      const contract = await prisma.contractOffer.findUnique({
        where: { id: contractId }
      });
      
      if (!contract) {
        throw new Error('Contract offer not found');
      }
      
      if (contract.recipientId !== userId) {
        throw new Error('Only the recipient can reject this contract');
      }
      
      const updatedContract = await prisma.contractOffer.update({
        where: { id: contractId },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
        }
      });
      
      // Create audit event
      await this.createAuditEvent({
        entity: 'ContractOffer',
        action: 'REJECT',
        actorId: userId,
        payload: { ...updatedContract, reason },
      });
      
      return updatedContract;
    } catch (error) {
      console.error('Error rejecting contract offer:', error);
      throw error;
    }
  }
  
  // ============================================================================
  // EQUITY CALCULATIONS & VESTING
  // ============================================================================
  
  /**
   * Calculate optimal equity for a contribution
   */
  calculateOptimalEquity(
    effort: number,
    impact: number,
    quality: number = 3,
    collaboration: number = 3,
    projectValue: number = 0
  ): EquityCalculation {
    // Base equity calculation
    const baseEquity = Math.max(0.5, effort / 40); // 0.5% minimum, 1% per 40 hours
    
    // Effort bonus (max 2%)
    const effortBonus = Math.min(effort / 100, 2);
    
    // Impact bonus (max 1.5%)
    const impactBonus = Math.max(0, (impact - 3) * 0.3);
    
    // Quality bonus (max 1%)
    const qualityBonus = Math.max(0, (quality - 3) * 0.2);
    
    // Collaboration bonus (max 0.5%)
    const collaborationBonus = Math.max(0, (collaboration - 3) * 0.1);
    
    // Calculate total equity
    const totalEquity = Math.min(5, baseEquity + effortBonus + impactBonus + qualityBonus + collaborationBonus);
    
    // Determine vesting schedule based on effort
    let vestingSchedule = 'IMMEDIATE';
    if (effort > 200) vestingSchedule = 'QUARTERLY';
    if (effort > 500) vestingSchedule = 'ANNUAL';
    
    // Estimate value (if project has value)
    const estimatedValue = projectValue * (totalEquity / 100);
    
    return {
      baseEquity,
      effortBonus,
      impactBonus,
      qualityBonus,
      collaborationBonus,
      totalEquity,
      vestingSchedule,
      estimatedValue,
    };
  }
  
  /**
   * Create equity vesting schedule
   */
  private async createEquityVesting(contract: any) {
    const vestingSchedule = contract.vestingSchedule;
    const totalEquity = contract.equityPercentage;
    
    let vestingStart = new Date();
    let vestingEnd = new Date();
    let cliffDate: Date | null = null;
    
    // Calculate vesting dates based on schedule
    switch (vestingSchedule) {
      case 'MONTHLY':
        vestingEnd.setMonth(vestingEnd.getMonth() + 12); // 1 year
        break;
      case 'QUARTERLY':
        vestingEnd.setMonth(vestingEnd.getMonth() + 18); // 1.5 years
        break;
      case 'ANNUAL':
        vestingEnd.setFullYear(vestingEnd.getFullYear() + 2); // 2 years
        break;
      case 'CLIFF':
        cliffDate = new Date(vestingStart.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year cliff
        vestingEnd.setFullYear(vestingEnd.getFullYear() + 3); // 3 years total
        break;
      default: // IMMEDIATE
        vestingEnd = vestingStart;
    }
    
    // Create vesting record
    const vesting = await prisma.equityVesting.create({
      data: {
        contractId: contract.id,
        beneficiaryId: contract.recipientId,
        projectId: contract.projectId,
        totalEquity,
        vestedEquity: vestingSchedule === 'IMMEDIATE' ? totalEquity : 0,
        vestingSchedule: vestingSchedule as any,
        vestingStart,
        vestingEnd,
        cliffDate,
      }
    });
    
    // Create initial vesting event if immediate
    if (vestingSchedule === 'IMMEDIATE') {
      await prisma.vestingEvent.create({
        data: {
          vestingId: vesting.id,
          equityAmount: totalEquity,
          vestingDate: vestingStart,
          eventType: 'INITIAL',
        }
      });
    }
    
    return vesting;
  }
  
  /**
   * Process vesting events (called by cron job)
   */
  async processVestingEvents() {
    try {
      const today = new Date();
      
      // Find vesting schedules that need processing
      const vestingSchedules = await prisma.equityVesting.findMany({
        where: {
          vestingEnd: { gte: today },
          vestingSchedule: { not: 'IMMEDIATE' },
        },
        include: {
          contract: true,
          project: true,
        }
      });
      
      for (const vesting of vestingSchedules) {
        await this.processVestingSchedule(vesting, today);
      }
      
      return { processed: vestingSchedules.length };
    } catch (error) {
      console.error('Error processing vesting events:', error);
      throw error;
    }
  }
  
  /**
   * Process individual vesting schedule
   */
  private async processVestingSchedule(vesting: any, today: Date) {
    const { vestingSchedule, vestingStart, vestingEnd, totalEquity, cliffDate } = vesting;
    
    // Check if still in cliff period
    if (cliffDate && today < cliffDate) {
      return;
    }
    
    let equityToVest = 0;
    
    switch (vestingSchedule) {
      case 'MONTHLY':
        equityToVest = this.calculateMonthlyVesting(vestingStart, vestingEnd, totalEquity, today);
        break;
      case 'QUARTERLY':
        equityToVest = this.calculateQuarterlyVesting(vestingStart, vestingEnd, totalEquity, today);
        break;
      case 'ANNUAL':
        equityToVest = this.calculateAnnualVesting(vestingStart, vestingEnd, totalEquity, today);
        break;
      case 'MILESTONE':
        equityToVest = this.calculateMilestoneVesting(vesting, today);
        break;
    }
    
    if (equityToVest > 0) {
      // Create vesting event
      await prisma.vestingEvent.create({
        data: {
          vestingId: vesting.id,
          equityAmount: equityToVest,
          vestingDate: today,
          eventType: 'TIME_BASED',
        }
      });
      
      // Update vested equity
      await prisma.equityVesting.update({
        where: { id: vesting.id },
        data: {
          vestedEquity: { increment: equityToVest }
        }
      });
      
      // Update cap table
      await this.updateCapTableVesting(vesting.projectId, vesting.beneficiaryId, equityToVest);
    }
  }
  
  // ============================================================================
  // PORTFOLIO MANAGEMENT & ANALYTICS
  // ============================================================================
  
  /**
   * Get comprehensive portfolio insights for a user
   */
  async getUserPortfolioInsights(userId: string): Promise<PortfolioInsight> {
    try {
      // Get user's equity across all projects
      const userEquity = await prisma.capTableEntry.findMany({
        where: {
          holderType: 'USER',
          holderId: userId,
        },
        include: {
          project: true,
        }
      });
      
      // Calculate portfolio metrics
      const totalEquityOwned = userEquity.reduce((sum, entry) => sum + entry.pct, 0);
      const averageEquityPerProject = userEquity.length > 0 ? totalEquityOwned / userEquity.length : 0;
      
      // Calculate portfolio diversity (different project types)
      const projectTypes = new Set(userEquity.map(entry => entry.project?.summary?.split(' ')[0] || 'unknown'));
      const portfolioDiversity = projectTypes.size;
      
      // Find highest and lowest equity projects
      const sortedEquity = userEquity.sort((a, b) => b.pct - a.pct);
      const highestEquityProject = sortedEquity[0]?.project?.name || 'None';
      const lowestEquityProject = sortedEquity[sortedEquity.length - 1]?.project?.name || 'None';
      
      // Calculate equity growth rate (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      
      const recentEquity = userEquity.filter(entry => entry.createdAt > thirtyDaysAgo);
      const previousEquity = userEquity.filter(entry => 
        entry.createdAt > sixtyDaysAgo && entry.createdAt <= thirtyDaysAgo
      );
      
      const recentTotal = recentEquity.reduce((sum, entry) => sum + entry.pct, 0);
      const previousTotal = previousEquity.reduce((sum, entry) => sum + entry.pct, 0);
      
      const equityGrowthRate = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0;
      
      // Calculate risk score (concentration in single project)
      const maxProjectEquity = Math.max(...userEquity.map(entry => entry.pct));
      const riskScore = maxProjectEquity / totalEquityOwned; // Higher = more concentrated = higher risk
      
      // Calculate opportunity score (based on active projects and growth potential)
      const activeProjects = userEquity.filter(entry => 
        entry.project && entry.project.lastActivity > thirtyDaysAgo
      ).length;
      const opportunityScore = (activeProjects / Math.max(userEquity.length, 1)) * 100;
      
      return {
        totalEquityOwned,
        averageEquityPerProject,
        portfolioDiversity,
        highestEquityProject,
        lowestEquityProject,
        equityGrowthRate,
        riskScore,
        opportunityScore,
      };
    } catch (error) {
      console.error('Error getting portfolio insights:', error);
      throw error;
    }
  }
  
  /**
   * Update user portfolio metrics
   */
  async updateUserPortfolioMetrics(userId: string) {
    try {
      const insights = await this.getUserPortfolioInsights(userId);
      
      // Update user record
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalEquityOwned: insights.totalEquityOwned,
          averageEquityPerProject: insights.averageEquityPerProject,
          portfolioDiversity: insights.portfolioDiversity,
          lastEquityEarned: new Date(),
        }
      });
      
      return insights;
    } catch (error) {
      console.error('Error updating portfolio metrics:', error);
      throw error;
    }
  }
  
  // ============================================================================
  // CAP TABLE MANAGEMENT
  // ============================================================================
  
  /**
   * Add equity to cap table when contract is accepted
   */
  private async addEquityToCapTable(contract: any) {
    try {
      // Check if entry already exists
      const existingEntry = await prisma.capTableEntry.findUnique({
        where: {
          projectId_holderType_holderId: {
            projectId: contract.projectId,
            holderType: 'USER',
            holderId: contract.recipientId,
          }
        }
      });
      
      if (existingEntry) {
        // Update existing entry
        await prisma.capTableEntry.update({
          where: { id: existingEntry.id },
          data: {
            pct: { increment: contract.equityPercentage },
            contractId: contract.id,
          }
        });
      } else {
        // Create new entry
        await prisma.capTableEntry.create({
          data: {
            projectId: contract.projectId,
            holderType: 'USER',
            holderId: contract.recipientId,
            pct: contract.equityPercentage,
            source: `Contract: ${contract.id}`,
            contractId: contract.id,
          }
        });
      }
      
      // Update project reserve
      await this.updateProjectReserve(contract.projectId, contract.equityPercentage);
      
    } catch (error) {
      console.error('Error adding equity to cap table:', error);
      throw error;
    }
  }
  
  /**
   * Update project reserve when equity is allocated
   */
  private async updateProjectReserve(projectId: string, equityAllocated: number) {
    try {
      const reserveEntry = await prisma.capTableEntry.findUnique({
        where: {
          projectId_holderType_holderId: {
            projectId,
            holderType: 'RESERVE',
            holderId: null,
          }
        }
      });
      
      if (reserveEntry) {
        await prisma.capTableEntry.update({
          where: { id: reserveEntry.id },
          data: {
            pct: { decrement: equityAllocated }
          }
        });
      }
    } catch (error) {
      console.error('Error updating project reserve:', error);
      throw error;
    }
  }
  
  /**
   * Update cap table when vesting occurs
   */
  private async updateCapTableVesting(projectId: string, userId: string, equityVested: number) {
    try {
      const userEntry = await prisma.capTableEntry.findUnique({
        where: {
          projectId_holderType_holderId: {
            projectId,
            holderType: 'USER',
            holderId: userId,
          }
        }
      });
      
      if (userEntry) {
        await prisma.capTableEntry.update({
          where: { id: userEntry.id },
          data: {
            isVested: true,
            vestingDate: new Date(),
          }
        });
      }
    } catch (error) {
      console.error('Error updating cap table vesting:', error);
      throw error;
    }
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Generate signature hash for contract
   */
  private generateSignatureHash(contract: any, userId: string): string {
    const content = `${contract.id}-${contract.projectId}-${userId}-${contract.equityPercentage}-${Date.now()}`;
    return Buffer.from(content).toString('base64');
  }
  
  /**
   * Create audit event
   */
  private async createAuditEvent(data: any) {
    try {
      await prisma.auditEvent.create({
        data: {
          actorId: data.actorId,
          entity: data.entity,
          action: data.action,
          payload: data.payload,
        }
      });
    } catch (error) {
      console.error('Error creating audit event:', error);
    }
  }
  
  /**
   * Calculate monthly vesting
   */
  private calculateMonthlyVesting(start: Date, end: Date, total: number, today: Date): number {
    const monthsElapsed = (today.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000);
    const totalMonths = (end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000);
    const monthlyAmount = total / totalMonths;
    return Math.min(total, Math.max(0, monthlyAmount * monthsElapsed));
  }
  
  /**
   * Calculate quarterly vesting
   */
  private calculateQuarterlyVesting(start: Date, end: Date, total: number, today: Date): number {
    const quartersElapsed = (today.getTime() - start.getTime()) / (90 * 24 * 60 * 60 * 1000);
    const totalQuarters = (end.getTime() - start.getTime()) / (90 * 24 * 60 * 60 * 1000);
    const quarterlyAmount = total / totalQuarters;
    return Math.min(total, Math.max(0, quarterlyAmount * quartersElapsed));
  }
  
  /**
   * Calculate annual vesting
   */
  private calculateAnnualVesting(start: Date, end: Date, total: number, today: Date): number {
    const yearsElapsed = (today.getTime() - start.getTime()) / (365 * 24 * 60 * 60 * 1000);
    const totalYears = (end.getTime() - start.getTime()) / (365 * 24 * 60 * 60 * 1000);
    const annualAmount = total / totalYears;
    return Math.min(total, Math.max(0, annualAmount * yearsElapsed));
  }
  
  /**
   * Calculate milestone vesting
   */
  private calculateMilestoneVesting(vesting: any, today: Date): number {
    // This would be implemented based on specific milestone logic
    // For now, return 0
    return 0;
  }
}

export default SmartContractService;
