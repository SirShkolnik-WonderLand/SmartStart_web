import { db } from '../config/database.simple.js';

// Initialize default goals
function initGoals() {
  const goals = db.read('goals');
  if (goals.length === 0) {
    const defaultGoals = [
      { goalName: 'Contact Form Submit', goalSlug: 'contact-form', goalType: 'event', goalTrigger: 'contact_form_submit', goalValue: 100, totalConversions: 0, totalValue: 0, active: true },
      { goalName: 'ISO Studio Demo', goalSlug: 'iso-demo', goalType: 'event', goalTrigger: 'iso_demo_request', goalValue: 250, totalConversions: 0, totalValue: 0, active: true },
      { goalName: 'SmartStart Application', goalSlug: 'smartstart-apply', goalType: 'event', goalTrigger: 'smartstart_application', goalValue: 500, totalConversions: 0, totalValue: 0, active: true },
      { goalName: 'Newsletter Signup', goalSlug: 'newsletter', goalType: 'event', goalTrigger: 'newsletter_signup', goalValue: 10, totalConversions: 0, totalValue: 0, active: true },
      { goalName: 'Book a Call', goalSlug: 'book-call', goalType: 'event', goalTrigger: 'book_call_click', goalValue: 200, totalConversions: 0, totalValue: 0, active: true },
    ];
    db.write('goals', defaultGoals.map((g, i) => ({ id: i + 1, ...g, createdAt: new Date().toISOString() })));
  }
}

initGoals();

export async function createGoal(goal: any) {
  try {
    const newGoal = db.insert('goals', goal);
    return { success: true, goalId: newGoal.id };
  } catch (error) {
    return { success: false, error: 'Failed to create goal' };
  }
}

export async function getAllGoals() {
  return db.read('goals');
}

export async function getGoalBySlug(slug: string) {
  return db.findOne('goals', g => g.goalSlug === slug);
}

export async function updateGoal(goalId: number, updates: any) {
  try {
    db.update('goals', g => g.id === goalId, updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update' };
  }
}

export async function deleteGoal(goalId: number) {
  try {
    db.delete('goals', g => g.id === goalId);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete' };
  }
}

export async function getConversionFunnel(steps: string[], dateRange: any) {
  return steps.map((step, idx) => ({
    name: step,
    value: Math.max(100 - idx * 30, 10),
    percentage: 100 - idx * 30,
    dropOff: idx > 0 ? 30 : 0,
    dropOffPercentage: idx > 0 ? 30 : 0,
  }));
}

export async function getGoalPerformance(slug: string, dateRange: any) {
  const goal = await getGoalBySlug(slug);
  return {
    goal,
    conversions: goal?.totalConversions || 0,
    conversionRate: 3.2,
    totalValue: goal?.totalValue || 0,
    trend: [],
  };
}
