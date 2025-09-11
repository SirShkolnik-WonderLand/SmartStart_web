-- Enhanced Legal Protections Database Schema
-- Critical missing protections for worldwide IP security

-- 1. Enhanced Legal Document Types
ALTER TYPE "LegalDocumentType" ADD VALUE IF NOT EXISTS 'WORK_FOR_HIRE_AGREEMENT';
ALTER TYPE "LegalDocumentType" ADD VALUE IF NOT EXISTS 'WORLDWIDE_NON_COMPETE';
ALTER TYPE "LegalDocumentType" ADD VALUE IF NOT EXISTS 'ANTI_IP_THEFT_AGREEMENT';
ALTER TYPE "LegalDocumentType" ADD VALUE IF NOT EXISTS 'PLATFORM_LOCK_IN_AGREEMENT';
ALTER TYPE "LegalDocumentType" ADD VALUE IF NOT EXISTS 'REVENUE_SHARING_ENFORCEMENT';
ALTER TYPE "LegalDocumentType" ADD VALUE IF NOT EXISTS 'DIGITAL_EVIDENCE_AGREEMENT';
ALTER TYPE "LegalDocumentType" ADD VALUE IF NOT EXISTS 'INTERNATIONAL_ENFORCEMENT';
ALTER TYPE "LegalDocumentType" ADD VALUE IF NOT EXISTS 'ASSET_SEIZURE_AGREEMENT';
ALTER TYPE "LegalDocumentType" ADD VALUE IF NOT EXISTS 'LIQUIDATED_DAMAGES_CLAUSE';

-- 2. Legal Document Status Types
ALTER TYPE "LegalDocumentStatus" ADD VALUE IF NOT EXISTS 'PENDING_SIGNATURE';
ALTER TYPE "LegalDocumentStatus" ADD VALUE IF NOT EXISTS 'SIGNATURE_DEADLINE_PASSED';
ALTER TYPE "LegalDocumentStatus" ADD VALUE IF NOT EXISTS 'ENFORCEMENT_ACTIVE';
ALTER TYPE "LegalDocumentStatus" ADD VALUE IF NOT EXISTS 'VIOLATION_DETECTED';
ALTER TYPE "LegalDocumentStatus" ADD VALUE IF NOT EXISTS 'LEGAL_ACTION_PENDING';

-- 3. Create Enhanced Legal Document Templates Table
CREATE TABLE IF NOT EXISTS "LegalDocumentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LegalDocumentType" NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "content" TEXT NOT NULL,
    "rbacLevel" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "jurisdiction" TEXT NOT NULL DEFAULT 'WORLDWIDE',
    "enforcementMechanisms" TEXT[] NOT NULL DEFAULT '{}',
    "liquidatedDamages" DECIMAL(12,2),
    "survivalPeriod" INTEGER, -- in years
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LegalDocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- 4. Create Legal Document Versions Table
CREATE TABLE IF NOT EXISTS "LegalDocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "changeLog" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LegalDocumentVersion_pkey" PRIMARY KEY ("id")
);

-- 5. Create Legal Document Compliance Table
CREATE TABLE IF NOT EXISTS "LegalDocumentCompliance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "rbacLevel" TEXT NOT NULL,
    "complianceStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "requiredBy" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "violations" TEXT[] DEFAULT '{}',
    "enforcementActions" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LegalDocumentCompliance_pkey" PRIMARY KEY ("id")
);

-- 6. Create IP Theft Detection Table
CREATE TABLE IF NOT EXISTS "IPTheftDetection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ventureId" TEXT,
    "projectId" TEXT,
    "detectionType" TEXT NOT NULL, -- 'REVERSE_ENGINEERING', 'COMPETITIVE_USE', 'UNAUTHORIZED_EXPORT'
    "evidence" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    "status" TEXT NOT NULL DEFAULT 'DETECTED', -- 'DETECTED', 'INVESTIGATING', 'CONFIRMED', 'RESOLVED'
    "damages" DECIMAL(12,2),
    "enforcementActions" TEXT[] DEFAULT '{}',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "IPTheftDetection_pkey" PRIMARY KEY ("id")
);

-- 7. Create Revenue Sharing Violations Table
CREATE TABLE IF NOT EXISTS "RevenueSharingViolation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ventureId" TEXT NOT NULL,
    "projectId" TEXT,
    "violationType" TEXT NOT NULL, -- 'CIRCUMVENTION', 'SIDE_DEAL', 'UNAUTHORIZED_PAYMENT'
    "amount" DECIMAL(12,2) NOT NULL,
    "liquidatedDamages" DECIMAL(12,2) NOT NULL,
    "evidence" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DETECTED',
    "enforcementActions" TEXT[] DEFAULT '{}',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "RevenueSharingViolation_pkey" PRIMARY KEY ("id")
);

