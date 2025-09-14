-- Enhanced Venture Legal Documentation Schema
-- SmartStart Platform - Comprehensive Legal Framework for Venture Projects

-- ==============================================
-- VENTURE LEGAL DOCUMENT MANAGEMENT
-- ==============================================

-- Project Charter Templates
CREATE TABLE IF NOT EXISTS "ProjectCharterTemplate" (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'VENTURE_OWNER', 'TEAM_LEAD', 'DEVELOPER', 'DESIGNER', 'MARKETER', 'ADVISOR'
    rbac_level INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '{}', -- Template variables for customization
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Charters (instances of templates)
CREATE TABLE IF NOT EXISTS "ProjectCharter" (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    template_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    role VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'EXPIRED'
    signed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES "Project"(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES "ProjectCharterTemplate"(id),
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- 30-Day Project Plans
CREATE TABLE IF NOT EXISTS "ProjectPlan" (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'
    phases JSONB NOT NULL DEFAULT '[]', -- Array of phase objects
    milestones JSONB NOT NULL DEFAULT '[]', -- Array of milestone objects
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES "Project"(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Project Plan Phases
CREATE TABLE IF NOT EXISTS "ProjectPlanPhase" (
    id VARCHAR(50) PRIMARY KEY,
    plan_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_day INTEGER NOT NULL, -- Day number in the 30-day plan
    end_day INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'
    deliverables JSONB DEFAULT '[]',
    dependencies JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES "ProjectPlan"(id) ON DELETE CASCADE
);

-- Project Plan Milestones
CREATE TABLE IF NOT EXISTS "ProjectPlanMilestone" (
    id VARCHAR(50) PRIMARY KEY,
    plan_id VARCHAR(50) NOT NULL,
    phase_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_day INTEGER NOT NULL, -- Day number in the 30-day plan
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'ACHIEVED', 'MISSED', 'DELAYED'
    achieved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES "ProjectPlan"(id) ON DELETE CASCADE,
    FOREIGN KEY (phase_id) REFERENCES "ProjectPlanPhase"(id) ON DELETE SET NULL
);

-- Team Role Definitions
CREATE TABLE IF NOT EXISTS "TeamRoleDefinition" (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'LEADERSHIP', 'DEVELOPMENT', 'DESIGN', 'MARKETING', 'ADVISORY'
    rbac_level INTEGER NOT NULL DEFAULT 1,
    responsibilities JSONB NOT NULL DEFAULT '[]',
    permissions JSONB NOT NULL DEFAULT '[]',
    equity_range JSONB NOT NULL DEFAULT '{"min": 0, "max": 100}', -- Percentage range
    time_commitment VARCHAR(50) DEFAULT 'FULL_TIME', -- 'FULL_TIME', 'PART_TIME', 'CONSULTANT'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Team Members with Roles
CREATE TABLE IF NOT EXISTS "ProjectTeamMember" (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    equity_percentage DECIMAL(5,2) DEFAULT 0.00,
    vesting_schedule JSONB DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'TERMINATED'
    charter_signed BOOLEAN DEFAULT false,
    charter_signed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES "Project"(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES "TeamRoleDefinition"(id),
    UNIQUE(project_id, user_id)
);

-- RACI Matrix for Projects
CREATE TABLE IF NOT EXISTS "ProjectRACIMatrix" (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    activity VARCHAR(255) NOT NULL,
    description TEXT,
    responsible VARCHAR(50), -- User ID
    accountable VARCHAR(50), -- User ID
    consulted JSONB DEFAULT '[]', -- Array of User IDs
    informed JSONB DEFAULT '[]', -- Array of User IDs
    priority VARCHAR(50) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    due_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES "Project"(id) ON DELETE CASCADE,
    FOREIGN KEY (responsible) REFERENCES "User"(id) ON DELETE SET NULL,
    FOREIGN KEY (accountable) REFERENCES "User"(id) ON DELETE SET NULL
);

-- SMART Goals for Projects
CREATE TABLE IF NOT EXISTS "ProjectSMARTGoal" (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    specific TEXT NOT NULL, -- What exactly will be accomplished
    measurable TEXT NOT NULL, -- How will success be measured
    achievable TEXT NOT NULL, -- Is this realistic given constraints
    relevant TEXT NOT NULL, -- How does this align with project goals
    time_bound TEXT NOT NULL, -- What is the deadline
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50), -- 'PERCENTAGE', 'COUNT', 'REVENUE', 'USERS', etc.
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'
    due_date DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES "Project"(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Legal Liability Tracking
CREATE TABLE IF NOT EXISTS "ProjectLiability" (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    liability_type VARCHAR(100) NOT NULL, -- 'INTELLECTUAL_PROPERTY', 'FINANCIAL', 'OPERATIONAL', 'LEGAL', 'REPUTATIONAL'
    description TEXT NOT NULL,
    potential_impact VARCHAR(50) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    probability VARCHAR(50) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CERTAIN'
    mitigation_plan TEXT,
    insurance_required BOOLEAN DEFAULT false,
    insurance_amount DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'MITIGATED', 'ACCEPTED', 'TRANSFERRED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES "Project"(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Enhanced Digital Signature System
CREATE TABLE IF NOT EXISTS "DigitalSignature" (
    id VARCHAR(50) PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- 'CHARTER', 'CONTRACT', 'AGREEMENT', 'PLAN'
    signer_id VARCHAR(50) NOT NULL,
    signature_hash VARCHAR(255) NOT NULL, -- SHA-256 hash of signature
    signature_data JSONB NOT NULL, -- Signature metadata
    ip_address INET,
    user_agent TEXT,
    location JSONB, -- GPS coordinates if available
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'FAILED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (signer_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Legal Document Compliance Tracking
CREATE TABLE IF NOT EXISTS "LegalDocumentCompliance" (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    project_id VARCHAR(50),
    document_id VARCHAR(50) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'SIGNED', 'EXPIRED', 'REVOKED'
    signed_at TIMESTAMP,
    expires_at TIMESTAMP,
    signature_id VARCHAR(50),
    compliance_score INTEGER DEFAULT 0, -- 0-100 compliance score
    last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES "Project"(id) ON DELETE CASCADE,
    FOREIGN KEY (signature_id) REFERENCES "DigitalSignature"(id) ON DELETE SET NULL
);

-- Project Legal Audit Trail
CREATE TABLE IF NOT EXISTS "ProjectLegalAudit" (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'CHARTER_SIGNED', 'ROLE_ASSIGNED', 'LIABILITY_ACCEPTED', etc.
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES "Project"(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_project_charter_project_id ON "ProjectCharter"(project_id);
CREATE INDEX IF NOT EXISTS idx_project_charter_user_id ON "ProjectCharter"(user_id);
CREATE INDEX IF NOT EXISTS idx_project_charter_status ON "ProjectCharter"(status);

CREATE INDEX IF NOT EXISTS idx_project_plan_project_id ON "ProjectPlan"(project_id);
CREATE INDEX IF NOT EXISTS idx_project_plan_status ON "ProjectPlan"(status);

CREATE INDEX IF NOT EXISTS idx_project_plan_phase_plan_id ON "ProjectPlanPhase"(plan_id);
CREATE INDEX IF NOT EXISTS idx_project_plan_milestone_plan_id ON "ProjectPlanMilestone"(plan_id);

CREATE INDEX IF NOT EXISTS idx_project_team_member_project_id ON "ProjectTeamMember"(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_member_user_id ON "ProjectTeamMember"(user_id);
CREATE INDEX IF NOT EXISTS idx_project_team_member_role_id ON "ProjectTeamMember"(role_id);

CREATE INDEX IF NOT EXISTS idx_project_raci_matrix_project_id ON "ProjectRACIMatrix"(project_id);
CREATE INDEX IF NOT EXISTS idx_project_smart_goal_project_id ON "ProjectSMARTGoal"(project_id);
CREATE INDEX IF NOT EXISTS idx_project_smart_goal_user_id ON "ProjectSMARTGoal"(user_id);

CREATE INDEX IF NOT EXISTS idx_digital_signature_document_id ON "DigitalSignature"(document_id);
CREATE INDEX IF NOT EXISTS idx_digital_signature_signer_id ON "DigitalSignature"(signer_id);
CREATE INDEX IF NOT EXISTS idx_digital_signature_verification_status ON "DigitalSignature"(verification_status);

CREATE INDEX IF NOT EXISTS idx_legal_document_compliance_user_id ON "LegalDocumentCompliance"(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_document_compliance_project_id ON "LegalDocumentCompliance"(project_id);
CREATE INDEX IF NOT EXISTS idx_legal_document_compliance_status ON "LegalDocumentCompliance"(status);

CREATE INDEX IF NOT EXISTS idx_project_legal_audit_project_id ON "ProjectLegalAudit"(project_id);
CREATE INDEX IF NOT EXISTS idx_project_legal_audit_user_id ON "ProjectLegalAudit"(user_id);
CREATE INDEX IF NOT EXISTS idx_project_legal_audit_created_at ON "ProjectLegalAudit"(created_at);

-- ==============================================
-- SAMPLE DATA FOR TESTING
-- ==============================================

-- Insert sample team role definitions
INSERT INTO "TeamRoleDefinition" (id, name, display_name, description, category, rbac_level, responsibilities, permissions, equity_range, time_commitment) VALUES
('role_venture_owner', 'VENTURE_OWNER', 'Venture Owner', 'Overall project ownership and strategic direction', 'LEADERSHIP', 4, 
 '["Strategic planning", "Team leadership", "Investor relations", "Final decision making"]',
 '["CREATE_PROJECT", "MANAGE_TEAM", "SIGN_CONTRACTS", "ALLOCATE_EQUITY"]',
 '{"min": 20, "max": 60}', 'FULL_TIME'),

('role_tech_lead', 'TECH_LEAD', 'Technical Lead', 'Technical architecture and development leadership', 'DEVELOPMENT', 3,
 '["Technical architecture", "Code review", "Team mentoring", "Technical decisions"]',
 '["MANAGE_CODE", "REVIEW_CODE", "TECHNICAL_DECISIONS", "MENTOR_TEAM"]',
 '{"min": 5, "max": 25}', 'FULL_TIME'),

('role_developer', 'DEVELOPER', 'Developer', 'Software development and implementation', 'DEVELOPMENT', 2,
 '["Feature development", "Bug fixes", "Testing", "Documentation"]',
 '["WRITE_CODE", "CREATE_FEATURES", "FIX_BUGS", "WRITE_TESTS"]',
 '{"min": 1, "max": 15}', 'FULL_TIME'),

('role_designer', 'DESIGNER', 'UI/UX Designer', 'User interface and experience design', 'DESIGN', 2,
 '["UI design", "UX research", "Prototyping", "Design systems"]',
 '["CREATE_DESIGNS", "USER_RESEARCH", "PROTOTYPE", "DESIGN_SYSTEMS"]',
 '{"min": 1, "max": 10}', 'FULL_TIME'),

('role_marketer', 'MARKETER', 'Marketing Lead', 'Marketing strategy and execution', 'MARKETING', 2,
 '["Marketing strategy", "Content creation", "Social media", "Analytics"]',
 '["CREATE_CAMPAIGNS", "MANAGE_SOCIAL", "ANALYZE_METRICS", "CREATE_CONTENT"]',
 '{"min": 1, "max": 10}', 'FULL_TIME'),

('role_advisor', 'ADVISOR', 'Strategic Advisor', 'Strategic guidance and mentorship', 'ADVISORY', 3,
 '["Strategic advice", "Industry expertise", "Network connections", "Mentorship"]',
 '["PROVIDE_ADVICE", "NETWORK_ACCESS", "MENTOR_TEAM", "STRATEGIC_INPUT"]',
 '{"min": 0.5, "max": 5}', 'CONSULTANT');

-- Insert sample project charter templates
INSERT INTO "ProjectCharterTemplate" (id, name, description, category, rbac_level, content, variables) VALUES
('charter_venture_owner', 'Venture Owner Charter', 'Charter template for venture owners', 'VENTURE_OWNER', 4,
 'VENTURE OWNER CHARTER

Project: {{project_name}}
Venture Owner: {{user_name}}
Date: {{signature_date}}

RESPONSIBILITIES:
- Overall project vision and strategic direction
- Team leadership and decision making
- Investor relations and fundraising
- Final approval on all major decisions
- Equity allocation and cap table management

AUTHORITY:
- Hire and terminate team members
- Approve budgets and expenditures
- Sign contracts and legal documents
- Represent the company externally

LIABILITY:
- Ultimate responsibility for project success
- Financial liability for project debts
- Legal liability for company actions
- Fiduciary duty to all stakeholders

EQUITY ALLOCATION:
- Base equity: {{base_equity}}%
- Performance bonus: {{performance_bonus}}%
- Vesting schedule: {{vesting_schedule}}

SIGNATURE:
I, {{user_name}}, agree to the terms of this Venture Owner Charter.

Digital Signature: {{signature_hash}}
Date: {{signature_date}}',
 '{"project_name": "string", "user_name": "string", "signature_date": "date", "base_equity": "number", "performance_bonus": "number", "vesting_schedule": "string", "signature_hash": "string"}'),

('charter_tech_lead', 'Technical Lead Charter', 'Charter template for technical leads', 'TECH_LEAD', 3,
 'TECHNICAL LEAD CHARTER

Project: {{project_name}}
Technical Lead: {{user_name}}
Date: {{signature_date}}

RESPONSIBILITIES:
- Technical architecture and system design
- Code quality and review processes
- Team mentoring and technical guidance
- Technology stack decisions
- Performance and scalability planning

AUTHORITY:
- Technical decision making
- Code review and approval
- Technology selection
- Development process definition

LIABILITY:
- Technical debt and code quality
- System performance and reliability
- Security vulnerabilities
- Team productivity and delivery

EQUITY ALLOCATION:
- Base equity: {{base_equity}}%
- Performance bonus: {{performance_bonus}}%
- Vesting schedule: {{vesting_schedule}}

SIGNATURE:
I, {{user_name}}, agree to the terms of this Technical Lead Charter.

Digital Signature: {{signature_hash}}
Date: {{signature_date}}',
 '{"project_name": "string", "user_name": "string", "signature_date": "date", "base_equity": "number", "performance_bonus": "number", "vesting_schedule": "string", "signature_hash": "string"}');

-- Insert sample 30-day project plan template
INSERT INTO "ProjectPlan" (id, project_id, title, description, start_date, end_date, status, phases, milestones, created_by) VALUES
('plan_template_30day', 'template', '30-Day Venture Launch Plan', 'Standard 30-day venture launch template', 
 CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'DRAFT',
 '[
   {
     "id": "phase_foundation",
     "name": "Foundation Phase",
     "start_day": 1,
     "end_day": 7,
     "description": "Project setup, team formation, and initial planning"
   },
   {
     "id": "phase_sprint1",
     "name": "Sprint 1 - Core Development",
     "start_day": 8,
     "end_day": 15,
     "description": "Core feature development and MVP creation"
   },
   {
     "id": "phase_sprint2",
     "name": "Sprint 2 - Enhancement",
     "start_day": 16,
     "end_day": 23,
     "description": "Feature enhancement and testing"
   },
   {
     "id": "phase_launch",
     "name": "Launch Preparation",
     "start_day": 24,
     "end_day": 30,
     "description": "Final testing, deployment, and launch"
   }
 ]',
 '[
   {
     "id": "milestone_team_formed",
     "name": "Team Formation Complete",
     "target_day": 3,
     "description": "All key team members onboarded and charters signed"
   },
   {
     "id": "milestone_mvp_ready",
     "name": "MVP Ready",
     "target_day": 15,
     "description": "Minimum viable product completed and tested"
   },
   {
     "id": "milestone_launch_ready",
     "name": "Launch Ready",
     "target_day": 28,
     "description": "Product ready for public launch"
   }
 ]',
 'system');
