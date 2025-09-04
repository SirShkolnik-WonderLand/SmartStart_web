#!/bin/bash

# Setup Documentation Structure for AliceSolutions Ventures
# This script creates the complete documentation folder structure and moves existing files

echo "🚀 Setting up AliceSolutions Ventures documentation structure..."

# Create main documentation directory
mkdir -p documentation

# Create main documentation files
touch documentation/README.txt
touch documentation/rules.txt
touch documentation/rules_venture_start.txt

# Create policies directory and files
mkdir -p documentation/policies
touch documentation/policies/terms_of_use_public.txt
touch documentation/policies/privacy_policy_public.txt
touch documentation/policies/cookie_notice.txt
touch documentation/policies/responsible_disclosure.txt
touch documentation/policies/aoda_wcag_statement.txt

# Create contracts directory and files
mkdir -p documentation/contracts
touch "documentation/contracts/Platform_Participation_Agreement_(PPA).txt"
touch "documentation/contracts/Mutual_NDA_Internal.txt"
touch "documentation/contracts/Per-Project_NDA_Addendum_Tiered.txt"
touch "documentation/contracts/Participant_Collaboration_Agreement_(PCA).txt"
touch "documentation/contracts/Joint_Development_Agreement_(JDA).txt"
touch "documentation/contracts/Data_Processing_Addendum_(DPA).txt"
touch "documentation/contracts/Idea_Submission_Evaluation_Agreement.txt"
touch "documentation/contracts/Platform_Tools_Subscription_Agreement_(PTSA).txt"
touch "documentation/contracts/Standardized_Tooling_Hosting_Compliance_Addendum_(STHCA).txt"
touch "documentation/contracts/SOBA_template.txt"
touch "documentation/contracts/PUOHA_template.txt"
touch "documentation/contracts/ESignature_Consent.txt"
touch "documentation/contracts/Privacy_Notice_Acknowledgment.txt"
touch "documentation/contracts/Security_Tooling_Acknowledgment.txt"
touch "documentation/contracts/IP_Takedown_Notice_and_Notice.txt"
touch "documentation/contracts/Marketplace_Terms.txt"
touch "documentation/contracts/MSA_Template.txt"
touch "documentation/contracts/SOW_Template.txt"
touch "documentation/contracts/Equity_and_Vesting_Agreement_Template.txt"
touch "documentation/contracts/Shareholders_Agreement_Checklist.txt"

# Create security directory and files
mkdir -p documentation/security
touch documentation/security/access_control_policy.txt
touch documentation/security/byod_endpoint_policy.txt
touch documentation/security/secrets_key_mgmt.txt
touch documentation/security/vuln_patch_policy.txt
touch documentation/security/logging_monitoring_standard.txt
touch documentation/security/incident_response_plan.txt
touch documentation/security/bcp_dr_policy.txt
touch documentation/security/data_retention_schedule.txt
touch documentation/security/vendor_risk_policy.txt
touch documentation/security/ai_usage_policy.txt
touch documentation/security/data_classification_standard.txt
touch documentation/security/subprocessor_register.csv
touch documentation/security/exception_log_template.csv

# Create engineering directory and files
mkdir -p documentation/engineering
mkdir -p documentation/engineering/runbooks
touch documentation/engineering/secure_sdlc_policy.txt
touch documentation/engineering/change_release_policy.txt
touch documentation/engineering/oss_policy.txt
touch documentation/engineering/definition_of_done.txt
touch documentation/engineering/runbooks_index.txt
touch documentation/engineering/runbooks/provisioning_runbook.txt
touch documentation/engineering/runbooks/offboarding_runbook.txt
touch documentation/engineering/runbooks/incident_comms_templates.txt
touch documentation/engineering/runbooks/backup_restore_procedures.txt

# Create ops directory and files
mkdir -p documentation/ops
touch documentation/ops/on_offboarding_sop.txt
touch documentation/ops/support_sla.txt
touch documentation/ops/billing_tax_policy.txt
touch documentation/ops/abac_policy.txt
touch documentation/ops/whistleblower_policy.txt
touch documentation/ops/conflict_of_interest.txt

