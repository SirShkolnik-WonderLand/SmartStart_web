import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CapTableState {
  owner: number;
  alice: number;
  reserve: number;
  userTotal: number;
}

export interface GuardrailConfig {
  ownerMinPct: number;
  aliceCapPct: number;
  contributionMinPct: number;
  contributionMaxPct: number;
}

export const DEFAULT_GUARDRAILS: GuardrailConfig = {
  ownerMinPct: 35,
  aliceCapPct: 25,
  contributionMinPct: 0.5,
  contributionMaxPct: 5
};

export async function getCapTableState(projectId: string): Promise<CapTableState> {
  const entries = await prisma.capTableEntry.findMany({
    where: { projectId }
  });

  const owner = entries
    .filter(e => e.holderType === 'OWNER')
    .reduce((sum, e) => sum + e.pct, 0);
  
  const alice = entries
    .filter(e => e.holderType === 'ALICE')
    .reduce((sum, e) => sum + e.pct, 0);
  
  const reserve = entries
    .filter(e => e.holderType === 'RESERVE')
    .reduce((sum, e) => sum + e.pct, 0);
  
  const userTotal = entries
    .filter(e => e.holderType === 'USER')
    .reduce((sum, e) => sum + e.pct, 0);

  return { owner, alice, reserve, userTotal };
}

export function assertCapTableGuardrails(
  currentState: CapTableState,
  newContributionPct: number,
  config: GuardrailConfig = DEFAULT_GUARDRAILS
): void {
  // Check owner minimum
  if (currentState.owner < config.ownerMinPct) {
    throw new Error(`Owner percentage ${currentState.owner}% is below minimum ${config.ownerMinPct}%`);
  }

  // Check Alice cap
  if (currentState.alice > config.aliceCapPct) {
    throw new Error(`Alice percentage ${currentState.alice}% exceeds cap ${config.aliceCapPct}%`);
  }

  // Check contribution bounds
  if (newContributionPct < config.contributionMinPct || newContributionPct > config.contributionMaxPct) {
    throw new Error(`Contribution percentage ${newContributionPct}% is outside bounds ${config.contributionMinPct}%-${config.contributionMaxPct}%`);
  }

  // Check reserve sufficiency
  if (currentState.reserve < newContributionPct) {
    throw new Error(`Insufficient reserve ${currentState.reserve}% for contribution ${newContributionPct}%`);
  }
}

export async function assertCapTableGuardrailsForProject(
  projectId: string,
  newContributionPct: number,
  config: GuardrailConfig = DEFAULT_GUARDRAILS
): Promise<void> {
  const currentState = await getCapTableState(projectId);
  assertCapTableGuardrails(currentState, newContributionPct, config);
}

export function calculateEquitySuggestion(
  effort: number,
  impact: number,
  baseRate: number = 0.5
): number {
  // Simple formula: base rate + effort bonus + impact bonus
  const effortBonus = Math.min(effort / 20, 2); // Max 2% bonus for effort
  const impactBonus = (impact - 3) * 0.5; // Bonus for impact > 3
  
  const suggested = baseRate + effortBonus + impactBonus;
  
  // Ensure within bounds
  return Math.max(0.5, Math.min(5, suggested));
}

export function validateProjectSettings(
  ownerMinPct: number,
  aliceCapPct: number,
  reservePct: number
): void {
  if (ownerMinPct < 35) {
    throw new Error('Owner minimum cannot be below 35%');
  }
  
  if (aliceCapPct > 25) {
    throw new Error('Alice cap cannot exceed 25%');
  }
  
  if (ownerMinPct + aliceCapPct + reservePct !== 100) {
    throw new Error('Percentages must sum to 100%');
  }
}
