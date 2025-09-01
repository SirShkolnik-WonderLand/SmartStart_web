// BUZ Coin Economy Feature
// Internal token system for recognition, upgrades, and community interaction
// Based on SmartStart BUZ Economy Framework

import { apiCallWithAuth } from '../../utils/api';

export interface BUZWallet {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: BUZTransaction[];
  unlockables: BUZUnlockable[];
  recentActivity: BUZActivity[];
}

export interface BUZTransaction {
  id: string;
  type: 'EARN' | 'SPEND' | 'TRANSFER' | 'BONUS';
  amount: number;
  description: string;
  category: BUZCategory;
  timestamp: Date;
  relatedEntity?: {
    type: 'CONTRIBUTION' | 'BADGE' | 'CHALLENGE' | 'PURCHASE';
    id: string;
    name: string;
  };
}

export interface BUZUnlockable {
  id: string;
  name: string;
  description: string;
  type: BUZUnlockableType;
  cost: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  preview?: string;
  rarity: BUZRarity;
}

export interface BUZActivity {
  id: string;
  type: 'EARNED' | 'SPENT' | 'UNLOCKED' | 'BONUS';
  description: string;
  amount?: number;
  timestamp: Date;
  icon: string;
}

export interface BUZChallenge {
  id: string;
  name: string;
  description: string;
  reward: number;
  requirements: BUZRequirement[];
  expiresAt: Date;
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
}

export interface BUZRequirement {
  type: 'CONTRIBUTION' | 'BADGE' | 'SKILL' | 'REPUTATION' | 'ACTIVITY';
  target: string;
  value: number;
  current: number;
}

// Enums
export enum BUZCategory {
  CONTRIBUTION = 'CONTRIBUTION',
  RECOGNITION = 'RECOGNITION',
  CHALLENGE = 'CHALLENGE',
  PURCHASE = 'PURCHASE',
  BONUS = 'BONUS',
  TRANSFER = 'TRANSFER'
}

export enum BUZUnlockableType {
  AVATAR_FRAME = 'AVATAR_FRAME',
  PROFILE_BANNER = 'PROFILE_BANNER',
  CUSTOM_TITLE = 'CUSTOM_TITLE',
  IMGOJE = 'IMGOJE',
  THEME = 'THEME',
  BADGE_FRAME = 'BADGE_FRAME',
  ANIMATION = 'ANIMATION'
}

export enum BUZRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