-- 8. Create Digital Evidence Table
CREATE TABLE IF NOT EXISTS "DigitalEvidence" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL, -- 'SCREENSHOT', 'LOG_FILE', 'BLOCKCHAIN', 'DIGITAL_SIGNATURE'
    "evidenceData" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "blockchainTx" TEXT,
    "isAdmissible" BOOLEAN NOT NULL DEFAULT true,
    "chainOfCustody" TEXT[] NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DigitalEvidence_pkey" PRIMARY KEY ("id")
);

-- 9. Create Enforcement Actions Table
CREATE TABLE IF NOT EXISTS "EnforcementAction" (
    "id" TEXT NOT NULL,
    "violationId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL, -- 'SUSPENSION', 'TERMINATION', 'LEGAL_ACTION', 'ASSET_SEIZURE'
    "jurisdiction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "executedAt" TIMESTAMP(3),
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnforcementAction_pkey" PRIMARY KEY ("id")
);

-- 10. Create Asset Seizure Table
CREATE TABLE IF NOT EXISTS "AssetSeizure" (
    "id" TEXT NOT NULL,
    "violationId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL, -- 'BANK_ACCOUNT', 'INTELLECTUAL_PROPERTY', 'BUSINESS_ASSETS'
    "assetValue" DECIMAL(12,2),
    "seizureOrder" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "seizedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssetSeizure_pkey" PRIMARY KEY ("id")
);

-- 11. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS "LegalDocumentTemplate_type_idx" ON "LegalDocumentTemplate"("type");
CREATE INDEX IF NOT EXISTS "LegalDocumentTemplate_rbacLevel_idx" ON "LegalDocumentTemplate"("rbacLevel");
CREATE INDEX IF NOT EXISTS "LegalDocumentTemplate_isActive_idx" ON "LegalDocumentTemplate"("isActive");

CREATE INDEX IF NOT EXISTS "LegalDocumentVersion_documentId_idx" ON "LegalDocumentVersion"("documentId");
CREATE INDEX IF NOT EXISTS "LegalDocumentVersion_isActive_idx" ON "LegalDocumentVersion"("isActive");

CREATE INDEX IF NOT EXISTS "LegalDocumentCompliance_userId_idx" ON "LegalDocumentCompliance"("userId");
CREATE INDEX IF NOT EXISTS "LegalDocumentCompliance_rbacLevel_idx" ON "LegalDocumentCompliance"("rbacLevel");
CREATE INDEX IF NOT EXISTS "LegalDocumentCompliance_status_idx" ON "LegalDocumentCompliance"("complianceStatus");

CREATE INDEX IF NOT EXISTS "IPTheftDetection_userId_idx" ON "IPTheftDetection"("userId");
CREATE INDEX IF NOT EXISTS "IPTheftDetection_severity_idx" ON "IPTheftDetection"("severity");
CREATE INDEX IF NOT EXISTS "IPTheftDetection_status_idx" ON "IPTheftDetection"("status");

CREATE INDEX IF NOT EXISTS "RevenueSharingViolation_userId_idx" ON "RevenueSharingViolation"("userId");
CREATE INDEX IF NOT EXISTS "RevenueSharingViolation_ventureId_idx" ON "RevenueSharingViolation"("ventureId");
CREATE INDEX IF NOT EXISTS "RevenueSharingViolation_status_idx" ON "RevenueSharingViolation"("status");

CREATE INDEX IF NOT EXISTS "DigitalEvidence_caseId_idx" ON "DigitalEvidence"("caseId");
CREATE INDEX IF NOT EXISTS "DigitalEvidence_hash_idx" ON "DigitalEvidence"("hash");

CREATE INDEX IF NOT EXISTS "EnforcementAction_violationId_idx" ON "EnforcementAction"("violationId");
CREATE INDEX IF NOT EXISTS "EnforcementAction_status_idx" ON "EnforcementAction"("status");

CREATE INDEX IF NOT EXISTS "AssetSeizure_violationId_idx" ON "AssetSeizure"("violationId");
CREATE INDEX IF NOT EXISTS "AssetSeizure_status_idx" ON "AssetSeizure"("status");