# Create compliance directory and files
mkdir -p documentation/compliance
mkdir -p documentation/compliance/gdpr_toolkit
touch documentation/compliance/phipa_schedule.txt
touch documentation/compliance/gdpr_toolkit/ropa_template.csv
touch documentation/compliance/gdpr_toolkit/dpia_template.txt
touch documentation/compliance/gdpr_toolkit/transfer_checklist.txt
touch documentation/compliance/pci_attestation_nostore.txt

echo "📁 Created complete documentation structure"

# Move existing files to their proper locations
echo "📋 Moving existing files to proper locations..."

# Move security_controls_master.txt to documentation/security/
if [ -f "server/documantetions/security/security_controls_master.txt" ]; then
    cp "server/documantetions/security/security_controls_master.txt" "documentation/security/security_controls_master.txt"
    echo "✅ Moved security_controls_master.txt to documentation/security/"
fi

# Move full list.txt to documentation/ (as reference)
if [ -f "server/documantetions/full list.txt" ]; then
    cp "server/documantetions/full list.txt" "documentation/full_list_reference.txt"
    echo "✅ Moved full list.txt to documentation/ as reference"
fi

# Move existing contract files to documentation/contracts/
echo "📄 Moving existing contract files..."

# Move PPA.txt
if [ -f "server/Contracts/PPA.txt" ]; then
    cp "server/Contracts/PPA.txt" "documentation/contracts/Platform_Participation_Agreement_(PPA).txt"
    echo "✅ Moved PPA.txt"
fi

# Move InternalMutual Confidentiality & Non-Exfiltration Agreement.txt
if [ -f "server/Contracts/InternalMutual Confidentiality & Non-Exfiltration Agreement.txt" ]; then
    cp "server/Contracts/InternalMutual Confidentiality & Non-Exfiltration Agreement.txt" "documentation/contracts/Mutual_NDA_Internal.txt"
    echo "✅ Moved InternalMutual Confidentiality & Non-Exfiltration Agreement.txt"
fi

# Move Per-Project NDA Addendum (Security-Tiered).txt
if [ -f "server/Contracts/Per-Project NDA Addendum (Security-Tiered).txt" ]; then
    cp "server/Contracts/Per-Project NDA Addendum (Security-Tiered).txt" "documentation/contracts/Per-Project_NDA_Addendum_Tiered.txt"
    echo "✅ Moved Per-Project NDA Addendum (Security-Tiered).txt"
fi

# Move PARTICIPANT COLLABORATION AGREEMENT (PCA).txt
if [ -f "server/Contracts/PARTICIPANT COLLABORATION AGREEMENT (PCA).txt" ]; then
    cp "server/Contracts/PARTICIPANT COLLABORATION AGREEMENT (PCA).txt" "documentation/contracts/Participant_Collaboration_Agreement_(PCA).txt"
    echo "✅ Moved PARTICIPANT COLLABORATION AGREEMENT (PCA).txt"
fi

# Move JOINT DEVELOPMENT AGREEMENT (JDA).txt
if [ -f "server/Contracts/JOINT DEVELOPMENT AGREEMENT (JDA).txt" ]; then
    cp "server/Contracts/JOINT DEVELOPMENT AGREEMENT (JDA).txt" "documentation/contracts/Joint_Development_Agreement_(JDA).txt"
    echo "✅ Moved JOINT DEVELOPMENT AGREEMENT (JDA).txt"
fi

# Move IDEA SUBMISSION & EVALUATION AGREEMENT.txt
if [ -f "server/Contracts/IDEA SUBMISSION & EVALUATION AGREEMENT.txt" ]; then
    cp "server/Contracts/IDEA SUBMISSION & EVALUATION AGREEMENT.txt" "documentation/contracts/Idea_Submission_Evaluation_Agreement.txt"
    echo "✅ Moved IDEA SUBMISSION & EVALUATION AGREEMENT.txt"
fi

