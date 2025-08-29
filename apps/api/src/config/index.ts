export interface AppConfig {
  // Server
  port: number;
  nodeEnv: string;
  
  // Database
  databaseUrl: string;
  
  // Security
  sessionSecret: string;
  corsOrigin: string;
  
  // Business Logic
  guardrails: {
    ownerMinPct: number;
    aliceCapPct: number;
    contributionMinPct: number;
    contributionMaxPct: number;
  };
  
  // Rate Limiting
  rateLimits: {
    auth: { windowMs: number; max: number };
    api: { windowMs: number; max: number };
    ideas: { windowMs: number; max: number };
    polls: { windowMs: number; max: number };
  };
  
  // Pagination
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
}

export const config: AppConfig = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smartstart',
  
  // Security
  sessionSecret: process.env.SESSION_SECRET || 'smartstart-secret-key-change-in-production',
  corsOrigin: process.env.NODE_ENV === 'production' 
    ? (process.env.WEB_URL || 'http://localhost:3000')
    : 'http://localhost:3000',
  
  // Business Logic
  guardrails: {
    ownerMinPct: parseInt(process.env.OWNER_MIN_PCT || '35', 10),
    aliceCapPct: parseInt(process.env.ALICE_CAP_PCT || '25', 10),
    contributionMinPct: parseFloat(process.env.CONTRIBUTION_MIN_PCT || '0.5'),
    contributionMaxPct: parseFloat(process.env.CONTRIBUTION_MAX_PCT || '5.0'),
  },
  
  // Rate Limiting
  rateLimits: {
    auth: { 
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.AUTH_RATE_LIMIT || '5', 10)
    },
    api: { 
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.API_RATE_LIMIT || '100', 10)
    },
    ideas: { 
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: parseInt(process.env.IDEAS_RATE_LIMIT || '30', 10)
    },
    polls: { 
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: parseInt(process.env.POLLS_RATE_LIMIT || '30', 10)
    },
  },
  
  // Pagination
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
};

export function validateConfig(): void {
  const errors: string[] = [];
  
  if (!config.databaseUrl) {
    errors.push('DATABASE_URL is required');
  }
  
  if (config.guardrails.ownerMinPct < 35) {
    errors.push('OWNER_MIN_PCT cannot be below 35%');
  }
  
  if (config.guardrails.aliceCapPct > 25) {
    errors.push('ALICE_CAP_PCT cannot exceed 25%');
  }
  
  if (config.guardrails.contributionMinPct < 0.1) {
    errors.push('CONTRIBUTION_MIN_PCT cannot be below 0.1%');
  }
  
  if (config.guardrails.contributionMaxPct > 10) {
    errors.push('CONTRIBUTION_MAX_PCT cannot exceed 10%');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
}