-- 12. Add Foreign Key Constraints
ALTER TABLE "LegalDocumentVersion" ADD CONSTRAINT "LegalDocumentVersion_documentId_fkey" 
    FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "LegalDocumentCompliance" ADD CONSTRAINT "LegalDocumentCompliance_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "LegalDocumentCompliance" ADD CONSTRAINT "LegalDocumentCompliance_documentId_fkey" 
    FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "IPTheftDetection" ADD CONSTRAINT "IPTheftDetection_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "IPTheftDetection" ADD CONSTRAINT "IPTheftDetection_ventureId_fkey" 
    FOREIGN KEY ("ventureId") REFERENCES "Venture"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE "IPTheftDetection" ADD CONSTRAINT "IPTheftDetection_projectId_fkey" 
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE "RevenueSharingViolation" ADD CONSTRAINT "RevenueSharingViolation_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "RevenueSharingViolation" ADD CONSTRAINT "RevenueSharingViolation_ventureId_fkey" 
    FOREIGN KEY ("ventureId") REFERENCES "Venture"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "RevenueSharingViolation" ADD CONSTRAINT "RevenueSharingViolation_projectId_fkey" 
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON UPDATE CASCADE ON DELETE SET NULL;

-- 13. Insert Critical Legal Document Templates
INSERT INTO "LegalDocumentTemplate" (
    "id", "name", "type", "version", "content", "rbacLevel", "isRequired", 
    "jurisdiction", "enforcementMechanisms", "liquidatedDamages", "survivalPeriod", "createdBy", "updatedAt"
) VALUES 
(
    'work-for-hire-template-v1',
    'Work-for-Hire Agreement',
    'WORK_FOR_HIRE_AGREEMENT',
    '1.0',
    'WORK-FOR-HIRE ASSIGNMENT CLAUSE

All work product created by Contributors on the SmartStart Platform, regardless of payment status, acceptance, or completion, is automatically deemed "work made for hire" under applicable copyright law and is immediately and irrevocably assigned to the Project Owner and AliceSolutions Ventures Inc.

This assignment occurs:
- Upon creation of any work product
- Without requirement for payment or acceptance  
- Irrevocably and permanently
- Worldwide and in all jurisdictions
- Including all moral rights and related rights

Contributors waive all moral rights and agree not to enforce them against Project Owners or AliceSolutions Ventures Inc.',
    'MEMBER',
    true,
    'WORLDWIDE',
    ARRAY['IMMEDIATE_ASSIGNMENT', 'AUTOMATIC_TRANSFER', 'MORAL_RIGHTS_WAIVER'],
    100000.00,
    5,
    'system',
    CURRENT_TIMESTAMP
),
(
    'worldwide-non-compete-template-v1',
    'Worldwide Non-Compete Agreement',
    'WORLDWIDE_NON_COMPETE',
    '1.0',
    'WORLDWIDE NON-COMPETE AGREEMENT

For five (5) years after any platform participation, Contributors agree:

1. NO COMPETING PLATFORMS
- No participation in competing venture collaboration platforms
- No creation of competing platforms or services
- No employment with competing platforms
- No consulting for competing platforms

2. NO COMPETITIVE PROJECTS  
- No work on projects that compete with platform ventures
- No use of platform knowledge for external projects
- No solicitation of platform users for external work
- No circumvention of platform revenue sharing

3. GEOGRAPHIC SCOPE
- Worldwide enforcement
- All jurisdictions where Contributor operates
- All jurisdictions where work product is used
- All jurisdictions where competition occurs

4. ENFORCEMENT RIGHTS
- AliceSolutions may enforce worldwide
- Injunctive relief in any jurisdiction
- Asset seizure for violations
- Liquidated damages of $50,000 per violation',
    'MEMBER',
    true,
    'WORLDWIDE',
    ARRAY['INJUNCTIVE_RELIEF', 'ASSET_SEIZURE', 'LIQUIDATED_DAMAGES'],
    50000.00,
    5,
    'system',
    CURRENT_TIMESTAMP
),
(
    'anti-ip-theft-template-v1',
    'Anti-IP-Theft Agreement',
    'ANTI_IP_THEFT_AGREEMENT',
    '1.0',
    'ANTI-IP-THEFT PROTECTION AGREEMENT

Contributors expressly agree:

1. NO REVERSE ENGINEERING
- No reverse engineering of any platform technology
- No decompilation or disassembly of platform code
- No creation of competing products based on platform knowledge
- No use of platform knowledge for external projects

2. NO COMPETITIVE USE
- No use of platform knowledge to compete with AliceSolutions
- No use of platform knowledge to compete with Project Owners
- No solicitation of platform users for external projects
- No circumvention of platform revenue sharing

3. IP THEFT DETECTION
- AliceSolutions may monitor for IP theft using automated tools
- Contributors consent to monitoring and detection systems
- Evidence of IP theft may be used in legal proceedings
- Contributors waive privacy rights regarding IP theft detection

4. DAMAGES FOR IP THEFT
- Liquidated damages of $100,000 per incident of IP theft
- Additional damages for lost revenue and competitive harm
- Attorney fees and costs for enforcement
- Injunctive relief and asset seizure rights',
    'MEMBER',
    true,
    'WORLDWIDE',
    ARRAY['MONITORING', 'LIQUIDATED_DAMAGES', 'ASSET_SEIZURE', 'INJUNCTIVE_RELIEF'],
    100000.00,
    5,
    'system',
    CURRENT_TIMESTAMP
),
(
    'platform-lock-in-template-v1',
    'Platform Lock-In Agreement',
    'PLATFORM_LOCK_IN_AGREEMENT',
    '1.0',
    'PLATFORM LOCK-IN REQUIREMENTS

Contributors agree that all work must remain on the platform:

1. NO EXTERNAL WORK
- No work on external platforms or systems
- No work in personal repositories
- No work in external collaboration tools
- No work outside Designated Systems

2. PLATFORM-ONLY COLLABORATION
- All collaboration must occur on platform
- All communication must occur on platform
- All file sharing must occur on platform
- All project management must occur on platform

3. EXPORT RESTRICTIONS
- No export of work product without permission
- No copy of work product to external systems
- No backup of work product outside platform
- No sharing of work product with external parties

4. VIOLATION CONSEQUENCES
- Immediate termination for violations
- IP theft damages for violations
- Injunctive relief for violations
- Asset seizure for violations',
    'MEMBER',
    true,
    'WORLDWIDE',
    ARRAY['IMMEDIATE_TERMINATION', 'IP_THEFT_DAMAGES', 'INJUNCTIVE_RELIEF', 'ASSET_SEIZURE'],
    50000.00,
    5,
    'system',
    CURRENT_TIMESTAMP
),
(
    'revenue-sharing-enforcement-template-v1',
    'Revenue Sharing Enforcement Agreement',
    'REVENUE_SHARING_ENFORCEMENT',
    '1.0',
    'REVENUE SHARING ENFORCEMENT AGREEMENT

Contributors agree to platform revenue sharing:

1. MANDATORY REVENUE SHARING
- All work must include platform revenue sharing
- No circumvention of revenue sharing
- No direct payment outside platform
- No side deals or off-platform payments

2. REVENUE TRACKING
- Platform tracks all revenue and payments
- Contributors must report all revenue
- Platform monitors for revenue sharing violations
- Automated detection of revenue sharing bypass

3. ENFORCEMENT ACTIONS
- Immediate suspension for violations
- Legal action for revenue sharing theft
- Asset seizure for unpaid revenue sharing
- Liquidated damages of 3x unpaid revenue sharing

4. COMPLIANCE MONITORING
- Automated monitoring of all transactions
- Detection of circumvention attempts
- Real-time violation alerts
- Immediate enforcement actions',
    'MEMBER',
    true,
    'WORLDWIDE',
    ARRAY['AUTOMATED_MONITORING', 'IMMEDIATE_SUSPENSION', 'ASSET_SEIZURE', 'LIQUIDATED_DAMAGES'],
    0.00,
    5,
    'system',
    CURRENT_TIMESTAMP
);