# Move PLATFORM TOOLS SUBSCRIPTION AGREEMENT (PTSA).txt
if [ -f "server/Contracts/PLATFORM TOOLS SUBSCRIPTION AGREEMENT (PTSA).txt" ]; then
    cp "server/Contracts/PLATFORM TOOLS SUBSCRIPTION AGREEMENT (PTSA).txt" "documentation/contracts/Platform_Tools_Subscription_Agreement_(PTSA).txt"
    echo "✅ Moved PLATFORM TOOLS SUBSCRIPTION AGREEMENT (PTSA).txt"
fi

# Move SEAT ORDER & BILLING AUTHORIZATION (SOBA).txt
if [ -f "server/Contracts/SEAT ORDER & BILLING AUTHORIZATION (SOBA).txt" ]; then
    cp "server/Contracts/SEAT ORDER & BILLING AUTHORIZATION (SOBA).txt" "documentation/contracts/SOBA_template.txt"
    echo "✅ Moved SEAT ORDER & BILLING AUTHORIZATION (SOBA).txt"
fi

# Move Signing Flow & Gating (recommended order).txt to documentation/
if [ -f "server/Contracts/Signing Flow & Gating (recommended order).txt" ]; then
    cp "server/Contracts/Signing Flow & Gating (recommended order).txt" "documentation/signing_flow_gating.txt"
    echo "✅ Moved Signing Flow & Gating (recommended order).txt"
fi

# Move RULES.TXT — CLI CONTRACT FLOWS (SOBA + PUOHA) to documentation/
if [ -f "server/Contracts/RULES.TXT — CLI CONTRACT FLOWS (SOBA + PUOHA)" ]; then
    cp "server/Contracts/RULES.TXT — CLI CONTRACT FLOWS (SOBA + PUOHA)" "documentation/rules.txt"
    echo "✅ Moved RULES.TXT — CLI CONTRACT FLOWS (SOBA + PUOHA)"
fi

# Move rules_venture_start.txt.txt to documentation/
if [ -f "server/Contracts/rules_venture_start.txt.txt" ]; then
    cp "server/Contracts/rules_venture_start.txt.txt" "documentation/rules_venture_start.txt"
    echo "✅ Moved rules_venture_start.txt.txt"
fi

# Move user journey contracts
if [ -f "server/Contracts/A) AliceSolutions ↔ User (at registration  onboarding).txt" ]; then
    cp "server/Contracts/A) AliceSolutions ↔ User (at registration  onboarding).txt" "documentation/contracts/AliceSolutions_User_Registration_Onboarding.txt"
    echo "✅ Moved A) AliceSolutions ↔ User (at registration  onboarding).txt"
fi

if [ -f "server/Contracts/B) Between Users on the same venture project (participant ↔ participant).txt" ]; then
    cp "server/Contracts/B) Between Users on the same venture project (participant ↔ participant).txt" "documentation/contracts/Between_Users_Venture_Project.txt"
    echo "✅ Moved B) Between Users on the same venture project (participant ↔ participant).txt"
fi

if [ -f "server/Contracts/C) AliceSolutions ↔ Idea Owner (inside the Hub).txt" ]; then
    cp "server/Contracts/C) AliceSolutions ↔ Idea Owner (inside the Hub).txt" "documentation/contracts/AliceSolutions_Idea_Owner_Hub.txt"
    echo "✅ Moved C) AliceSolutions ↔ Idea Owner (inside the Hub).txt"
fi

echo ""
echo "🎉 Documentation structure setup complete!"
echo ""
echo "📊 Summary:"
echo "   • Created complete documentation folder structure"
echo "   • Moved existing files to proper locations"
echo "   • Created all empty files from the comprehensive list"
echo ""
echo "📁 Structure created:"
echo "   documentation/"
echo "   ├── policies/ (5 files)"
echo "   ├── contracts/ (22 files)"
echo "   ├── security/ (13 files)"
echo "   ├── engineering/ (9 files including runbooks/)"
echo "   ├── ops/ (6 files)"
echo "   └── compliance/ (5 files including gdpr_toolkit/)"
echo ""
echo "✅ Ready for you to fill in the content one by one!"
echo "💡 Start with Priority 1 files as recommended in your analysis."
