// Vesting Tracking Feature
// Equity vesting schedules and timelines

import { apiCallWithAuth } from '../../utils/api';

export interface VestingTracking {
  schedules: VestingTrackingSchedule[];
  upcomingVesting: UpcomingVesting[];
  vestingHistory: VestingHistory[];
  totalVested: number;
  totalUnvested: number;
}

export interface VestingTrackingSchedule {
  id: string;
  projectId: string;
  projectName: string;
  userId: string;
  totalEquity: number;
  vestedEquity: number;
  unvestedEquity: number;
  vestingType: 'IMMEDIATE' | 'CLIFF' | 'GRADUAL';
  startDate: Date;
  endDate?: Date;
  cliffDate?: Date;
  vestingPeriod: number; // in months
  vestingEvents: VestingEvent[];
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
}

export interface VestingEvent {
  id: string;
  date: Date;
  equityAmount: number;
  type: 'CLIFF' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  status: 'PENDING' | 'VESTED' | 'FORFEITED';
  notes?: string;
}

export interface UpcomingVesting {
  id: string;
  projectName: string;
  vestingDate: Date;
  equityAmount: number;
  daysUntilVesting: number;
  type: 'CLIFF' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
}

export interface VestingHistory {
  id: string;
  projectName: string;
  vestingDate: Date;
  equityAmount: number;
  type: 'CLIFF' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  status: 'VESTED' | 'FORFEITED';
}

export class VestingTrackingService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getVestingTracking(userId: string): Promise<VestingTracking> {
    try {
      const response = await apiCallWithAuth(`/smart-contracts/vesting/${userId}`, this.token);
      return this.transformVestingData(response);
    } catch (error) {
      console.error('Error fetching vesting tracking data:', error);
      return this.generateDefaultVestingTracking();
    }
  }

  async getVestingSchedule(scheduleId: string): Promise<VestingTrackingSchedule> {
    try {
      const response = await apiCallWithAuth(`/smart-contracts/vesting/schedule/${scheduleId}`, this.token);
      return this.transformVestingSchedule(response);
    } catch (error) {
      console.error('Error fetching vesting schedule:', error);
      throw error;
    }
  }

  async calculateVestingProgress(scheduleId: string): Promise<{ vested: number; unvested: number; progress: number }> {
    try {
      const schedule = await this.getVestingSchedule(scheduleId);
      const now = new Date();
      const startDate = new Date(schedule.startDate);
      
      if (schedule.vestingType === 'IMMEDIATE') {
        return {
          vested: schedule.totalEquity,
          unvested: 0,
          progress: 100
        };
      }

      if (schedule.vestingType === 'CLIFF' && schedule.cliffDate) {
        const cliffDate = new Date(schedule.cliffDate);
        if (now >= cliffDate) {
          return {
            vested: schedule.totalEquity,
            unvested: 0,
            progress: 100
          };
        } else {
          return {
            vested: 0,
            unvested: schedule.totalEquity,
            progress: 0
          };
        }
      }

      // Gradual vesting
      const totalMonths = schedule.vestingPeriod;
      const monthsElapsed = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const progress = Math.min(100, (monthsElapsed / totalMonths) * 100);
      const vested = (schedule.totalEquity * progress) / 100;
      const unvested = schedule.totalEquity - vested;

      return { vested, unvested, progress };
    } catch (error) {
      console.error('Error calculating vesting progress:', error);
      return { vested: 0, unvested: 0, progress: 0 };
    }
  }

  async getUpcomingVesting(userId: string, days: number = 30): Promise<UpcomingVesting[]> {
    try {
      const response = await apiCallWithAuth(`/smart-contracts/vesting/upcoming/${userId}?days=${days}`, this.token);
      return (response.upcoming || []).map((vesting: any) => ({
        id: vesting.id,
        projectName: vesting.projectName,
        vestingDate: new Date(vesting.vestingDate),
        equityAmount: vesting.equityAmount,
        daysUntilVesting: vesting.daysUntilVesting,
        type: vesting.type
      }));
    } catch (error) {
      console.error('Error fetching upcoming vesting:', error);
      return [];
    }
  }

  private transformVestingData(data: any): VestingTracking {
    return {
      schedules: (data.schedules || []).map((schedule: any) => this.transformVestingSchedule(schedule)),
      upcomingVesting: (data.upcomingVesting || []).map((vesting: any) => ({
        id: vesting.id,
        projectName: vesting.projectName,
        vestingDate: new Date(vesting.vestingDate),
        equityAmount: vesting.equityAmount,
        daysUntilVesting: vesting.daysUntilVesting,
        type: vesting.type
      })),
      vestingHistory: (data.vestingHistory || []).map((history: any) => ({
        id: history.id,
        projectName: history.projectName,
        vestingDate: new Date(history.vestingDate),
        equityAmount: history.equityAmount,
        type: history.type,
        status: history.status
      })),
      totalVested: data.totalVested || 0,
      totalUnvested: data.totalUnvested || 0
    };
  }

  private transformVestingSchedule(data: any): VestingTrackingSchedule {
    return {
      id: data.id,
      projectId: data.projectId,
      projectName: data.projectName,
      userId: data.userId,
      totalEquity: data.totalEquity,
      vestedEquity: data.vestedEquity,
      unvestedEquity: data.unvestedEquity,
      vestingType: data.vestingType,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      cliffDate: data.cliffDate ? new Date(data.cliffDate) : undefined,
      vestingPeriod: data.vestingPeriod,
      vestingEvents: (data.vestingEvents || []).map((event: any) => ({
        id: event.id,
        date: new Date(event.date),
        equityAmount: event.equityAmount,
        type: event.type,
        status: event.status,
        notes: event.notes
      })),
      status: data.status
    };
  }

  private generateDefaultVestingTracking(): VestingTracking {
    return {
      schedules: [],
      upcomingVesting: [],
      vestingHistory: [],
      totalVested: 0,
      totalUnvested: 0
    };
  }
}

export const useVestingTracking = (token: string) => {
  const service = new VestingTrackingService(token);

  return {
    getVestingTracking: (userId: string) => service.getVestingTracking(userId),
    getVestingSchedule: (scheduleId: string) => service.getVestingSchedule(scheduleId),
    calculateVestingProgress: (scheduleId: string) => service.calculateVestingProgress(scheduleId),
    getUpcomingVesting: (userId: string, days?: number) => service.getUpcomingVesting(userId, days)
  };
};