-- 14. Create Views for Easy Querying
CREATE OR REPLACE VIEW "ActiveLegalTemplates" AS
SELECT * FROM "LegalDocumentTemplate" 
WHERE "isActive" = true 
ORDER BY "type", "version" DESC;

CREATE OR REPLACE VIEW "UserComplianceStatus" AS
SELECT 
    u.id as "userId",
    u.name as "userName",
    ldc."rbacLevel",
    ldc."complianceStatus",
    COUNT(ldc.id) as "totalRequirements",
    COUNT(CASE WHEN ldc."complianceStatus" = 'COMPLETED' THEN 1 END) as "completedRequirements",
    COUNT(CASE WHEN ldc."complianceStatus" = 'VIOLATION' THEN 1 END) as "violations"
FROM "User" u
LEFT JOIN "LegalDocumentCompliance" ldc ON u.id = ldc."userId"
GROUP BY u.id, u.name, ldc."rbacLevel", ldc."complianceStatus";

CREATE OR REPLACE VIEW "IPTheftSummary" AS
SELECT 
    "userId",
    COUNT(*) as "totalDetections",
    COUNT(CASE WHEN "severity" = 'CRITICAL' THEN 1 END) as "criticalDetections",
    COUNT(CASE WHEN "status" = 'CONFIRMED' THEN 1 END) as "confirmedThefts",
    SUM("damages") as "totalDamages"
