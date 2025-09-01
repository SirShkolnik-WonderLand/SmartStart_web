// Community Recognition Feature
// Kudos, endorsements, and community reputation systems

import { apiCallWithAuth } from '../../utils/api';

export interface CommunityRecognition {
  kudos: Kudos[];
  endorsements: Endorsement[];
  reputation: ReputationScore;
  leaderboard: LeaderboardEntry[];
  recentActivity: RecognitionActivity[];
}

export interface Kudos {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  type: KudosType;
  message?: string;
  projectId?: string;
  createdAt: Date;
}

export interface Endorsement {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  skillId: string;
  skillName: string;
  message?: string;
  createdAt: Date;
}

export interface ReputationScore {
  total: number;
  breakdown: {
    contributions: number;
    collaboration: number;
    leadership: number;
    community: number;
  };
  rank: number;
  percentile: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  reputation: number;
  rank: number;
  level: string;
  recentActivity: string;
}

export interface RecognitionActivity {
  id: string;
  type: 'KUDOS_RECEIVED' | 'KUDOS_GIVEN' | 'ENDORSEMENT_RECEIVED' | 'ENDORSEMENT_GIVEN';
  description: string;
  timestamp: Date;
  relatedUser?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export enum KudosType {
  CONTRIBUTION = 'CONTRIBUTION',
  COLLABORATION = 'COLLABORATION',
  LEADERSHIP = 'LEADERSHIP',
  INNOVATION = 'INNOVATION',
  COMMUNITY = 'COMMUNITY'
}

export class CommunityRecognitionService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getRecognition(userId: string): Promise<CommunityRecognition> {
    try {
      const [kudosResponse, endorsementsResponse, reputationResponse, leaderboardResponse] = await Promise.all([
        apiCallWithAuth(`/users/${userId}/kudos`, this.token),
        apiCallWithAuth(`/users/${userId}/endorsements`, this.token),
        apiCallWithAuth(`/users/${userId}/reputation`, this.token),
        apiCallWithAuth('/community/leaderboard', this.token)
      ]);

      return this.transformRecognitionData(kudosResponse, endorsementsResponse, reputationResponse, leaderboardResponse);
    } catch (error) {
      console.error('Error fetching recognition data:', error);
      return this.generateDefaultRecognition();
    }
  }

  async giveKudos(fromUserId: string, toUserId: string, type: KudosType, message?: string, projectId?: string): Promise<void> {
    try {
      await apiCallWithAuth('/kudos', this.token, {
        method: 'POST',
        body: JSON.stringify({ fromUserId, toUserId, type, message, projectId })
      });
    } catch (error) {
      console.error('Error giving kudos:', error);
      throw error;
    }
  }

  async giveEndorsement(fromUserId: string, toUserId: string, skillId: string, message?: string): Promise<void> {
    try {
      await apiCallWithAuth('/endorsements', this.token, {
        method: 'POST',
        body: JSON.stringify({ fromUserId, toUserId, skillId, message })
      });
    } catch (error) {
      console.error('Error giving endorsement:', error);
      throw error;
    }
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await apiCallWithAuth('/community/leaderboard', this.token);
      return response.leaderboard || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  private transformRecognitionData(kudosData: any, endorsementsData: any, reputationData: any, leaderboardData: any): CommunityRecognition {
    return {
      kudos: (kudosData.kudos || []).map((kudos: any) => ({
        id: kudos.id,
        fromUserId: kudos.fromUserId,
        fromUserName: kudos.fromUserName,
        toUserId: kudos.toUserId,
        type: kudos.type,
        message: kudos.message,
        projectId: kudos.projectId,
        createdAt: new Date(kudos.createdAt)
      })),
      endorsements: (endorsementsData.endorsements || []).map((endorsement: any) => ({
        id: endorsement.id,
        fromUserId: endorsement.fromUserId,
        fromUserName: endorsement.fromUserName,
        toUserId: endorsement.toUserId,
        skillId: endorsement.skillId,
        skillName: endorsement.skillName,
        message: endorsement.message,
        createdAt: new Date(endorsement.createdAt)
      })),
      reputation: {
        total: reputationData.total || 0,
        breakdown: {
          contributions: reputationData.breakdown?.contributions || 0,
          collaboration: reputationData.breakdown?.collaboration || 0,
          leadership: reputationData.breakdown?.leadership || 0,
          community: reputationData.breakdown?.community || 0
        },
        rank: reputationData.rank || 0,
        percentile: reputationData.percentile || 0
      },
      leaderboard: (leaderboardData.leaderboard || []).map((entry: any) => ({
        userId: entry.userId,
        name: entry.name,
        avatar: entry.avatar,
        reputation: entry.reputation,
        rank: entry.rank,
        level: entry.level,
        recentActivity: entry.recentActivity
      })),
      recentActivity: []
    };
  }

  private generateDefaultRecognition(): CommunityRecognition {
    return {
      kudos: [],
      endorsements: [],
      reputation: {
        total: 0,
        breakdown: {
          contributions: 0,
          collaboration: 0,
          leadership: 0,
          community: 0
        },
        rank: 0,
        percentile: 0
      },
      leaderboard: [],
      recentActivity: []
    };
  }
}

export const useCommunityRecognition = (token: string) => {
  const service = new CommunityRecognitionService(token);

  return {
    getRecognition: (userId: string) => service.getRecognition(userId),
    giveKudos: (fromUserId: string, toUserId: string, type: KudosType, message?: string, projectId?: string) => 
      service.giveKudos(fromUserId, toUserId, type, message, projectId),
    giveEndorsement: (fromUserId: string, toUserId: string, skillId: string, message?: string) => 
      service.giveEndorsement(fromUserId, toUserId, skillId, message),
    getLeaderboard: () => service.getLeaderboard()
  };
};
