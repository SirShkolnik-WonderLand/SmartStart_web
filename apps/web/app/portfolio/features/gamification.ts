// Gamification Feature
// Professional gamification system with levels, badges, skills, and reputation
// Based on SmartStart Gamification Framework

import { apiCallWithAuth } from '../../utils/api';

export interface GamificationProfile {
  level: UserLevel;
  xp: number;
  reputation: number;
  title: string;
  avatar: string;
  banner: string;
  imgojes: string[];
  badges: UserBadge[];
  skills: UserSkill[];
  achievements: Achievement[];
  nextMilestone: Milestone;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: BadgeRarity;
  earnedAt: Date;
  progress?: number; // For badges with progress
  maxProgress?: number;
}

export interface UserSkill {
  id: string;
  name: string;
  category: string;
  level: number; // 1-5 scale
  verified: boolean;
  endorsements: number;
  xpInSkill: number;
  lastUsed: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AchievementType;
  unlockedAt: Date;
  progress?: number;
  maxProgress?: number;
}

export interface Milestone {
  type: MilestoneType;
  title: string;
  description: string;
  xpRequired: number;
  currentXp: number;
  rewards: Reward[];
}

export interface Reward {
  type: 'XP' | 'BUZ' | 'BADGE' | 'TITLE' | 'AVATAR' | 'BANNER';
  value: number | string;
  description: string;
}

export interface SkillMap {
  tech: number;
  design: number;
  ops: number;
  growth: number;
  compliance: number;
  leadership: number;
}

// Enums
export enum UserLevel {
  OWLET = 'OWLET',
  NIGHT_WATCHER = 'NIGHT_WATCHER',
  WISE_OWL = 'WISE_OWL',
  SKY_MASTER = 'SKY_MASTER'
}

export enum BadgeRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum AchievementType {
  CONTRIBUTION = 'CONTRIBUTION',
  COLLABORATION = 'COLLABORATION',
  LEADERSHIP = 'LEADERSHIP',
  INNOVATION = 'INNOVATION',
  COMMUNITY = 'COMMUNITY'
}

export enum MilestoneType {
  LEVEL_UP = 'LEVEL_UP',
  BADGE_COUNT = 'BADGE_COUNT',
  SKILL_MASTERY = 'SKILL_MASTERY',
  REPUTATION = 'REPUTATION',
  CONTRIBUTION = 'CONTRIBUTION'
}