FROM "IPTheftDetection"
GROUP BY "userId";

-- 15. Create Functions for Legal Operations
CREATE OR REPLACE FUNCTION "check_user_legal_compliance"(user_id TEXT, rbac_level TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    required_docs INTEGER;
    completed_docs INTEGER;
BEGIN
    -- Count required documents for RBAC level
    SELECT COUNT(*) INTO required_docs
    FROM "LegalDocumentTemplate" 
    WHERE "rbacLevel" = rbac_level AND "isRequired" = true AND "isActive" = true;
    
    -- Count completed documents for user
    SELECT COUNT(*) INTO completed_docs
    FROM "LegalDocumentCompliance" ldc
    JOIN "LegalDocumentTemplate" ldt ON ldc."documentId" = ldt."id"
    WHERE ldc."userId" = user_id 
    AND ldc."complianceStatus" = 'COMPLETED'
    AND ldt."rbacLevel" = rbac_level
    AND ldt."isRequired" = true
    AND ldt."isActive" = true;
    
    RETURN completed_docs >= required_docs;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "detect_ip_theft"(user_id TEXT, evidence_data TEXT, detection_type TEXT)
RETURNS TEXT AS $$
DECLARE
    theft_id TEXT;
BEGIN
    -- Generate new theft detection record
    theft_id := 'theft_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 8);
    
    INSERT INTO "IPTheftDetection" (
        "id", "userId", "detectionType", "evidence", "severity", "status"
    ) VALUES (
        theft_id, user_id, detection_type, evidence_data, 'HIGH', 'DETECTED'
    );
    
    RETURN theft_id;
END;
$$ LANGUAGE plpgsql;

-- 16. Create Triggers for Automatic Compliance Checking
CREATE OR REPLACE FUNCTION "update_user_compliance_status"()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user compliance status when document compliance changes
    UPDATE "User" 
    SET "legalComplianceStatus" = CASE 
        WHEN "check_user_legal_compliance"(NEW."userId", NEW."rbacLevel") THEN 'COMPLIANT'
        ELSE 'NON_COMPLIANT'
    END
    WHERE "id" = NEW."userId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trigger_update_user_compliance"
    AFTER INSERT OR UPDATE ON "LegalDocumentCompliance"
    FOR EACH ROW
    EXECUTE FUNCTION "update_user_compliance_status"();

-- 17. Grant Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON "LegalDocumentTemplate" TO smartstart_db_4ahd_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON "LegalDocumentVersion" TO smartstart_db_4ahd_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON "LegalDocumentCompliance" TO smartstart_db_4ahd_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON "IPTheftDetection" TO smartstart_db_4ahd_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON "RevenueSharingViolation" TO smartstart_db_4ahd_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON "DigitalEvidence" TO smartstart_db_4ahd_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON "EnforcementAction" TO smartstart_db_4ahd_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON "AssetSeizure" TO smartstart_db_4ahd_user;

GRANT SELECT ON "ActiveLegalTemplates" TO smartstart_db_4ahd_user;
GRANT SELECT ON "UserComplianceStatus" TO smartstart_db_4ahd_user;
GRANT SELECT ON "IPTheftSummary" TO smartstart_db_4ahd_user;

GRANT EXECUTE ON FUNCTION "check_user_legal_compliance" TO smartstart_db_4ahd_user;
GRANT EXECUTE ON FUNCTION "detect_ip_theft" TO smartstart_db_4ahd_user;

-- 18. Add Comments for Documentation
COMMENT ON TABLE "LegalDocumentTemplate" IS 'Templates for critical legal protection documents';
COMMENT ON TABLE "IPTheftDetection" IS 'Records of detected IP theft and violations';
COMMENT ON TABLE "RevenueSharingViolation" IS 'Records of revenue sharing circumvention attempts';
COMMENT ON TABLE "DigitalEvidence" IS 'Digital evidence for legal enforcement';
COMMENT ON TABLE "EnforcementAction" IS 'Actions taken to enforce legal agreements';
COMMENT ON TABLE "AssetSeizure" IS 'Asset seizure orders and execution records';

COMMENT ON FUNCTION "check_user_legal_compliance" IS 'Checks if user has completed all required legal documents for RBAC level';
COMMENT ON FUNCTION "detect_ip_theft" IS 'Creates new IP theft detection record with evidence';
