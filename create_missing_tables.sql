-- Create missing tables for full SmartStart functionality
-- This script adds tables that are referenced by the frontend but don't exist yet

-- BUZ Token System
CREATE TABLE IF NOT EXISTS "BUZToken" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "balance" DECIMAL(15,2) DEFAULT 0.00,
    "stakedAmount" DECIMAL(15,2) DEFAULT 0.00,
    "totalEarned" DECIMAL(15,2) DEFAULT 0.00,
    "totalSpent" DECIMAL(15,2) DEFAULT 0.00,
    "lastTransactionAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- BUZ Transaction History
CREATE TABLE IF NOT EXISTS "BUZTransaction" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL, -- 'EARN', 'SPEND', 'STAKE', 'UNSTAKE', 'TRANSFER'
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Venture Management System
CREATE TABLE IF NOT EXISTS "Venture" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'
    "category" VARCHAR(100),
    "industry" VARCHAR(100),
    "stage" VARCHAR(50) DEFAULT 'IDEA', -- 'IDEA', 'MVP', 'GROWTH', 'SCALE', 'EXIT'
    "fundingGoal" DECIMAL(15,2),
    "currentFunding" DECIMAL(15,2) DEFAULT 0.00,
    "equityOffered" DECIMAL(5,2), -- Percentage
    "minInvestment" DECIMAL(15,2),
    "maxInvestment" DECIMAL(15,2),
    "startDate" DATE,
    "endDate" DATE,
    "createdBy" VARCHAR(255) NOT NULL,
    "teamMembers" JSONB, -- Array of user IDs and roles
    "tags" JSONB, -- Array of tags
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Venture Investment
CREATE TABLE IF NOT EXISTS "VentureInvestment" (
    "id" VARCHAR(255) PRIMARY KEY,
    "ventureId" VARCHAR(255) NOT NULL,
    "investorId" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "equityPercentage" DECIMAL(5,2) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'
    "investmentDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("ventureId") REFERENCES "Venture"("id") ON DELETE CASCADE,
    FOREIGN KEY ("investorId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Legal Document System
CREATE TABLE IF NOT EXISTS "LegalDocument" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL, -- 'CONTRACT', 'AGREEMENT', 'TERMS', 'POLICY', 'DISCLOSURE'
    "category" VARCHAR(100), -- 'INVESTMENT', 'PARTNERSHIP', 'EMPLOYMENT', 'PRIVACY', 'TERMS'
    "status" VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'REVIEW', 'APPROVED', 'SIGNED', 'EXPIRED'
    "content" TEXT,
    "version" VARCHAR(20) DEFAULT '1.0',
    "requiresSignature" BOOLEAN DEFAULT false,
    "signatureRequiredBy" TIMESTAMP WITH TIME ZONE,
    "createdBy" VARCHAR(255) NOT NULL,
    "assignedTo" VARCHAR(255), -- User who needs to review/sign
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Legal Document Signature
CREATE TABLE IF NOT EXISTS "LegalDocumentSignature" (
    "id" VARCHAR(255) PRIMARY KEY,
    "documentId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "signatureData" TEXT, -- Base64 encoded signature
    "signedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Team Management System
CREATE TABLE IF NOT EXISTS "Team" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) DEFAULT 'PROJECT', -- 'PROJECT', 'DEPARTMENT', 'VENTURE', 'COMMITTEE'
    "status" VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'ARCHIVED'
    "leaderId" VARCHAR(255) NOT NULL,
    "members" JSONB, -- Array of user IDs and roles
    "goals" JSONB, -- Array of team goals
    "budget" DECIMAL(15,2),
    "startDate" DATE,
    "endDate" DATE,
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Team Member
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" VARCHAR(255) PRIMARY KEY,
    "teamId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "permissions" JSONB, -- Array of specific permissions for this team
    "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP WITH TIME ZONE,
    "status" VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'SUSPENDED'
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Umbrella System (Revenue Sharing)
CREATE TABLE IF NOT EXISTS "Umbrella" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) DEFAULT 'REVENUE_SHARING', -- 'REVENUE_SHARING', 'INVESTMENT_POOL', 'COOPERATIVE'
    "status" VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'CLOSED'
    "totalValue" DECIMAL(15,2) DEFAULT 0.00,
    "memberCount" INTEGER DEFAULT 0,
    "revenueSharePercentage" DECIMAL(5,2) DEFAULT 0.00,
    "minContribution" DECIMAL(15,2),
    "maxContribution" DECIMAL(15,2),
    "createdBy" VARCHAR(255) NOT NULL,
    "members" JSONB, -- Array of user IDs and their contributions
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Umbrella Member
CREATE TABLE IF NOT EXISTS "UmbrellaMember" (
    "id" VARCHAR(255) PRIMARY KEY,
    "umbrellaId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "contributionAmount" DECIMAL(15,2) NOT NULL,
    "sharePercentage" DECIMAL(5,2) NOT NULL,
    "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP WITH TIME ZONE,
    "status" VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'SUSPENDED'
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("umbrellaId") REFERENCES "Umbrella"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Notification System
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL, -- 'INFO', 'WARNING', 'ERROR', 'SUCCESS', 'INVESTMENT', 'VENTURE', 'LEGAL'
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    "actionUrl" VARCHAR(500),
    "metadata" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_buztoken_userid" ON "BUZToken"("userId");
CREATE INDEX IF NOT EXISTS "idx_buztransaction_userid" ON "BUZTransaction"("userId");
CREATE INDEX IF NOT EXISTS "idx_venture_createdby" ON "Venture"("createdBy");
CREATE INDEX IF NOT EXISTS "idx_venture_status" ON "Venture"("status");
CREATE INDEX IF NOT EXISTS "idx_ventureinvestment_ventureid" ON "VentureInvestment"("ventureId");
CREATE INDEX IF NOT EXISTS "idx_ventureinvestment_investorid" ON "VentureInvestment"("investorId");
CREATE INDEX IF NOT EXISTS "idx_legaldocument_createdby" ON "LegalDocument"("createdBy");
CREATE INDEX IF NOT EXISTS "idx_legaldocument_assignedto" ON "LegalDocument"("assignedTo");
CREATE INDEX IF NOT EXISTS "idx_legaldocumentsignature_documentid" ON "LegalDocumentSignature"("documentId");
CREATE INDEX IF NOT EXISTS "idx_legaldocumentsignature_userid" ON "LegalDocumentSignature"("userId");
CREATE INDEX IF NOT EXISTS "idx_team_leaderid" ON "Team"("leaderId");
CREATE INDEX IF NOT EXISTS "idx_teammember_teamid" ON "TeamMember"("teamId");
CREATE INDEX IF NOT EXISTS "idx_teammember_userid" ON "TeamMember"("userId");
CREATE INDEX IF NOT EXISTS "idx_umbrella_createdby" ON "Umbrella"("createdBy");
CREATE INDEX IF NOT EXISTS "idx_umbrellamember_umbrellaid" ON "UmbrellaMember"("umbrellaId");
CREATE INDEX IF NOT EXISTS "idx_umbrellamember_userid" ON "UmbrellaMember"("userId");
CREATE INDEX IF NOT EXISTS "idx_notification_userid" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "idx_notification_isread" ON "Notification"("isRead");

-- Insert some sample data for testing
INSERT INTO "BUZToken" ("id", "userId", "balance", "stakedAmount", "totalEarned", "totalSpent") 
VALUES 
    ('buz_super_admin_001', 'super_admin_001', 10000.00, 5000.00, 15000.00, 5000.00),
    ('buz_admin_001', 'admin_001', 5000.00, 2000.00, 7000.00, 2000.00),
    ('buz_manager_001', 'manager_001', 2500.00, 1000.00, 3500.00, 1000.00),
    ('buz_member_001', 'member_001', 1000.00, 500.00, 1500.00, 500.00)
ON CONFLICT ("id") DO NOTHING;

-- Insert sample ventures
INSERT INTO "Venture" ("id", "name", "description", "status", "category", "industry", "stage", "fundingGoal", "currentFunding", "equityOffered", "minInvestment", "maxInvestment", "createdBy") 
VALUES 
    ('venture_001', 'AI-Powered Analytics Platform', 'Revolutionary AI platform for business analytics', 'ACTIVE', 'TECHNOLOGY', 'SOFTWARE', 'MVP', 1000000.00, 250000.00, 20.00, 10000.00, 100000.00, 'super_admin_001'),
    ('venture_002', 'Sustainable Energy Solutions', 'Clean energy technology for residential use', 'DRAFT', 'SUSTAINABILITY', 'ENERGY', 'IDEA', 500000.00, 0.00, 15.00, 5000.00, 50000.00, 'admin_001'),
    ('venture_003', 'E-commerce Marketplace', 'Next-generation online marketplace', 'ACTIVE', 'COMMERCE', 'RETAIL', 'GROWTH', 2000000.00, 750000.00, 25.00, 15000.00, 200000.00, 'manager_001')
ON CONFLICT ("id") DO NOTHING;

-- Insert sample legal documents
INSERT INTO "LegalDocument" ("id", "name", "type", "category", "status", "content", "version", "requiresSignature", "createdBy", "assignedTo") 
VALUES 
    ('legal_001', 'Investment Agreement Template', 'CONTRACT', 'INVESTMENT', 'APPROVED', 'Standard investment agreement template...', '1.0', true, 'super_admin_001', 'member_001'),
    ('legal_002', 'Privacy Policy', 'POLICY', 'PRIVACY', 'APPROVED', 'Our privacy policy...', '2.1', false, 'admin_001', null),
    ('legal_003', 'Terms of Service', 'TERMS', 'TERMS', 'DRAFT', 'Terms of service document...', '1.0', true, 'manager_001', 'member_001')
ON CONFLICT ("id") DO NOTHING;

-- Insert sample teams
INSERT INTO "Team" ("id", "name", "description", "type", "status", "leaderId", "budget") 
VALUES 
    ('team_001', 'Development Team', 'Core development team for all projects', 'DEPARTMENT', 'ACTIVE', 'super_admin_001', 500000.00),
    ('team_002', 'Marketing Team', 'Marketing and growth team', 'DEPARTMENT', 'ACTIVE', 'admin_001', 200000.00),
    ('team_003', 'AI Venture Team', 'Team working on AI analytics platform', 'VENTURE', 'ACTIVE', 'manager_001', 300000.00)
ON CONFLICT ("id") DO NOTHING;

-- Insert sample umbrella
INSERT INTO "Umbrella" ("id", "name", "description", "type", "status", "totalValue", "memberCount", "revenueSharePercentage", "createdBy") 
VALUES 
    ('umbrella_001', 'SmartStart Revenue Pool', 'Main revenue sharing pool for all members', 'REVENUE_SHARING', 'ACTIVE', 1000000.00, 4, 10.00, 'super_admin_001')
ON CONFLICT ("id") DO NOTHING;

-- Insert sample notifications
INSERT INTO "Notification" ("id", "userId", "type", "title", "message", "isRead", "actionUrl") 
VALUES 
    ('notif_001', 'super_admin_001', 'INFO', 'Welcome to SmartStart!', 'Your account has been successfully created.', true, '/dashboard'),
    ('notif_002', 'admin_001', 'INVESTMENT', 'New Investment Opportunity', 'A new venture is available for investment.', false, '/ventures'),
    ('notif_003', 'member_001', 'LEGAL', 'Document Signature Required', 'Please review and sign the investment agreement.', false, '/legal')
ON CONFLICT ("id") DO NOTHING;

-- Update the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_buztoken_updated_at ON "BUZToken";
CREATE TRIGGER update_buztoken_updated_at BEFORE UPDATE ON "BUZToken" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_venture_updated_at ON "Venture";
CREATE TRIGGER update_venture_updated_at BEFORE UPDATE ON "Venture" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ventureinvestment_updated_at ON "VentureInvestment";
CREATE TRIGGER update_ventureinvestment_updated_at BEFORE UPDATE ON "VentureInvestment" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_legaldocument_updated_at ON "LegalDocument";
CREATE TRIGGER update_legaldocument_updated_at BEFORE UPDATE ON "LegalDocument" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_updated_at ON "Team";
CREATE TRIGGER update_team_updated_at BEFORE UPDATE ON "Team" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teammember_updated_at ON "TeamMember";
CREATE TRIGGER update_teammember_updated_at BEFORE UPDATE ON "TeamMember" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_umbrella_updated_at ON "Umbrella";
CREATE TRIGGER update_umbrella_updated_at BEFORE UPDATE ON "Umbrella" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_umbrellamember_updated_at ON "UmbrellaMember";
CREATE TRIGGER update_umbrellamember_updated_at BEFORE UPDATE ON "UmbrellaMember" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT 'Tables created successfully' as status;
