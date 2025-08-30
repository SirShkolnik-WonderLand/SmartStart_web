import { prisma } from '../db.js';

import { LegalEntityType, CoopType, CoopGovernanceModel, CoopDecisionMaking, CoopMemberRole, GovernanceDecisionType } from '@prisma/client';

export interface LegalEntityData {
  name: string;
  type: LegalEntityType;
  jurisdiction: string;
  registrationNumber?: string;
  taxId?: string;
  incorporationDate?: Date;
  legalForm: string;
  ownershipStructure: string;
  governanceModel: string;
  registeredAddress?: string;
  mailingAddress?: string;
  phone?: string;
  email?: string;
}

export interface StartupCoopData {
  name: string;
  description?: string;
  type: CoopType;
  governanceModel: CoopGovernanceModel;
  decisionMaking: CoopDecisionMaking;
  minMembers: number;
  maxMembers?: number;
  membershipFee: number;
  monthlyDues: number;
  profitSharing: boolean;
}

export interface CoopMemberData {
  userId: string;
  role: CoopMemberRole;
  votingShares: number;
  membershipFee: number;
  monthlyDues: number;
  profitShare: number;
}

export interface GovernanceDecisionData {
  title: string;
  description: string;
  type: GovernanceDecisionType;
  requiresVote: boolean;
  votingDeadline?: Date;
  quorumRequired: number;
}

export class StartupCoopService {
  
