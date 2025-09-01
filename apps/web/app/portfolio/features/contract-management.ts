// Contract Management Feature
// Smart contracts, equity agreements, and legal compliance

import { apiCallWithAuth } from '../../utils/api';

export interface ContractManagement {
  offers: ContractOffer[];
  signedContracts: SignedContract[];
  pendingSignatures: PendingSignature[];
  contractHistory: ContractHistory[];
}

export interface ContractOffer {
  id: string;
  projectId: string;
  projectName: string;
  recipientId: string;
  equityPercentage: number;
  contributionType: string;
  effortRequired: number;
  impactExpected: number;
  vestingSchedule: ContractVestingSchedule;
  deliverables: string[];
  milestones: Milestone[];
  terms: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  expiresAt: Date;
  createdAt: Date;
}

export interface SignedContract {
  id: string;
  projectId: string;
  projectName: string;
  equityPercentage: number;
  contributionType: string;
  signedAt: Date;
  vestingSchedule: ContractVestingSchedule;
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  deliverables: Deliverable[];
  milestones: Milestone[];
}

export interface PendingSignature {
  id: string;
  contractId: string;
  contractType: string;
  signerId: string;
  signerName: string;
  deadline: Date;
  status: 'PENDING' | 'SIGNED' | 'EXPIRED';
}

export interface ContractHistory {
  id: string;
  contractId: string;
  action: string;
  timestamp: Date;
  actor: string;
  details: string;
}

export interface ContractVestingSchedule {
  type: 'IMMEDIATE' | 'CLIFF' | 'GRADUAL';
  startDate: Date;
  endDate?: Date;
  cliffDate?: Date;
  vestingPeriod: number; // in months
  vestingPercentage: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  equityPercentage: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  completionDate?: Date;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  type: 'CODE' | 'DESIGN' | 'DOCUMENTATION' | 'TESTING' | 'DEPLOYMENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED';
  dueDate: Date;
  completedDate?: Date;
  reviewerId?: string;
  reviewNotes?: string;
}

export class ContractManagementService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getContractManagement(userId: string): Promise<ContractManagement> {
    try {
      const [offersResponse, contractsResponse, signaturesResponse, historyResponse] = await Promise.all([
        apiCallWithAuth(`/smart-contracts/offers/user/${userId}`, this.token),
        apiCallWithAuth(`/smart-contracts/signed/${userId}`, this.token),
        apiCallWithAuth(`/smart-contracts/pending-signatures/${userId}`, this.token),
        apiCallWithAuth(`/smart-contracts/history/${userId}`, this.token)
      ]);

      return this.transformContractData(offersResponse, contractsResponse, signaturesResponse, historyResponse);
    } catch (error) {
      console.error('Error fetching contract management data:', error);
      return this.generateDefaultContractManagement();
    }
  }

  async acceptContract(contractId: string, reason?: string): Promise<void> {
    try {
      await apiCallWithAuth(`/smart-contracts/offers/${contractId}/accept`, this.token, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    } catch (error) {
      console.error('Error accepting contract:', error);
      throw error;
    }
  }

  async rejectContract(contractId: string, reason?: string): Promise<void> {
    try {
      await apiCallWithAuth(`/smart-contracts/offers/${contractId}/reject`, this.token, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    } catch (error) {
      console.error('Error rejecting contract:', error);
      throw error;
    }
  }

  async signContract(contractId: string, signature: string): Promise<void> {
    try {
      await apiCallWithAuth(`/smart-contracts/sign/${contractId}`, this.token, {
        method: 'POST',
        body: JSON.stringify({ signature })
      });
    } catch (error) {
      console.error('Error signing contract:', error);
      throw error;
    }
  }

  async updateMilestone(milestoneId: string, status: string, completionDate?: Date): Promise<void> {
    try {
      await apiCallWithAuth(`/smart-contracts/milestones/${milestoneId}`, this.token, {
        method: 'PUT',
        body: JSON.stringify({ status, completionDate })
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  }

  async submitDeliverable(deliverableId: string, submission: any): Promise<void> {
    try {
      await apiCallWithAuth(`/smart-contracts/deliverables/${deliverableId}/submit`, this.token, {
        method: 'POST',
        body: JSON.stringify(submission)
      });
    } catch (error) {
      console.error('Error submitting deliverable:', error);
      throw error;
    }
  }

  private transformContractData(offersData: any, contractsData: any, signaturesData: any, historyData: any): ContractManagement {
    return {
      offers: (offersData.offers || []).map((offer: any) => ({
        id: offer.id,
        projectId: offer.projectId,
        projectName: offer.projectName,
        recipientId: offer.recipientId,
        equityPercentage: offer.equityPercentage,
        contributionType: offer.contributionType,
        effortRequired: offer.effortRequired,
        impactExpected: offer.impactExpected,
        vestingSchedule: this.transformVestingSchedule(offer.vestingSchedule),
        deliverables: offer.deliverables || [],
        milestones: offer.milestones || [],
        terms: offer.terms,
        status: offer.status,
        expiresAt: new Date(offer.expiresAt),
        createdAt: new Date(offer.createdAt)
      })),
      signedContracts: (contractsData.contracts || []).map((contract: any) => ({
        id: contract.id,
        projectId: contract.projectId,
        projectName: contract.projectName,
        equityPercentage: contract.equityPercentage,
        contributionType: contract.contributionType,
        signedAt: new Date(contract.signedAt),
        vestingSchedule: this.transformVestingSchedule(contract.vestingSchedule),
        status: contract.status,
        deliverables: contract.deliverables || [],
        milestones: contract.milestones || []
      })),
      pendingSignatures: (signaturesData.signatures || []).map((signature: any) => ({
        id: signature.id,
        contractId: signature.contractId,
        contractType: signature.contractType,
        signerId: signature.signerId,
        signerName: signature.signerName,
        deadline: new Date(signature.deadline),
        status: signature.status
      })),
      contractHistory: (historyData.history || []).map((history: any) => ({
        id: history.id,
        contractId: history.contractId,
        action: history.action,
        timestamp: new Date(history.timestamp),
        actor: history.actor,
        details: history.details
      }))
    };
  }

  private transformVestingSchedule(data: any): ContractVestingSchedule {
    return {
      type: data.type,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      cliffDate: data.cliffDate ? new Date(data.cliffDate) : undefined,
      vestingPeriod: data.vestingPeriod,
      vestingPercentage: data.vestingPercentage
    };
  }

  private generateDefaultContractManagement(): ContractManagement {
    return {
      offers: [],
      signedContracts: [],
      pendingSignatures: [],
      contractHistory: []
    };
  }
}

export const useContractManagement = (token: string) => {
  const service = new ContractManagementService(token);

  return {
    getContractManagement: (userId: string) => service.getContractManagement(userId),
    acceptContract: (contractId: string, reason?: string) => service.acceptContract(contractId, reason),
    rejectContract: (contractId: string, reason?: string) => service.rejectContract(contractId, reason),
    signContract: (contractId: string, signature: string) => service.signContract(contractId, signature),
    updateMilestone: (milestoneId: string, status: string, completionDate?: Date) => 
      service.updateMilestone(milestoneId, status, completionDate),
    submitDeliverable: (deliverableId: string, submission: any) => service.submitDeliverable(deliverableId, submission)
  };
};
