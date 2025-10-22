/**
 * GOAL PROCESSOR SERVICE
 * Manage conversion goals and funnel analysis
 */

import { db } from '../config/database.js';
import { analyticsGoals, analyticsSessions, analyticsEvents } from '../models/schema.js';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import type { ConversionGoal, FunnelStep, DateRange } from '../../shared/types.js';

/**
 * Create a new conversion goal
 */
export async function createGoal(goal: Omit<ConversionGoal, 'id' | 'totalConversions' | 'totalValue' | 'createdAt' | 'updatedAt'>): Promise<{
  success: boolean;
  goalId?: number;
  error?: string;
}> {
  try {
    const [insertedGoal] = await db
      .insert(analyticsGoals)
      .values({
        goalName: goal.goalName,
        goalSlug: goal.goalSlug,
        goalDescription: goal.goalDescription,
        goalType: goal.goalType,
        goalTrigger: goal.goalTrigger,
        goalValue: goal.goalValue.toString(),
        active: goal.active,
      })
      .returning({ id: analyticsGoals.id });

    return {
      success: true,
      goalId: insertedGoal.id,
    };
  } catch (error) {
    console.error('Error creating goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create goal',
    };
  }
}

/**
 * Get all goals
 */
export async function getAllGoals(): Promise<ConversionGoal[]> {
  try {
    const goals = await db
      .select()
      .from(analyticsGoals)
      .orderBy(desc(analyticsGoals.totalConversions));

    return goals.map(mapGoalFromDb);
  } catch (error) {
    console.error('Error getting goals:', error);
    return [];
  }
}

/**
 * Get goal by slug
 */
export async function getGoalBySlug(slug: string): Promise<ConversionGoal | null> {
  try {
    const goals = await db
      .select()
      .from(analyticsGoals)
      .where(eq(analyticsGoals.goalSlug, slug))
      .limit(1);

    if (goals.length === 0) {
      return null;
    }

    return mapGoalFromDb(goals[0]);
  } catch (error) {
    console.error('Error getting goal:', error);
    return null;
  }
}

/**
 * Update goal
 */
export async function updateGoal(
  goalId: number,
  updates: Partial<ConversionGoal>
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(analyticsGoals)
      .set({
        goalName: updates.goalName,
        goalDescription: updates.goalDescription,
        goalType: updates.goalType,
        goalTrigger: updates.goalTrigger,
        goalValue: updates.goalValue?.toString(),
        active: updates.active,
        updatedAt: new Date(),
      })
      .where(eq(analyticsGoals.id, goalId));

    return { success: true };
  } catch (error) {
    console.error('Error updating goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update goal',
    };
  }
}

/**
 * Delete goal
 */
export async function deleteGoal(goalId: number): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(analyticsGoals).where(eq(analyticsGoals.id, goalId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete goal',
    };
  }
}

/**
 * Get conversion funnel
 */
export async function getConversionFunnel(
  funnelSteps: string[],
  dateRange: DateRange
): Promise<FunnelStep[]> {
  try {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    const funnel: FunnelStep[] = [];
    let previousValue = 0;

    for (let i = 0; i < funnelSteps.length; i++) {
      const stepName = funnelSteps[i];
      
      // Count sessions that reached this step
      const result = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})`,
        })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.createdAt, startDate),
            lte(analyticsEvents.createdAt, endDate),
            eq(analyticsEvents.eventName, stepName)
          )
        );

      const value = Number(result[0]?.count || 0);
      const percentage = i === 0 ? 100 : (value / funnel[0].value) * 100;
      const dropOff = i > 0 ? previousValue - value : 0;
      const dropOffPercentage = i > 0 ? (dropOff / previousValue) * 100 : 0;

      funnel.push({
        name: stepName,
        value,
        percentage: Math.round(percentage * 10) / 10,
        dropOff,
        dropOffPercentage: Math.round(dropOffPercentage * 10) / 10,
      });

      previousValue = value;
    }

    return funnel;
  } catch (error) {
    console.error('Error getting conversion funnel:', error);
    return [];
  }
}

/**
 * Get goal performance
 */
export async function getGoalPerformance(
  goalSlug: string,
  dateRange: DateRange
): Promise<{
  goal: ConversionGoal | null;
  conversions: number;
  conversionRate: number;
  totalValue: number;
  trend: Array<{ date: string; conversions: number }>;
}> {
  try {
    const goal = await getGoalBySlug(goalSlug);
    if (!goal) {
      return {
        goal: null,
        conversions: 0,
        conversionRate: 0,
        totalValue: 0,
        trend: [],
      };
    }

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    // Get total sessions
    const sessionsResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(analyticsSessions)
      .where(
        and(
          gte(analyticsSessions.firstSeen, startDate),
          lte(analyticsSessions.firstSeen, endDate)
        )
      );

    const totalSessions = Number(sessionsResult[0]?.count || 0);

    // Get conversions for this goal
    const conversionsResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
        totalValue: sql<number>`SUM(CAST(${analyticsSessions.conversionValue} AS DECIMAL))`,
      })
      .from(analyticsSessions)
      .where(
        and(
          gte(analyticsSessions.firstSeen, startDate),
          lte(analyticsSessions.firstSeen, endDate),
          eq(analyticsSessions.conversionType, goal.goalName)
        )
      );

    const conversions = Number(conversionsResult[0]?.count || 0);
    const totalValue = Number(conversionsResult[0]?.totalValue || 0);
    const conversionRate = (conversions / (totalSessions || 1)) * 100;

    // Get trend (daily conversions)
    const trendResult = await db
      .select({
        date: sql`date_trunc('day', ${analyticsSessions.conversionAt})`,
        conversions: sql<number>`COUNT(*)`,
      })
      .from(analyticsSessions)
      .where(
        and(
          gte(analyticsSessions.conversionAt, startDate),
          lte(analyticsSessions.conversionAt, endDate),
          eq(analyticsSessions.conversionType, goal.goalName)
        )
      )
      .groupBy(sql`date_trunc('day', ${analyticsSessions.conversionAt})`)
      .orderBy(sql`date_trunc('day', ${analyticsSessions.conversionAt})`);

    const trend = trendResult.map((t) => ({
      date: new Date(t.date as any).toISOString().split('T')[0],
      conversions: Number(t.conversions),
    }));

    return {
      goal,
      conversions,
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalValue,
      trend,
    };
  } catch (error) {
    console.error('Error getting goal performance:', error);
    return {
      goal: null,
      conversions: 0,
      conversionRate: 0,
      totalValue: 0,
      trend: [],
    };
  }
}

/**
 * Map database goal to ConversionGoal type
 */
function mapGoalFromDb(dbGoal: any): ConversionGoal {
  return {
    id: dbGoal.id,
    goalName: dbGoal.goalName,
    goalSlug: dbGoal.goalSlug,
    goalDescription: dbGoal.goalDescription || undefined,
    goalType: dbGoal.goalType as any,
    goalTrigger: dbGoal.goalTrigger,
    goalValue: dbGoal.goalValue ? parseFloat(dbGoal.goalValue) : 0,
    totalConversions: dbGoal.totalConversions || 0,
    totalValue: dbGoal.totalValue ? parseFloat(dbGoal.totalValue) : 0,
    lastConversion: dbGoal.lastConversion || undefined,
    active: dbGoal.active,
    createdAt: dbGoal.createdAt,
    updatedAt: dbGoal.updatedAt,
  };
}