  /**
   * Creates a new legal entity
   */
  static async createLegalEntity(data: LegalEntityData, creatorId: string) {
    const entity = await prisma.legalEntity.create({
      data: {
        ...data,
        incorporationDate: data.incorporationDate || new Date(),
        members: {
          create: {
            userId: creatorId,
            role: 'OWNER',
            votingRights: true,
            ownershipPercentage: 100,
            identityVerified: true,
            kycCompleted: true,
            termsAccepted: true
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return entity;
  }

  /**
   * Creates a new startup cooperative
   */
  static async createStartupCoop(data: StartupCoopData, creatorId: string, legalEntityId?: string) {
    const coopData: any = {
      ...data,
      currentMembers: 1,
      members: {
        create: {
          userId: creatorId,
          role: 'FOUNDING_MEMBER',
          votingShares: 1,
          votingRights: true,
          membershipFee: data.membershipFee,
          monthlyDues: data.monthlyDues,
          profitShare: 100
        }
      }
    };

    if (legalEntityId) {
      coopData.legalEntityId = legalEntityId;
    }

    const coop = await prisma.startupCoop.create({
      data: coopData,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        legalEntity: true
      }
    });

    return coop;
  }

  /**
   * Adds a member to a cooperative
   */
  static async addCoopMember(coopId: string, memberData: CoopMemberData) {
    const coop = await prisma.startupCoop.findUnique({
      where: { id: coopId },
      include: { members: true }
    });

    if (!coop) {
      throw new Error('Cooperative not found');
    }

    if (coop.maxMembers && coop.currentMembers >= coop.maxMembers) {
      throw new Error('Cooperative has reached maximum membership');
    }

    const member = await prisma.coopMember.create({
      data: {
        coopId,
        ...memberData
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Update member count
    await prisma.startupCoop.update({
      where: { id: coopId },
      data: { currentMembers: coop.currentMembers + 1 }
    });

    return member;
  }

  /**
   * Creates a governance decision
   */
  static async createGovernanceDecision(coopId: string, data: GovernanceDecisionData, proposerId: string) {
    const decision = await prisma.coopGovernance.create({
      data: {
        coopId,
        ...data,
        proposedBy: proposerId,
        votingDeadline: data.votingDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
      },
      include: {
        coop: {
          select: {
            name: true,
            members: {
              where: { isActive: true },
              select: { userId: true, votingShares: true }
            }
          }
        }
      }
    });

    return decision;
  }

  /**
   * Submits a vote on a governance decision
   */
  static async submitVote(governanceId: string, memberId: string, vote: string, comments?: string) {
    const governance = await prisma.coopGovernance.findUnique({
      where: { id: governanceId },
      include: {
        coop: {
          include: {
            members: {
              where: { id: memberId, isActive: true }
            }
          }
        }
      }
    });

    if (!governance) {
      throw new Error('Governance decision not found');
    }

    if (governance.status !== 'VOTING') {
      throw new Error('Voting is not currently open');
    }

    if (governance.votingDeadline && new Date() > governance.votingDeadline) {
      throw new Error('Voting deadline has passed');
    }

    const member = governance.coop.members[0];
    if (!member) {
      throw new Error('Member not found or inactive');
    }

    const existingVote = await prisma.coopGovernanceVote.findUnique({
      where: {
        governanceId_memberId: {
          governanceId,
          memberId
        }
      }
    });

    if (existingVote) {
      throw new Error('Member has already voted');
    }

    const voteRecord = await prisma.coopGovernanceVote.create({
      data: {
        governanceId,
        memberId,
        vote: vote as any,
        votingShares: member.votingShares,
        comments
      }
    });

    // Update vote counts
    await this.updateVoteCounts(governanceId);

    return voteRecord;
  }

  /**
   * Updates vote counts for a governance decision
   */
  private static async updateVoteCounts(governanceId: string) {
    const votes = await prisma.coopGovernanceVote.findMany({
      where: { governanceId }
    });

    let votesFor = 0;
    let votesAgainst = 0;
    let votesAbstain = 0;
    let totalVotes = 0;

    for (const vote of votes) {
      const shares = vote.votingShares;
      totalVotes += shares;

      switch (vote.vote) {
        case 'FOR':
          votesFor += shares;
          break;
        case 'AGAINST':
          votesAgainst += shares;
          break;
        case 'ABSTAIN':
          votesAbstain += shares;
          break;
      }
    }

    await prisma.coopGovernance.update({
      where: { id: governanceId },
      data: {
        votesFor,
        votesAgainst,
        votesAbstain,
        totalVotes
      }
    });
  }

  /**
   * Processes governance decision results
   */
  static async processGovernanceResults(governanceId: string, processorId: string) {
    const governance = await prisma.coopGovernance.findUnique({
      where: { id: governanceId },
      include: {
        coop: {
          include: {
            members: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (!governance) {
      throw new Error('Governance decision not found');
    }

    if (governance.status !== 'VOTING') {
      throw new Error('Decision is not in voting status');
    }

    if (governance.votingDeadline && new Date() <= governance.votingDeadline) {
      throw new Error('Voting deadline has not passed');
    }

    const totalPossibleVotes = governance.coop.members.reduce((sum, member) => sum + member.votingShares, 0);
    const quorumMet = governance.totalVotes >= (totalPossibleVotes * governance.quorumRequired / 100);
    const approved = quorumMet && governance.votesFor > governance.votesAgainst;

    const newStatus = approved ? 'APPROVED' : 'REJECTED';

    const updatedGovernance = await prisma.coopGovernance.update({
      where: { id: governanceId },
      data: {
        status: newStatus,
        approvedBy: approved ? processorId : null,
        approvedAt: approved ? new Date() : null,
        effectiveDate: approved ? new Date() : null
      }
    });

    return updatedGovernance;
  }

  /**
   * Creates compliance records for an entity
   */
  static async createComplianceRecords(entityId: string, entityType: string, regulations: string[]) {
    const complianceRecords = [];

    for (const regulation of regulations) {
      const record = await prisma.complianceRecord.create({
        data: {
          entityId,
          entityType,
          regulation,
          requirement: `Compliance with ${regulation}`,
          status: 'PENDING',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
        }
      });

      complianceRecords.push(record);
    }

    return complianceRecords;
  }

  /**
   * Updates compliance record status
   */
  static async updateComplianceStatus(recordId: string, status: string, evidence?: string, notes?: string) {
    const record = await prisma.complianceRecord.update({
      where: { id: recordId },
      data: {
        status: status as any,
        evidence,
        notes,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        nextReviewDate: status === 'COMPLETED' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null // 1 year
      }
    });

    return record;
  }

  /**
   * Gets cooperative analytics
   */
  static async getCoopAnalytics(coopId: string) {
    const coop = await prisma.startupCoop.findUnique({
      where: { id: coopId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        governance: {
          include: {
            votes: true
          }
        },
        projects: {
          include: {
            capEntries: true,
            sprints: true
          }
        }
      }
    });

    if (!coop) {
      throw new Error('Cooperative not found');
    }

    // Calculate analytics
    const totalMembers = coop.members.length;
    const activeMembers = coop.members.filter(m => m.isActive).length;
    const totalProjects = coop.projects.length;
    const activeProjects = coop.projects.filter(p => p.deletedAt === null).length;

    // Governance analytics
    const totalDecisions = coop.governance.length;
    const approvedDecisions = coop.governance.filter(g => g.status === 'APPROVED').length;
    const pendingDecisions = coop.governance.filter(g => g.status === 'VOTING').length;

    // Project analytics
    const totalEquity = coop.projects.reduce((sum, p) => {
      return sum + p.capEntries.reduce((projectSum, entry) => projectSum + entry.pct, 0);
    }, 0);

    const averageSprintCompletion = coop.projects.reduce((sum, p) => {
      const completedSprints = p.sprints.filter(s => s.end < new Date()).length;
      return sum + (completedSprints / Math.max(p.sprints.length, 1));
    }, 0) / Math.max(coop.projects.length, 1);

    return {
      coop,
      analytics: {
        membership: {
          total: totalMembers,
          active: activeMembers,
          growth: totalMembers > 0 ? ((activeMembers - totalMembers) / totalMembers) * 100 : 0
        },
        governance: {
          total: totalDecisions,
          approved: approvedDecisions,
          pending: pendingDecisions,
          approvalRate: totalDecisions > 0 ? (approvedDecisions / totalDecisions) * 100 : 0
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          totalEquity,
          averageSprintCompletion: averageSprintCompletion * 100
        }
      }
    };
  }

  /**
   * Gets legal entity compliance status
   */
  static async getLegalEntityCompliance(entityId: string) {
    const entity = await prisma.legalEntity.findUnique({
      where: { id: entityId },
      include: {
        documents: {
          include: {
            signatures: true
          }
        },
        projects: {
          include: {
            capEntries: true
          }
        }
      }
    });

    if (!entity) {
      throw new Error('Legal entity not found');
    }

    // Check compliance status
    const complianceRecords = await prisma.complianceRecord.findMany({
      where: { entityId, entityType: 'LEGAL_ENTITY' }
    });

    const complianceStatus = {
      overall: 'COMPLIANT',
      pending: 0,
      overdue: 0,
      nonCompliant: 0
    };

    for (const record of complianceRecords) {
      switch (record.status) {
        case 'PENDING':
          complianceStatus.pending++;
          if (record.dueDate && new Date() > record.dueDate) {
            complianceStatus.overdue++;
            complianceStatus.overall = 'NON_COMPLIANT';
          } else if (complianceStatus.overall === 'COMPLIANT') {
            complianceStatus.overall = 'PENDING';
          }
          break;
        case 'NON_COMPLIANT':
          complianceStatus.nonCompliant++;
          complianceStatus.overall = 'NON_COMPLIANT';
          break;
      }
    }

    return {
      entity,
      compliance: complianceStatus,
      records: complianceRecords
    };
  }

  /**
   * Generates compliance report
   */
  static async generateComplianceReport(entityId: string, entityType: string) {
    const records = await prisma.complianceRecord.findMany({
      where: { entityId, entityType },
      orderBy: { dueDate: 'asc' }
    });

    const report = {
      summary: {
        total: records.length,
        completed: records.filter(r => r.status === 'COMPLETED').length,
        pending: records.filter(r => r.status === 'PENDING').length,
        overdue: records.filter(r => r.status === 'OVERDUE').length,
        nonCompliant: records.filter(r => r.status === 'NON_COMPLIANT').length
      },
      urgent: records.filter(r => 
        r.status === 'OVERDUE' || 
        (r.status === 'PENDING' && r.dueDate && new Date() > r.dueDate)
      ),
      upcoming: records.filter(r => 
        r.status === 'PENDING' && 
        r.dueDate && 
        new Date() <= r.dueDate && 
        new Date(r.dueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ),
      completed: records.filter(r => r.status === 'COMPLETED'),
      records
    };

    return report;
  }
}