// BUZ Economy Service
export class BUZEconomyService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  // Fetch user's BUZ wallet
  async fetchBUZWallet(userId: string): Promise<BUZWallet> {
    try {
      const response = await apiCallWithAuth(`/users/${userId}/buz-wallet`, this.token);
      return this.transformWalletData(response);
    } catch (error) {
      console.error('Error fetching BUZ wallet:', error);
      throw error;
    }
  }

  // Award BUZ for contribution
  async awardBUZ(userId: string, amount: number, reason: string, category: BUZCategory, entityId?: string): Promise<void> {
    try {
      await apiCallWithAuth(`/users/${userId}/buz/award`, this.token, {
        method: 'POST',
        body: JSON.stringify({ amount, reason, category, entityId })
      });
    } catch (error) {
      console.error('Error awarding BUZ:', error);
      throw error;
    }
  }

  // Spend BUZ on unlockable
  async spendBUZ(userId: string, unlockableId: string): Promise<BUZUnlockable> {
    try {
      const response = await apiCallWithAuth(`/users/${userId}/buz/spend`, this.token, {
        method: 'POST',
        body: JSON.stringify({ unlockableId })
      });
      return response.unlockable;
    } catch (error) {
      console.error('Error spending BUZ:', error);
      throw error;
    }
  }

  // Transfer BUZ to another user
  async transferBUZ(userId: string, recipientId: string, amount: number, reason: string): Promise<void> {
    try {
      await apiCallWithAuth(`/users/${userId}/buz/transfer`, this.token, {
        method: 'POST',
        body: JSON.stringify({ recipientId, amount, reason })
      });
    } catch (error) {
      console.error('Error transferring BUZ:', error);
      throw error;
    }
  }

  // Get available unlockables
  async getUnlockables(userId: string): Promise<BUZUnlockable[]> {
    try {
      const response = await apiCallWithAuth(`/users/${userId}/buz/unlockables`, this.token);
      return response.unlockables || [];
    } catch (error) {
      console.error('Error fetching unlockables:', error);
      return [];
    }
  }

  // Get active challenges
  async getChallenges(userId: string): Promise<BUZChallenge[]> {
    try {
      const response = await apiCallWithAuth(`/users/${userId}/buz/challenges`, this.token);
      return response.challenges || [];
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
  }

  // Complete a challenge
  async completeChallenge(userId: string, challengeId: string): Promise<BUZTransaction> {
    try {
      const response = await apiCallWithAuth(`/users/${userId}/buz/challenges/${challengeId}/complete`, this.token, {
        method: 'POST'
      });
      return response.transaction;
    } catch (error) {
      console.error('Error completing challenge:', error);
      throw error;
    }
  }

  // Get BUZ leaderboard
  async getLeaderboard(): Promise<BUZLeaderboardEntry[]> {
    try {
      const response = await apiCallWithAuth('/buz/leaderboard', this.token);
      return response.leaderboard || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // Calculate BUZ rewards for contribution
  calculateContributionReward(contributionType: string, effort: number, impact: number): number {
    const baseReward = 50; // Base BUZ for any contribution
    const effortMultiplier = Math.min(effort / 10, 2); // Max 2x for effort
    const impactMultiplier = Math.min(impact / 5, 3); // Max 3x for impact
    
    // Type-specific bonuses
    const typeBonuses = {
      'CODE': 1.5,
      'DESIGN': 1.3,
      'MARKETING': 1.2,
      'OPS': 1.1,
      'SALES': 1.4,
      'COMPLIANCE': 1.6
    };
    
    const typeMultiplier = typeBonuses[contributionType as keyof typeof typeBonuses] || 1.0;
    
    return Math.round(baseReward * effortMultiplier * impactMultiplier * typeMultiplier);
  }

  // Calculate BUZ rewards for recognition
  calculateRecognitionReward(recognitionType: string, fromUserLevel: string): number {
    const baseReward = 25; // Base BUZ for recognition
    
    const typeMultipliers = {
      'KUDOS': 1.0,
      'ENDORSEMENT': 1.5,
      'RECOMMENDATION': 2.0,
      'MENTORSHIP': 3.0
    };
    
    const levelMultipliers = {
      'OWLET': 0.5,
      'NIGHT_WATCHER': 1.0,
      'WISE_OWL': 1.5,
      'SKY_MASTER': 2.0
    };
    
    const typeMultiplier = typeMultipliers[recognitionType as keyof typeof typeMultipliers] || 1.0;
    const levelMultiplier = levelMultipliers[fromUserLevel as keyof typeof levelMultipliers] || 1.0;
    
    return Math.round(baseReward * typeMultiplier * levelMultiplier);
  }

  // Generate default unlockables
  generateDefaultUnlockables(): BUZUnlockable[] {
    return [
      {
        id: 'avatar-frame-basic',
        name: 'Basic Avatar Frame',
        description: 'A simple frame for your profile avatar',
        type: BUZUnlockableType.AVATAR_FRAME,
        cost: 100,
        isUnlocked: false,
        rarity: BUZRarity.COMMON,
        preview: '🖼️'
      },
      {
        id: 'profile-banner-gradient',
        name: 'Gradient Banner',
        description: 'A beautiful gradient banner for your profile',
        type: BUZUnlockableType.PROFILE_BANNER,
        cost: 250,
        isUnlocked: false,
        rarity: BUZRarity.UNCOMMON,
        preview: '🌈'
      },
      {
        id: 'custom-title-builder',
        name: 'Custom Title: Builder',
        description: 'Add "Builder" to your professional title',
        type: BUZUnlockableType.CUSTOM_TITLE,
        cost: 500,
        isUnlocked: false,
        rarity: BUZRarity.RARE,
        preview: '🏗️'
      },
      {
        id: 'imgoje-star',
        name: 'Star Imgoje',
        description: 'A star emoji for your messages',
        type: BUZUnlockableType.IMGOJE,
        cost: 75,
        isUnlocked: false,
        rarity: BUZRarity.COMMON,
        preview: '⭐'
      },
      {
        id: 'theme-dark',
        name: 'Dark Theme',
        description: 'Unlock dark theme for your profile',
        type: BUZUnlockableType.THEME,
        cost: 300,
        isUnlocked: false,
        rarity: BUZRarity.UNCOMMON,
        preview: '🌙'
      },
      {
        id: 'badge-frame-gold',
        name: 'Gold Badge Frame',
        description: 'A golden frame for your earned badges',
        type: BUZUnlockableType.BADGE_FRAME,
        cost: 1000,
        isUnlocked: false,
        rarity: BUZRarity.EPIC,
        preview: '🥇'
      },
      {
        id: 'animation-sparkle',
        name: 'Sparkle Animation',
        description: 'Add sparkle animation to your profile',
        type: BUZUnlockableType.ANIMATION,
        cost: 750,
        isUnlocked: false,
        rarity: BUZRarity.RARE,
        preview: '✨'
      }
    ];
  }

  // Generate default challenges
  generateDefaultChallenges(): BUZChallenge[] {
    return [
      {
        id: 'first-contribution',
        name: 'First Contribution',
        description: 'Make your first contribution to a project',
        reward: 100,
        requirements: [
          {
            type: 'CONTRIBUTION',
            target: 'any',
            value: 1,
            current: 0
          }
        ],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isCompleted: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'skill-master',
        name: 'Skill Master',
        description: 'Reach level 5 in any skill',
        reward: 250,
        requirements: [
          {
            type: 'SKILL',
            target: 'any',
            value: 5,
            current: 0
          }
        ],
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isCompleted: false,
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'badge-collector',
        name: 'Badge Collector',
        description: 'Earn 5 different badges',
        reward: 500,
        requirements: [
          {
            type: 'BADGE',
            target: 'unique',
            value: 5,
            current: 0
          }
        ],
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isCompleted: false,
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'community-helper',
        name: 'Community Helper',
        description: 'Give 10 kudos to other members',
        reward: 150,
        requirements: [
          {
            type: 'ACTIVITY',
            target: 'kudos_given',
            value: 10,
            current: 0
          }
        ],
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        isCompleted: false,
        progress: 0,
        maxProgress: 10
      }
    ];
  }

  // Private helper methods
  private transformWalletData(data: any): BUZWallet {
    return {
      balance: data.balance || 0,
      totalEarned: data.totalEarned || 0,
      totalSpent: data.totalSpent || 0,
      transactions: (data.transactions || []).map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        timestamp: new Date(tx.timestamp),
        relatedEntity: tx.relatedEntity
      })),
      unlockables: (data.unlockables || []).map((unlockable: any) => ({
        id: unlockable.id,
        name: unlockable.name,
        description: unlockable.description,
        type: unlockable.type,
        cost: unlockable.cost,
        isUnlocked: unlockable.isUnlocked,
        unlockedAt: unlockable.unlockedAt ? new Date(unlockable.unlockedAt) : undefined,
        preview: unlockable.preview,
        rarity: unlockable.rarity
      })),
      recentActivity: (data.recentActivity || []).map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        amount: activity.amount,
        timestamp: new Date(activity.timestamp),
        icon: activity.icon
      }))
    };
  }
}