// Gamification Service
export class GamificationService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  // Fetch user's gamification profile
  async fetchGamificationProfile(userId: string): Promise<GamificationProfile> {
    try {
      const [userResponse, badgesResponse, skillsResponse] = await Promise.all([
        apiCallWithAuth(`/users/${userId}`, this.token),
        apiCallWithAuth(`/users/${userId}/badges`, this.token),
        apiCallWithAuth(`/users/${userId}/skills`, this.token)
      ]);

      return this.transformGamificationData(userResponse, badgesResponse, skillsResponse);
    } catch (error) {
      console.error('Error fetching gamification profile:', error);
      throw error;
    }
  }

  // Award XP for contribution
  async awardXP(userId: string, amount: number, reason: string): Promise<void> {
    try {
      await apiCallWithAuth(`/users/${userId}/xp`, this.token, {
        method: 'POST',
        body: JSON.stringify({ amount, reason })
      });
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw error;
    }
  }

  // Award reputation points
  async awardReputation(userId: string, amount: number, reason: string): Promise<void> {
    try {
      await apiCallWithAuth(`/users/${userId}/reputation`, this.token, {
        method: 'POST',
        body: JSON.stringify({ amount, reason })
      });
    } catch (error) {
      console.error('Error awarding reputation:', error);
      throw error;
    }
  }

  // Check and award badges
  async checkBadgeEligibility(userId: string, contributionType: string): Promise<UserBadge[]> {
    try {
      const response = await apiCallWithAuth(`/users/${userId}/badges/check`, this.token, {
        method: 'POST',
        body: JSON.stringify({ contributionType })
      });
      return response.newBadges || [];
    } catch (error) {
      console.error('Error checking badge eligibility:', error);
      return [];
    }
  }

  // Update skill level
  async updateSkillLevel(userId: string, skillId: string, newLevel: number): Promise<void> {
    try {
      await apiCallWithAuth(`/users/${userId}/skills/${skillId}`, this.token, {
        method: 'PUT',
        body: JSON.stringify({ level: newLevel })
      });
    } catch (error) {
      console.error('Error updating skill level:', error);
      throw error;
    }
  }

  // Endorse a skill
  async endorseSkill(userId: string, skillId: string, endorserId: string): Promise<void> {
    try {
      await apiCallWithAuth(`/users/${userId}/skills/${skillId}/endorse`, this.token, {
        method: 'POST',
        body: JSON.stringify({ endorserId })
      });
    } catch (error) {
      console.error('Error endorsing skill:', error);
      throw error;
    }
  }

  // Calculate level from XP
  calculateLevel(xp: number): UserLevel {
    if (xp < 1000) return UserLevel.OWLET;
    if (xp < 5000) return UserLevel.NIGHT_WATCHER;
    if (xp < 15000) return UserLevel.WISE_OWL;
    return UserLevel.SKY_MASTER;
  }

  // Calculate XP needed for next level
  calculateXPForNextLevel(currentLevel: UserLevel): number {
    switch (currentLevel) {
      case UserLevel.OWLET: return 1000;
      case UserLevel.NIGHT_WATCHER: return 5000;
      case UserLevel.WISE_OWL: return 15000;
      default: return 0; // Already at max level
    }
  }

  // Generate skill map from user skills
  generateSkillMap(skills: UserSkill[]): SkillMap {
    const skillMap: SkillMap = {
      tech: 0,
      design: 0,
      ops: 0,
      growth: 0,
      compliance: 0,
      leadership: 0
    };

    skills.forEach(skill => {
      const category = skill.category.toLowerCase();
      if (category.includes('tech') || category.includes('code') || category.includes('development')) {
        skillMap.tech = Math.max(skillMap.tech, skill.level);
      } else if (category.includes('design') || category.includes('ui') || category.includes('ux')) {
        skillMap.design = Math.max(skillMap.design, skill.level);
      } else if (category.includes('ops') || category.includes('operations') || category.includes('management')) {
        skillMap.ops = Math.max(skillMap.ops, skill.level);
      } else if (category.includes('growth') || category.includes('marketing') || category.includes('sales')) {
        skillMap.growth = Math.max(skillMap.growth, skill.level);
      } else if (category.includes('compliance') || category.includes('legal') || category.includes('security')) {
        skillMap.compliance = Math.max(skillMap.compliance, skill.level);
      } else if (category.includes('leadership') || category.includes('management') || category.includes('strategy')) {
        skillMap.leadership = Math.max(skillMap.leadership, skill.level);
      }
    });

    return skillMap;
  }

  // Generate next milestone
  generateNextMilestone(profile: GamificationProfile): Milestone {
    const currentLevel = profile.level;
    const xpForNext = this.calculateXPForNextLevel(currentLevel);
    const xpNeeded = xpForNext - profile.xp;

    if (xpNeeded > 0) {
      return {
        type: MilestoneType.LEVEL_UP,
        title: `Reach ${this.getNextLevelName(currentLevel)}`,
        description: `Earn ${xpNeeded} more XP to level up`,
        xpRequired: xpForNext,
        currentXp: profile.xp,
        rewards: [
          {
            type: 'TITLE',
            value: this.getNextLevelName(currentLevel),
            description: 'New professional title'
          },
          {
            type: 'AVATAR',
            value: 'level-up-avatar',
            description: 'Enhanced avatar frame'
          }
        ]
      };
    }

    // Check for badge milestone
    const badgeCount = profile.badges.length;
    const nextBadgeMilestone = Math.ceil(badgeCount / 5) * 5;
    
    return {
      type: MilestoneType.BADGE_COUNT,
      title: `Earn ${nextBadgeMilestone} Badges`,
      description: `Collect ${nextBadgeMilestone - badgeCount} more badges`,
      xpRequired: nextBadgeMilestone * 100,
      currentXp: badgeCount * 100,
      rewards: [
        {
          type: 'BANNER',
          value: 'badge-master-banner',
          description: 'Badge master banner'
        }
      ]
    };
  }

  // Private helper methods
  private transformGamificationData(userData: any, badgesData: any, skillsData: any): GamificationProfile {
    const level = this.calculateLevel(userData.xp || 0);
    const badges = badgesData.map((badge: any) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      rarity: badge.rarity,
      earnedAt: new Date(badge.earnedAt),
      progress: badge.progress,
      maxProgress: badge.maxProgress
    }));

    const skills = skillsData.map((skill: any) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      level: skill.level,
      verified: skill.verified,
      endorsements: skill.endorsements,
      xpInSkill: skill.xpInSkill,
      lastUsed: new Date(skill.lastUsed)
    }));

    const profile: GamificationProfile = {
      level,
      xp: userData.xp || 0,
      reputation: userData.reputation || 0,
      title: this.generateTitle(level, userData.reputation || 0),
      avatar: userData.avatar || 'default-avatar',
      banner: userData.banner || 'default-banner',
      imgojes: userData.imgojes || [],
      badges,
      skills,
      achievements: [], // TODO: Implement achievements
      nextMilestone: this.generateNextMilestone({ level, xp: userData.xp || 0, reputation: userData.reputation || 0, badges, skills, achievements: [], title: '', avatar: '', banner: '', imgojes: [], nextMilestone: {} as Milestone })
    };

    return profile;
  }

  private getNextLevelName(currentLevel: UserLevel): string {
    switch (currentLevel) {
      case UserLevel.OWLET: return 'Night Watcher';
      case UserLevel.NIGHT_WATCHER: return 'Wise Owl';
      case UserLevel.WISE_OWL: return 'Sky Master';
      default: return 'Legendary';
    }
  }

  private generateTitle(level: UserLevel, reputation: number): string {
    const titles = {
      [UserLevel.OWLET]: ['Contributor', 'Builder', 'Learner'],
      [UserLevel.NIGHT_WATCHER]: ['Venture Builder', 'Ops Architect', 'Growth Hacker'],
      [UserLevel.WISE_OWL]: ['Tech Architect', 'Strategy Master', 'Innovation Leader'],
      [UserLevel.SKY_MASTER]: ['Venture Master', 'Hub Legend', 'Ecosystem Builder']
    };

    const levelTitles = titles[level];
    const titleIndex = Math.min(Math.floor(reputation / 100), levelTitles.length - 1);
    return levelTitles[titleIndex];
  }
}

