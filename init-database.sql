-- SmartStart Database Initialization Script

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT DEFAULT 'MEMBER',
    "level" TEXT DEFAULT 'OWLET',
    "status" TEXT DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "tenantId" TEXT DEFAULT 'default',
    "xp" INTEGER DEFAULT 0,
    "reputation" INTEGER DEFAULT 0,
    "lastActive" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "totalPortfolioValue" DECIMAL(15,2) DEFAULT 0.0,
    "activeProjectsCount" INTEGER DEFAULT 0,
    "totalContributions" INTEGER DEFAULT 0,
    "totalEquityOwned" DECIMAL(15,2) DEFAULT 0.0,
    "averageEquityPerProject" DECIMAL(15,2) DEFAULT 0.0,
    "portfolioDiversity" INTEGER DEFAULT 0
);

-- Create JourneyStage table
CREATE TABLE IF NOT EXISTS "JourneyStage" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default journey stages
INSERT INTO "JourneyStage" ("id", "name", "description", "order") VALUES
('account_creation', 'Account Creation', 'Initial account setup and verification', 1),
('profile_setup', 'Profile Setup', 'Complete user profile information', 2),
('first_venture', 'First Venture', 'Create or join your first venture', 3),
('team_formation', 'Team Formation', 'Build or join a team', 4),
('legal_setup', 'Legal Setup', 'Complete legal documentation', 5),
('launch_ready', 'Launch Ready', 'Ready to launch your venture', 6)
ON CONFLICT ("id") DO NOTHING;

-- Create UserJourneyState table
CREATE TABLE IF NOT EXISTS "UserJourneyState" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "stageId" TEXT NOT NULL REFERENCES "JourneyStage"("id") ON DELETE CASCADE,
    "status" TEXT DEFAULT 'PENDING',
    "startedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create BillingPlan table
CREATE TABLE IF NOT EXISTS "BillingPlan" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT DEFAULT 'USD',
    "interval" TEXT DEFAULT 'monthly',
    "features" JSONB,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default billing plans
INSERT INTO "BillingPlan" ("id", "name", "description", "price", "currency", "interval", "features") VALUES
('free_tier', 'Free Tier', 'Basic features for getting started', 0.00, 'USD', 'monthly', '{"maxVentures": 1, "maxTeamMembers": 3, "storage": "1GB"}'),
('founder', 'Founder Plan', 'Limited time founder special - $100/month', 100.00, 'USD', 'monthly', '{"maxVentures": -1, "maxTeamMembers": -1, "storage": "unlimited", "buzTokens": 100, "email": "@alicesolutionsgroup.com", "microsoft365": true}'),
('professional', 'Professional', 'Full professional features', 299.00, 'USD', 'monthly', '{"maxVentures": 10, "maxTeamMembers": 50, "storage": "100GB", "buzTokens": 50}'),
('enterprise', 'Enterprise', 'Enterprise-grade features', 999.00, 'USD', 'monthly', '{"maxVentures": -1, "maxTeamMembers": -1, "storage": "unlimited", "buzTokens": 500, "prioritySupport": true}')
ON CONFLICT ("id") DO NOTHING;

-- Create Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "planId" TEXT NOT NULL REFERENCES "BillingPlan"("id") ON DELETE CASCADE,
    "status" TEXT DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "endDate" TIMESTAMP WITH TIME ZONE,
    "autoRenew" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_role" ON "User"("role");
CREATE INDEX IF NOT EXISTS "idx_user_journey_user_id" ON "UserJourneyState"("userId");
CREATE INDEX IF NOT EXISTS "idx_user_journey_stage_id" ON "UserJourneyState"("stageId");
CREATE INDEX IF NOT EXISTS "idx_subscription_user_id" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "idx_subscription_plan_id" ON "Subscription"("planId");

-- Create a function to generate UUIDs
CREATE OR REPLACE FUNCTION generate_uuid() RETURNS TEXT AS $$
BEGIN
    RETURN 'uuid_' || extract(epoch from now())::text || '_' || random()::text;
END;
$$ LANGUAGE plpgsql;
