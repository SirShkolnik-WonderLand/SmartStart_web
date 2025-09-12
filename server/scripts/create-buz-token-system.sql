-- ============================================================================
-- BUZ TOKEN SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Business Utility Zone (BUZ) - Native platform token
-- Total Supply: 1,000,000,000 BUZ (1 Billion)
-- Initial Price: $0.01 USD
-- Market Cap Target: $100M

-- ============================================================================
-- ENUMS FOR BUZ SYSTEM
-- ============================================================================

-- BUZ Transaction Types
DO $$ BEGIN
    CREATE TYPE "BUZTransactionType" AS ENUM (
        'TRANSFER',           -- User to user transfer
        'MINT',              -- Platform minting new tokens
        'BURN',              -- Platform burning tokens
        'STAKE',             -- Staking tokens
        'UNSTAKE',           -- Unstaking tokens
        'REWARD',            -- Gamification rewards
        'FEE',               -- Platform fees
        'AIRDROP',           -- Airdrop distribution
        'REFUND',            -- Refund transactions
        'SLASH',             -- Penalty slashing
        'GOVERNANCE',        -- Governance voting rewards
        'VENTURE_INVESTMENT', -- Venture investment
        'REVENUE_SHARE',     -- Revenue sharing distribution
        'EQUITY_CONVERSION', -- BUZ to equity conversion
        'PARTNERSHIP_REWARD' -- External partnership rewards
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- BUZ Staking Tiers
DO $$ BEGIN
    CREATE TYPE "BUZStakingTier" AS ENUM (
        'BASIC',      -- 5% APY, 30-day lock
        'PREMIUM',    -- 10% APY, 90-day lock
        'VIP',        -- 15% APY, 180-day lock
        'GOVERNANCE'  -- 20% APY, 365-day lock
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- BUZ Staking Status
DO $$ BEGIN
    CREATE TYPE "BUZStakingStatus" AS ENUM (
        'ACTIVE',     -- Currently staked
        'MATURED',    -- Ready for unstaking
        'UNSTAKED',   -- Successfully unstaked
        'SLASHED',    -- Penalty applied
        'CANCELLED'   -- Cancelled before maturity
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- BUZ Transaction Status
DO $$ BEGIN
    CREATE TYPE "BUZTransactionStatus" AS ENUM (
        'PENDING',    -- Transaction pending
        'CONFIRMED',  -- Transaction confirmed
        'FAILED',     -- Transaction failed
        'CANCELLED'   -- Transaction cancelled
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- BUZ Governance Proposal Status
DO $$ BEGIN
    CREATE TYPE "BUZGovernanceStatus" AS ENUM (
        'DRAFT',      -- Proposal in draft
        'ACTIVE',     -- Voting active
        'PASSED',     -- Proposal passed
        'REJECTED',   -- Proposal rejected
        'EXECUTED',   -- Proposal executed
        'EXPIRED'     -- Proposal expired
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- BUZ TOKEN CORE TABLES
-- ============================================================================

-- BUZ Token Balances
CREATE TABLE IF NOT EXISTS "BUZToken" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(18,8) NOT NULL DEFAULT 0.00000000,
    "stakedBalance" DECIMAL(18,8) NOT NULL DEFAULT 0.00000000,
    "totalEarned" DECIMAL(18,8) NOT NULL DEFAULT 0.00000000,
    "totalSpent" DECIMAL(18,8) NOT NULL DEFAULT 0.00000000,
    "totalBurned" DECIMAL(18,8) NOT NULL DEFAULT 0.00000000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActivity" TIMESTAMP DEFAULT NOW(),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT "BUZToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- BUZ Transactions
CREATE TABLE IF NOT EXISTS "BUZTransaction" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "fromUserId" TEXT,
    "toUserId" TEXT,
    "amount" DECIMAL(18,8) NOT NULL,
    "type" "BUZTransactionType" NOT NULL,
    "reason" TEXT,
    "description" TEXT,
    "status" "BUZTransactionStatus" DEFAULT 'PENDING',
    "blockNumber" BIGINT,
    "transactionHash" TEXT,
    "gasUsed" BIGINT,
    "gasPrice" BIGINT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT "BUZTransaction_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE SET NULL,
    CONSTRAINT "BUZTransaction_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- BUZ Staking
CREATE TABLE IF NOT EXISTS "BUZStaking" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "tier" "BUZStakingTier" NOT NULL,
    "duration" INTEGER NOT NULL, -- days
    "apy" DECIMAL(5,2) NOT NULL,
    "expectedReward" DECIMAL(18,8) NOT NULL,
    "actualReward" DECIMAL(18,8) DEFAULT 0.00000000,
    "startDate" TIMESTAMP DEFAULT NOW(),
    "endDate" TIMESTAMP,
    "status" "BUZStakingStatus" DEFAULT 'ACTIVE',
    "isAutoRenew" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT "BUZStaking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- BUZ Rewards
CREATE TABLE IF NOT EXISTS "BUZReward" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "type" TEXT NOT NULL, -- DAILY_LOGIN, PROFILE_COMPLETE, TEAM_JOIN, VENTURE_CREATE, MILESTONE, etc.
    "reason" TEXT NOT NULL,
    "isClaimed" BOOLEAN DEFAULT false,
    "claimedAt" TIMESTAMP,
    "expiresAt" TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT "BUZReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- BUZ Governance Proposals
CREATE TABLE IF NOT EXISTS "BUZGovernanceProposal" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "proposerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proposalType" TEXT NOT NULL, -- TOKENOMICS, PLATFORM_FEATURE, FEE_CHANGE, etc.
    "status" "BUZGovernanceStatus" DEFAULT 'DRAFT',
    "votingStart" TIMESTAMP,
    "votingEnd" TIMESTAMP,
    "executionDate" TIMESTAMP,
    "yesVotes" BIGINT DEFAULT 0,
    "noVotes" BIGINT DEFAULT 0,
    "abstainVotes" BIGINT DEFAULT 0,
    "totalVotes" BIGINT DEFAULT 0,
    "quorumRequired" BIGINT NOT NULL,
    "minStakeRequired" DECIMAL(18,8) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT "BUZGovernanceProposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- BUZ Governance Votes
CREATE TABLE IF NOT EXISTS "BUZGovernanceVote" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "proposalId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "vote" TEXT NOT NULL, -- YES, NO, ABSTAIN
    "votingPower" DECIMAL(18,8) NOT NULL,
    "stakedAmount" DECIMAL(18,8) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT "BUZGovernanceVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "BUZGovernanceProposal"("id") ON DELETE CASCADE,
    CONSTRAINT "BUZGovernanceVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE CASCADE,
    
    -- Unique constraint - one vote per user per proposal
    CONSTRAINT "BUZGovernanceVote_unique_user_proposal" UNIQUE ("proposalId", "voterId")
);

-- BUZ Token Supply Management
CREATE TABLE IF NOT EXISTS "BUZTokenSupply" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "totalSupply" DECIMAL(18,8) NOT NULL DEFAULT 1000000000.00000000,
    "circulatingSupply" DECIMAL(18,8) NOT NULL DEFAULT 0.00000000,
    "burnedSupply" DECIMAL(18,8) NOT NULL DEFAULT 0.00000000,
    "stakedSupply" DECIMAL(18,8) NOT NULL DEFAULT 0.00000000,
    "reserveSupply" DECIMAL(18,8) NOT NULL DEFAULT 200000000.00000000,
    "teamSupply" DECIMAL(18,8) NOT NULL DEFAULT 150000000.00000000,
    "communitySupply" DECIMAL(18,8) NOT NULL DEFAULT 100000000.00000000,
    "liquiditySupply" DECIMAL(18,8) NOT NULL DEFAULT 100000000.00000000,
    "stakingRewardsSupply" DECIMAL(18,8) NOT NULL DEFAULT 200000000.00000000,
    "userRewardsSupply" DECIMAL(18,8) NOT NULL DEFAULT 150000000.00000000,
    "ventureFundSupply" DECIMAL(18,8) NOT NULL DEFAULT 100000000.00000000,
    "currentPrice" DECIMAL(10,8) NOT NULL DEFAULT 0.01000000,
    "marketCap" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "lastUpdated" TIMESTAMP DEFAULT NOW(),
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- BUZ Token indexes
CREATE INDEX IF NOT EXISTS "idx_buz_token_userId" ON "BUZToken"("userId");
CREATE INDEX IF NOT EXISTS "idx_buz_token_balance" ON "BUZToken"("balance");
CREATE INDEX IF NOT EXISTS "idx_buz_token_stakedBalance" ON "BUZToken"("stakedBalance");
CREATE INDEX IF NOT EXISTS "idx_buz_token_lastActivity" ON "BUZToken"("lastActivity");

-- BUZ Transaction indexes
CREATE INDEX IF NOT EXISTS "idx_buz_transaction_fromUserId" ON "BUZTransaction"("fromUserId");
CREATE INDEX IF NOT EXISTS "idx_buz_transaction_toUserId" ON "BUZTransaction"("toUserId");
CREATE INDEX IF NOT EXISTS "idx_buz_transaction_type" ON "BUZTransaction"("type");
CREATE INDEX IF NOT EXISTS "idx_buz_transaction_status" ON "BUZTransaction"("status");
CREATE INDEX IF NOT EXISTS "idx_buz_transaction_createdAt" ON "BUZTransaction"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_buz_transaction_hash" ON "BUZTransaction"("transactionHash");

-- BUZ Staking indexes
CREATE INDEX IF NOT EXISTS "idx_buz_staking_userId" ON "BUZStaking"("userId");
CREATE INDEX IF NOT EXISTS "idx_buz_staking_tier" ON "BUZStaking"("tier");
CREATE INDEX IF NOT EXISTS "idx_buz_staking_status" ON "BUZStaking"("status");
CREATE INDEX IF NOT EXISTS "idx_buz_staking_endDate" ON "BUZStaking"("endDate");

-- BUZ Reward indexes
CREATE INDEX IF NOT EXISTS "idx_buz_reward_userId" ON "BUZReward"("userId");
CREATE INDEX IF NOT EXISTS "idx_buz_reward_type" ON "BUZReward"("type");
CREATE INDEX IF NOT EXISTS "idx_buz_reward_isClaimed" ON "BUZReward"("isClaimed");
CREATE INDEX IF NOT EXISTS "idx_buz_reward_expiresAt" ON "BUZReward"("expiresAt");

-- BUZ Governance indexes
CREATE INDEX IF NOT EXISTS "idx_buz_governance_proposerId" ON "BUZGovernanceProposal"("proposerId");
CREATE INDEX IF NOT EXISTS "idx_buz_governance_status" ON "BUZGovernanceProposal"("status");
CREATE INDEX IF NOT EXISTS "idx_buz_governance_votingEnd" ON "BUZGovernanceProposal"("votingEnd");
CREATE INDEX IF NOT EXISTS "idx_buz_governance_vote_proposalId" ON "BUZGovernanceVote"("proposalId");
CREATE INDEX IF NOT EXISTS "idx_buz_governance_vote_voterId" ON "BUZGovernanceVote"("voterId");

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- BUZ Token Summary View
CREATE OR REPLACE VIEW "BUZTokenSummary" AS
SELECT 
    u.id as "userId",
    u.email,
    u.name,
    COALESCE(bt.balance, 0) as "balance",
    COALESCE(bt.stakedBalance, 0) as "stakedBalance",
    COALESCE(bt.totalEarned, 0) as "totalEarned",
    COALESCE(bt.totalSpent, 0) as "totalSpent",
    COALESCE(bt.totalBurned, 0) as "totalBurned",
    COALESCE(bt.lastActivity, u.createdAt) as "lastActivity"
FROM "User" u
LEFT JOIN "BUZToken" bt ON u.id = bt."userId"
WHERE bt."isActive" = true OR bt."isActive" IS NULL;

-- BUZ Transaction Summary View
CREATE OR REPLACE VIEW "BUZTransactionSummary" AS
SELECT 
    "type",
    COUNT(*) as "transactionCount",
    SUM("amount") as "totalAmount",
    AVG("amount") as "averageAmount",
    MIN("amount") as "minAmount",
    MAX("amount") as "maxAmount",
    COUNT(CASE WHEN "status" = 'CONFIRMED' THEN 1 END) as "confirmedCount",
    COUNT(CASE WHEN "status" = 'FAILED' THEN 1 END) as "failedCount"
FROM "BUZTransaction"
GROUP BY "type";

-- BUZ Staking Summary View
CREATE OR REPLACE VIEW "BUZStakingSummary" AS
SELECT 
    "tier",
    COUNT(*) as "stakingCount",
    SUM("amount") as "totalStaked",
    AVG("amount") as "averageStaked",
    AVG("apy") as "averageAPY",
    COUNT(CASE WHEN "status" = 'ACTIVE' THEN 1 END) as "activeCount",
    COUNT(CASE WHEN "status" = 'MATURED' THEN 1 END) as "maturedCount"
FROM "BUZStaking"
GROUP BY "tier";

-- ============================================================================
-- FUNCTIONS FOR BUZ OPERATIONS
-- ============================================================================

-- Function to get user BUZ balance
CREATE OR REPLACE FUNCTION get_buz_balance(user_id TEXT)
RETURNS DECIMAL(18,8) AS $$
DECLARE
    user_balance DECIMAL(18,8);
BEGIN
    SELECT COALESCE("balance", 0) INTO user_balance
    FROM "BUZToken"
    WHERE "userId" = user_id AND "isActive" = true;
    
    RETURN COALESCE(user_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get user staked BUZ balance
CREATE OR REPLACE FUNCTION get_buz_staked_balance(user_id TEXT)
RETURNS DECIMAL(18,8) AS $$
DECLARE
    staked_balance DECIMAL(18,8);
BEGIN
    SELECT COALESCE("stakedBalance", 0) INTO staked_balance
    FROM "BUZToken"
    WHERE "userId" = user_id AND "isActive" = true;
    
    RETURN COALESCE(staked_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate staking rewards
CREATE OR REPLACE FUNCTION calculate_staking_reward(
    staked_amount DECIMAL(18,8),
    apy DECIMAL(5,2),
    days_staked INTEGER
)
RETURNS DECIMAL(18,8) AS $$
BEGIN
    RETURN staked_amount * (apy / 100) * (days_staked / 365.0);
END;
$$ LANGUAGE plpgsql;

-- Function to get total BUZ supply
CREATE OR REPLACE FUNCTION get_total_buz_supply()
RETURNS DECIMAL(18,8) AS $$
DECLARE
    total_supply DECIMAL(18,8);
BEGIN
    SELECT "totalSupply" INTO total_supply
    FROM "BUZTokenSupply"
    ORDER BY "lastUpdated" DESC
    LIMIT 1;
    
    RETURN COALESCE(total_supply, 1000000000.00000000);
END;
$$ LANGUAGE plpgsql;

-- Function to get circulating BUZ supply
CREATE OR REPLACE FUNCTION get_circulating_buz_supply()
RETURNS DECIMAL(18,8) AS $$
DECLARE
    circulating_supply DECIMAL(18,8);
BEGIN
    SELECT "circulatingSupply" INTO circulating_supply
    FROM "BUZTokenSupply"
    ORDER BY "lastUpdated" DESC
    LIMIT 1;
    
    RETURN COALESCE(circulating_supply, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Trigger to update BUZToken updatedAt
CREATE OR REPLACE FUNCTION update_buz_token_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_buz_token_updated_at
    BEFORE UPDATE ON "BUZToken"
    FOR EACH ROW
    EXECUTE FUNCTION update_buz_token_updated_at();

-- Trigger to update BUZTransaction updatedAt
CREATE OR REPLACE FUNCTION update_buz_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_buz_transaction_updated_at
    BEFORE UPDATE ON "BUZTransaction"
    FOR EACH ROW
    EXECUTE FUNCTION update_buz_transaction_updated_at();

-- Trigger to update BUZStaking updatedAt
CREATE OR REPLACE FUNCTION update_buz_staking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_buz_staking_updated_at
    BEFORE UPDATE ON "BUZStaking"
    FOR EACH ROW
    EXECUTE FUNCTION update_buz_staking_updated_at();

-- ============================================================================
-- INITIAL DATA INSERTION
-- ============================================================================

-- Insert initial BUZ token supply data
INSERT INTO "BUZTokenSupply" (
    "totalSupply",
    "circulatingSupply",
    "burnedSupply",
    "stakedSupply",
    "reserveSupply",
    "teamSupply",
    "communitySupply",
    "liquiditySupply",
    "stakingRewardsSupply",
    "userRewardsSupply",
    "ventureFundSupply",
    "currentPrice",
    "marketCap"
) VALUES (
    1000000000.00000000,  -- Total Supply: 1B BUZ
    0.00000000,           -- Circulating Supply: 0 (not yet distributed)
    0.00000000,           -- Burned Supply: 0
    0.00000000,           -- Staked Supply: 0
    200000000.00000000,   -- Platform Reserve: 200M BUZ (20%)
    150000000.00000000,   -- Team & Advisors: 150M BUZ (15%)
    100000000.00000000,   -- Community Treasury: 100M BUZ (10%)
    100000000.00000000,   -- Liquidity Pool: 100M BUZ (10%)
    200000000.00000000,   -- Staking Rewards: 200M BUZ (20%)
    150000000.00000000,   -- User Rewards: 150M BUZ (15%)
    100000000.00000000,   -- Venture Fund: 100M BUZ (10%)
    0.01000000,           -- Current Price: $0.01 USD
    0.00                  -- Market Cap: $0 (no circulating supply yet)
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'BUZ Token System database schema created successfully!';
    RAISE NOTICE 'Total Supply: 1,000,000,000 BUZ';
    RAISE NOTICE 'Initial Price: $0.01 USD';
    RAISE NOTICE 'Target Market Cap: $100M';
    RAISE NOTICE 'Ready for API implementation!';
END $$;