// Gamification Hooks
export const useGamification = (token: string) => {
  const service = new GamificationService(token);

  const fetchProfile = async (userId: string) => {
    return await service.fetchGamificationProfile(userId);
  };

  const awardXP = async (userId: string, amount: number, reason: string) => {
    return await service.awardXP(userId, amount, reason);
  };

  const awardReputation = async (userId: string, amount: number, reason: string) => {
    return await service.awardReputation(userId, amount, reason);
  };

  const checkBadges = async (userId: string, contributionType: string) => {
    return await service.checkBadgeEligibility(userId, contributionType);
  };

  const updateSkill = async (userId: string, skillId: string, newLevel: number) => {
    return await service.updateSkillLevel(userId, skillId, newLevel);
  };

  const endorseSkill = async (userId: string, skillId: string, endorserId: string) => {
    return await service.endorseSkill(userId, skillId, endorserId);
  };

  const calculateLevel = (xp: number) => {
    return service.calculateLevel(xp);
  };

  const generateSkillMap = (skills: UserSkill[]) => {
    return service.generateSkillMap(skills);
  };

  const generateMilestone = (profile: GamificationProfile) => {
    return service.generateNextMilestone(profile);
  };

  return {
    fetchProfile,
    awardXP,
    awardReputation,
    checkBadges,
    updateSkill,
    endorseSkill,
    calculateLevel,
    generateSkillMap,
    generateMilestone
  };
};
