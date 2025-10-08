import { modeQuestions, modeConfig, tiers, topFixes, type AssessmentMode } from './content';

export interface ScoreResult {
  score: number;
  max: number;
  percent: number;
  tier: 'red' | 'amber' | 'green';
  top_fixes: string[];
  compliance_hint: string;
}

// Priority mapping for determining worst answers
const questionPriorityMap: { [key: number]: number } = {
  // Core 12 priorities
  1: 1, // MFA
  5: 2, // EDR
  9: 3, // Backups
  2: 4, // Password Manager
  3: 5, // Offboarding
  6: 6, // Wi-Fi Seg
  7: 7, // Phishing
  11: 8, // IR Plan
  13: 9, // SSO+MFA SaaS
  14: 10, // Access Reviews
  15: 11, // Least-Privilege
  16: 12, // SPF/DKIM/DMARC
  19: 13, // M365 Hardening
  22: 14, // TLS/HSTS+Headers
  28: 15, // Logs+Alerts
  25: 16, // RPO/RTO+DR
};

export function calculateScore(mode: AssessmentMode, answers: number[]): ScoreResult {
  const questions = modeQuestions[mode];
  const maxScore = questions.length * 2; // Each question max score is 2
  
  // Validate answers length
  if (answers.length !== questions.length) {
    throw new Error(`Expected ${questions.length} answers for ${mode} mode, got ${answers.length}`);
  }
  
  // Validate answer values
  if (!answers.every(a => a >= 0 && a <= 2)) {
    throw new Error('All answers must be 0, 1, or 2');
  }
  
  // Calculate total score
  const score = answers.reduce((sum, answer) => sum + answer, 0);
  
  // Calculate percentage
  const percent = score / maxScore;
  
  // Determine tier
  let tier: 'red' | 'amber' | 'green' = 'red';
  for (const tierConfig of tiers) {
    if (percent >= tierConfig.minPercent && percent < tierConfig.maxPercent) {
      tier = tierConfig.name;
      break;
    }
  }
  
  // Get top 3 fixes based on worst answers
  const top_fixes = getTopFixes(answers, questions);
  
  // Get compliance hint based on business type (Q12)
  const compliance_hint = getComplianceHint(answers[11], tier);
  
  return {
    score,
    max: maxScore,
    percent,
    tier,
    top_fixes,
    compliance_hint,
  };
}

function getTopFixes(answers: number[], questions: any[]): string[] {
  // Create array of question scores with priorities
  const questionScores = answers.map((score, index) => ({
    questionId: questions[index].id,
    score,
    priority: questionPriorityMap[questions[index].id] || 999,
  }));
  
  // Sort by score (lowest first) then by priority (lowest first)
  questionScores.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    return a.priority - b.priority;
  });
  
  // Get top 3 unique fixes
  const selectedFixes = new Set<string>();
  const result: string[] = [];
  
  for (const questionScore of questionScores) {
    if (result.length >= 3) break;
    
    const fixName = topFixes[questionScore.priority - 1];
    if (fixName && !selectedFixes.has(fixName)) {
      selectedFixes.add(fixName);
      result.push(fixName);
    }
  }
  
  // Fill remaining slots if needed
  while (result.length < 3 && result.length < topFixes.length) {
    const remainingFix = topFixes[result.length];
    if (!selectedFixes.has(remainingFix)) {
      result.push(remainingFix);
    }
  }
  
  return result.slice(0, 3);
}

function getComplianceHint(businessTypeAnswer: number, tier: 'red' | 'amber' | 'green'): string {
  switch (businessTypeAnswer) {
    case 0: // General SMB (PIPEDA)
      return tier === 'green' 
        ? 'PIPEDA baseline met; consider ISO 27001 for competitive advantage'
        : 'Focus on PIPEDA baseline; consider ISO 27001 for trust';
    
    case 1: // Health (PHIPA)
      return 'PHIPA compliance requires ISO 27001/27799 framework; prioritize data governance';
    
    case 2: // Enterprise/US (ISO 27001/SOC 2)
      return 'ISO 27001 or SOC 2 Type II expected; formal ISMS required for enterprise clients';
    
    default:
      return 'PIPEDA baseline; consider ISO 27001 for competitive advantage';
  }
}