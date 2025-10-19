// Seed script for ISO 27001:2022 controls
// Run with: node prisma/seed-controls.js

const controls = [
  // A.5 - Organizational controls
  {
    domain: "A5",
    code: "A.5.1",
    title: "Policies for information security",
    description: "A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.",
    intent: "Define and enforce clear security policies that guide all information security activities.",
    passCriteria: JSON.stringify([
      "Policy approved <12 months",
      "Policy communicated to all employees",
      "Policy reviewed annually",
      "Policy accessible to all staff"
    ]),
    hints: JSON.stringify([
      "Reference: ISMS-POL-001",
      "Include in employee handbook",
      "Post on intranet"
    ]),
    pitfalls: JSON.stringify([
      "Outdated policies",
      "Not communicated to contractors",
      "No annual review process"
    ]),
    cmmcRef: "3.12.1",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.2",
    title: "Information security roles and responsibilities",
    description: "Information security roles and responsibilities shall be defined and allocated according to the organization's needs.",
    intent: "Ensure clear accountability for information security across the organization.",
    passCriteria: JSON.stringify([
      "RACI matrix defined",
      "Roles documented in job descriptions",
      "CISO or equivalent appointed",
      "Delegation matrix in place"
    ]),
    hints: JSON.stringify([
      "Reference: ORG-CHART-2025",
      "Include in onboarding materials",
      "Review quarterly"
    ]),
    pitfalls: JSON.stringify([
      "Shared admin accounts",
      "No segregation of duties",
      "Unclear reporting lines"
    ]),
    cmmcRef: "3.12.2",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.3",
    title: "Segregation of duties",
    description: "Conflicting duties and conflicting areas of responsibility shall be segregated.",
    intent: "Prevent fraud and errors by separating incompatible functions.",
    passCriteria: JSON.stringify([
      "SoD matrix defined",
      "Access controls enforce SoD",
      "Regular reviews conducted",
      "Exceptions documented"
    ]),
    hints: JSON.stringify([
      "Reference: SOD-MATRIX-2025",
      "Focus on finance and IT operations",
      "Document all exceptions"
    ]),
    pitfalls: JSON.stringify([
      "Developer with production access",
      "Finance user approving own expenses",
      "No compensating controls"
    ]),
    cmmcRef: "3.1.5",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.4",
    title: "Management responsibilities",
    description: "Management shall require all personnel to apply information security in accordance with the established policies and procedures of the organization.",
    intent: "Ensure management actively supports and enforces information security.",
    passCriteria: JSON.stringify([
      "Management review meetings held quarterly",
      "ISMS objectives defined",
      "KPI reports reviewed",
      "Management commitment visible"
    ]),
    hints: JSON.stringify([
      "Reference: MGMT-REVIEW-2025-Q1",
      "Document meeting minutes",
      "Track action items"
    ]),
    pitfalls: JSON.stringify([
      "No management involvement",
      "Security seen as IT-only",
      "No budget allocated"
    ]),
    cmmcRef: "3.12.1",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.5",
    title: "Contact with authorities",
    description: "Appropriate contacts with relevant authorities shall be maintained.",
    intent: "Ensure proper communication with law enforcement and regulatory bodies.",
    passCriteria: JSON.stringify([
      "Contact list maintained",
      "Escalation procedure defined",
      "Regular updates to contacts",
      "Incident reporting process"
    ]),
    hints: JSON.stringify([
      "Include: local police, CERT, privacy commissioner",
      "Update annually",
      "Test contact procedures"
    ]),
    pitfalls: JSON.stringify([
      "Outdated contacts",
      "No escalation process",
      "Delayed reporting"
    ]),
    cmmcRef: "3.6.1",
    weight: 1
  },
  {
    domain: "A5",
    code: "A.5.6",
    title: "Contact with special interest groups",
    description: "Appropriate contacts with special interest groups or other specialist security forums and professional associations shall be maintained.",
    intent: "Stay informed about security threats and best practices.",
    passCriteria: JSON.stringify([
      "Membership in CERT/ISAC",
      "Participation in security forums",
      "Threat intelligence subscriptions",
      "Regular threat briefings"
    ]),
    hints: JSON.stringify([
      "Join: local CERT, ISAC, security associations",
      "Attend quarterly meetings",
      "Share threat intelligence"
    ]),
    pitfalls: JSON.stringify([
      "No external threat intelligence",
      "Isolated from security community",
      "Missed threat warnings"
    ]),
    cmmcRef: "3.6.1",
    weight: 1
  },
  {
    domain: "A5",
    code: "A.5.7",
    title: "Threat intelligence",
    description: "Information relating to information security threats shall be collected and analyzed to produce threat intelligence.",
    intent: "Proactively identify and respond to security threats.",
    passCriteria: JSON.stringify([
      "Threat intel process defined",
      "Multiple sources subscribed",
      "Regular analysis conducted",
      "Actionable intelligence produced"
    ]),
    hints: JSON.stringify([
      "Sources: commercial feeds, open source, government alerts",
      "Analyze weekly",
      "Share with SOC team"
    ]),
    pitfalls: JSON.stringify([
      "No threat intelligence program",
      "Reactive only",
      "No analysis of threats"
    ]),
    cmmcRef: "3.14.1",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.8",
    title: "Information security in project management",
    description: "Information security shall be integrated into project management.",
    intent: "Ensure security is built into all projects from the start.",
    passCriteria: JSON.stringify([
      "Secure SDLC defined",
      "Security gates in project lifecycle",
      "Security requirements in project charter",
      "Security review at each phase"
    ]),
    hints: JSON.stringify([
      "Reference: SDLC-SEC-CHECKLIST",
      "Include in PMO templates",
      "Train project managers"
    ]),
    pitfalls: JSON.stringify([
      "Security as afterthought",
      "No security in requirements",
      "Security bypassed for speed"
    ]),
    cmmcRef: "3.1.1",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.9",
    title: "Inventory of information and other associated assets",
    description: "An inventory of information and other associated assets, including owners, shall be drawn up and maintained.",
    intent: "Know what assets you have and who owns them.",
    passCriteria: JSON.stringify([
      "Asset register maintained",
      "All assets have owners",
      "Auto-discovery tools used",
      "Quarterly reviews conducted"
    ]),
    hints: JSON.stringify([
      "Use: asset management tools, CMDB",
      "Include: hardware, software, data, people",
      "Update on changes"
    ]),
    pitfalls: JSON.stringify([
      "Outdated inventory",
      "Shadow IT not tracked",
      "No asset owners"
    ]),
    cmmcRef: "3.4.1",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.10",
    title: "Acceptable use of information and other associated assets",
    description: "Rules for the acceptable use of information and other associated assets shall be established, implemented and communicated to personnel.",
    intent: "Define what's acceptable use of company assets.",
    passCriteria: JSON.stringify([
      "Acceptable Use Policy defined",
      "All employees sign AUP",
      "Policy covers all asset types",
      "Enforcement mechanism exists"
    ]),
    hints: JSON.stringify([
      "Reference: AUP-2025",
      "Include in onboarding",
      "Annual re-signature"
    ]),
    pitfalls: JSON.stringify([
      "No AUP",
      "Not signed by employees",
      "No enforcement"
    ]),
    cmmcRef: "3.1.6",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.11",
    title: "Return of assets",
    description: "All personnel shall return all of the organization's assets in their possession upon termination of their employment, contract or agreement.",
    intent: "Ensure assets are returned when people leave.",
    passCriteria: JSON.stringify([
      "Off-boarding checklist defined",
      "All assets tracked",
      "Return process enforced",
      "Exit interviews conducted"
    ]),
    hints: JSON.stringify([
      "Reference: OFFBOARD-CHECKLIST",
      "Include: laptops, phones, access cards, keys",
      "Track in HRIS"
    ]),
    pitfalls: JSON.stringify([
      "Assets not returned",
      "No tracking system",
      "Delayed access revocation"
    ]),
    cmmcRef: "3.1.6",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.12",
    title: "Classification of information",
    description: "Information shall be classified according to the information security needs of the organization based on confidentiality, integrity, availability and relevant interested parties.",
    intent: "Classify information based on its sensitivity.",
    passCriteria: JSON.stringify([
      "Classification scheme defined",
      "All information classified",
      "Labels applied consistently",
      "Review process exists"
    ]),
    hints: JSON.stringify([
      "Scheme: Public, Internal, Confidential, Restricted",
      "Use DLP tools",
      "Train all staff"
    ]),
    pitfalls: JSON.stringify([
      "No classification scheme",
      "Inconsistent application",
      "Over-classification"
    ]),
    cmmcRef: "3.1.2",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.13",
    title: "Labelling of information",
    description: "An appropriate set of procedures for labelling information shall be developed and implemented in accordance with the information classification scheme adopted by the organization.",
    intent: "Label information according to its classification.",
    passCriteria: JSON.stringify([
      "Labelling procedure defined",
      "Labels visible on all media",
      "DLP enforces labels",
      "Staff trained on labelling"
    ]),
    hints: JSON.stringify([
      "Use: visual labels, metadata, DLP",
      "Include: email, documents, databases",
      "Automate where possible"
    ]),
    pitfalls: JSON.stringify([
      "No labels on documents",
      "Inconsistent labelling",
      "No enforcement"
    ]),
    cmmcRef: "3.1.3",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.14",
    title: "Information transfer",
    description: "Information transfer rules, procedures or agreements shall be in place for all types of transfer facilities within the organization and between the organization and other parties.",
    intent: "Ensure secure transfer of information.",
    passCriteria: JSON.stringify([
      "Transfer procedures defined",
      "Encryption required",
      "Secure channels used",
      "Transfer logs maintained"
    ]),
    hints: JSON.stringify([
      "Use: encrypted email, SFTP, VPN",
      "Prohibit: unencrypted email, USB drives",
      "Log all transfers"
    ]),
    pitfalls: JSON.stringify([
      "Unencrypted transfers",
      "No procedure",
      "Use of insecure channels"
    ]),
    cmmcRef: "3.13.8",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.15",
    title: "Access control",
    description: "Rules to control access to information, other associated assets and business processes shall be established and reviewed based on business and information security requirements.",
    intent: "Define and enforce access control rules.",
    passCriteria: JSON.stringify([
      "Access control policy defined",
      "RBAC implemented",
      "Least privilege enforced",
      "Regular access reviews"
    ]),
    hints: JSON.stringify([
      "Reference: AC-POL-001",
      "Use: IAM tools, RBAC matrices",
      "Review quarterly"
    ]),
    pitfalls: JSON.stringify([
      "No access control policy",
      "Excessive permissions",
      "No access reviews"
    ]),
    cmmcRef: "3.1.1",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.16",
    title: "Identity management",
    description: "The full life cycle of identities shall be managed.",
    intent: "Manage user identities from creation to deletion.",
    passCriteria: JSON.stringify([
      "IAM process defined",
      "Automated provisioning",
      "Regular access reviews",
      "Timely de-provisioning"
    ]),
    hints: JSON.stringify([
      "Use: IAM tools, SSO, MFA",
      "Automate: joiners, movers, leavers",
      "Review quarterly"
    ]),
    pitfalls: JSON.stringify([
      "Manual provisioning",
      "Orphaned accounts",
      "Delayed de-provisioning"
    ]),
    cmmcRef: "3.5.1",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.17",
    title: "Authentication information",
    description: "Authentication information shall be assigned, managed and revoked securely.",
    intent: "Secure management of authentication credentials.",
    passCriteria: JSON.stringify([
      "Password policy defined",
      "MFA enabled",
      "Credential management process",
      "Regular credential rotation"
    ]),
    hints: JSON.stringify([
      "Policy: 12+ chars, complexity, 90-day rotation",
      "MFA: all external access",
      "Use: password managers"
    ]),
    pitfalls: JSON.stringify([
      "Weak passwords",
      "No MFA",
      "Shared credentials"
    ]),
    cmmcRef: "3.5.3",
    weight: 2
  },
  {
    domain: "A5",
    code: "A.5.18",
    title: "Access rights",
    description: "Access rights to information and other associated assets shall be provisioned, reviewed, modified and removed.",
    intent: "Manage access rights throughout the lifecycle.",
    passCriteria: JSON.stringify([
      "Access review process defined",
      "Quarterly reviews conducted",
      "Access requests approved",
      "Removal on role change"
    ]),
    hints: JSON.stringify([
      "Use: access review tools",
      "Document approvals",
      "Automate where possible"
    ]),
    pitfalls: JSON.stringify([
      "No access reviews",
      "Excessive permissions",
      "No approval process"
    ]),
    cmmcRef: "3.1.5",
    weight: 2
  }
  // Add remaining 78 controls here...
];

console.log(`Total controls: ${controls.length}`);
console.log('Controls:', JSON.stringify(controls, null, 2));