export interface BUZLeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  balance: number;
  totalEarned: number;
  rank: number;
  level: string;
}

// BUZ Economy Hooks
export const useBUZEconomy = (token: string) => {
  const service = new BUZEconomyService(token);

  const fetchWallet = async (userId: string) => {
    return await service.fetchBUZWallet(userId);
  };

  const awardBUZ = async (userId: string, amount: number, reason: string, category: BUZCategory, entityId?: string) => {
    return await service.awardBUZ(userId, amount, reason, category, entityId);
  };

  const spendBUZ = async (userId: string, unlockableId: string) => {
    return await service.spendBUZ(userId, unlockableId);
  };

  const transferBUZ = async (userId: string, recipientId: string, amount: number, reason: string) => {
    return await service.transferBUZ(userId, recipientId, amount, reason);
  };

  const getUnlockables = async (userId: string) => {
    return await service.getUnlockables(userId);
  };

  const getChallenges = async (userId: string) => {
    return await service.getChallenges(userId);
  };

  const completeChallenge = async (userId: string, challengeId: string) => {
    return await service.completeChallenge(userId, challengeId);
  };

  const getLeaderboard = async () => {
    return await service.getLeaderboard();
  };

  const calculateContributionReward = (contributionType: string, effort: number, impact: number) => {
    return service.calculateContributionReward(contributionType, effort, impact);
  };

  const calculateRecognitionReward = (recognitionType: string, fromUserLevel: string) => {
    return service.calculateRecognitionReward(recognitionType, fromUserLevel);
  };

  const generateDefaultUnlockables = () => {
    return service.generateDefaultUnlockables();
  };

  const generateDefaultChallenges = () => {
    return service.generateDefaultChallenges();
  };

  return {
    fetchWallet,
    awardBUZ,
    spendBUZ,
    transferBUZ,
    getUnlockables,
    getChallenges,
    completeChallenge,
    getLeaderboard,
    calculateContributionReward,
    calculateRecognitionReward,
    generateDefaultUnlockables,
    generateDefaultChallenges
  };
};
