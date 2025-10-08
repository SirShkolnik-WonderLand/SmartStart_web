export type AssessmentMode = 'lite' | 'standard' | 'pro';

export interface Question {
  id: number;
  category: string;
  text: string;
  choices: {
    value: number;
    label: string;
  }[];
}

export interface TierConfig {
  name: 'red' | 'amber' | 'green';
  color: string;
  minPercent: number;
  maxPercent: number;
  copy: string;
}

// Core 12 questions (used in all modes)
export const core12: Question[] = [
  // A. Access & Identity
  {
    id: 1,
    category: 'Access & Identity',
    text: 'MFA everywhere?',
    choices: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Some' },
      { value: 2, label: 'Yes, org-wide' },
    ],
  },
  {
    id: 2,
    category: 'Access & Identity',
    text: 'Password manager?',
    choices: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Piloting' },
      { value: 2, label: 'Yes, with policies' },
    ],
  },
  {
    id: 3,
    category: 'Access & Identity',
    text: 'Offboarding same day?',
    choices: [
      { value: 0, label: 'Slow' },
      { value: 1, label: '≤1 week' },
      { value: 2, label: 'Same day' },
    ],
  },
  // B. Devices & Network
  {
    id: 4,
    category: 'Devices & Network',
    text: 'Auto-patch + disk encryption?',
    choices: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Partial' },
      { value: 2, label: 'Enforced' },
    ],
  },
  {
    id: 5,
    category: 'Devices & Network',
    text: 'EDR/Next-Gen AV on endpoints?',
    choices: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Some' },
      { value: 2, label: 'Yes, monitored' },
    ],
  },
  {
    id: 6,
    category: 'Devices & Network',
    text: 'Wi-Fi segmented (staff/guest/IoT)?',
    choices: [
      { value: 0, label: 'Single' },
      { value: 1, label: 'Partial' },
      { value: 2, label: 'Segmented' },
    ],
  },
  // C. Email & People
  {
    id: 7,
    category: 'Email & People',
    text: 'Phishing sims + training (≥ quarterly)?',
    choices: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Sometimes' },
      { value: 2, label: 'Routine' },
    ],
  },
  {
    id: 8,
    category: 'Email & People',
    text: '"Report phishing" button?',
    choices: [
      { value: 0, label: 'No' },
      { value: 1, label: 'IT only' },
      { value: 2, label: 'Everyone' },
    ],
  },
  // D. Data & Incidents
  {
    id: 9,
    category: 'Data & Incidents',
    text: 'Daily backups incl. immutable/offline?',
    choices: [
      { value: 0, label: 'Unsure' },
      { value: 1, label: 'Cloud only' },
      { value: 2, label: 'Cloud+immutable' },
    ],
  },
  {
    id: 10,
    category: 'Data & Incidents',
    text: 'Restore test in last 6 months?',
    choices: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Last year' },
      { value: 2, label: 'Yes, documented' },
    ],
  },
  {
    id: 11,
    category: 'Data & Incidents',
    text: 'Incident Response plan?',
    choices: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Draft' },
      { value: 2, label: 'Rehearsed' },
    ],
  },
  // E. Fit & Expectations
  {
    id: 12,
    category: 'Fit & Expectations',
    text: 'Business type',
    choices: [
      { value: 0, label: 'General SMB (PIPEDA)' },
      { value: 1, label: 'Health (PHIPA)' },
      { value: 2, label: 'Enterprise/US (ISO 27001/SOC 2)' },
    ],
  },
];

// Mini-packs (3 questions each)
export const miniPacks: { [key: string]: Question[] } = {
  // P1 — Cloud & SaaS Hygiene
  p1: [
    {
      id: 13,
      category: 'Cloud & SaaS Hygiene',
      text: 'SSO+MFA beyond email',
      choices: [
        { value: 0, label: 'Rare' },
        { value: 1, label: 'Some critical apps' },
        { value: 2, label: 'Most apps via SSO+MFA' },
      ],
    },
    {
      id: 14,
      category: 'Cloud & SaaS Hygiene',
      text: 'App access reviews (quarterly)',
      choices: [
        { value: 0, label: 'Never' },
        { value: 1, label: 'Ad-hoc' },
        { value: 2, label: 'Scheduled+documented' },
      ],
    },
    {
      id: 15,
      category: 'Cloud & SaaS Hygiene',
      text: 'Least-privilege admin',
      choices: [
        { value: 0, label: 'Wide global admins' },
        { value: 1, label: 'Some scoped roles' },
        { value: 2, label: 'Strict RBAC + break-glass' },
      ],
    },
  ],
  // P2 — Email Authentication (SPF/DKIM/DMARC)
  p2: [
    {
      id: 16,
      category: 'Email Authentication',
      text: 'SPF status',
      choices: [
        { value: 0, label: 'None/invalid' },
        { value: 1, label: 'Present but failing' },
        { value: 2, label: 'Valid & monitored' },
      ],
    },
    {
      id: 17,
      category: 'Email Authentication',
      text: 'DKIM signing',
      choices: [
        { value: 0, label: 'Off' },
        { value: 1, label: 'Main domain only' },
        { value: 2, label: 'All sending domains' },
      ],
    },
    {
      id: 18,
      category: 'Email Authentication',
      text: 'DMARC policy',
      choices: [
        { value: 0, label: 'none/monitor' },
        { value: 1, label: 'quarantine' },
        { value: 2, label: 'reject + reports reviewed' },
      ],
    },
  ],
  // P3 — Microsoft 365 Hardening
  p3: [
    {
      id: 19,
      category: 'Microsoft 365 Hardening',
      text: 'Conditional Access/Security defaults',
      choices: [
        { value: 0, label: 'Off' },
        { value: 1, label: 'Partial' },
        { value: 2, label: 'Enforced org-wide' },
      ],
    },
    {
      id: 20,
      category: 'Microsoft 365 Hardening',
      text: 'Defender Safe Links/Attachments',
      choices: [
        { value: 0, label: 'Off' },
        { value: 1, label: 'Some groups' },
        { value: 2, label: 'Policies for all users' },
      ],
    },
    {
      id: 21,
      category: 'Microsoft 365 Hardening',
      text: 'Legacy auth',
      choices: [
        { value: 0, label: 'Allowed' },
        { value: 1, label: 'In progress' },
        { value: 2, label: 'Fully blocked' },
      ],
    },
  ],
  // P4 — Web & DNS Posture
  p4: [
    {
      id: 22,
      category: 'Web & DNS Posture',
      text: 'TLS posture',
      choices: [
        { value: 0, label: 'Mixed/insecure' },
        { value: 1, label: 'Mostly HTTPS' },
        { value: 2, label: 'HSTS + modern ciphers' },
      ],
    },
    {
      id: 23,
      category: 'Web & DNS Posture',
      text: 'Security headers (CSP, HSTS, X-Frame, etc.)',
      choices: [
        { value: 0, label: 'Minimal' },
        { value: 1, label: 'Partial' },
        { value: 2, label: 'Baseline set' },
      ],
    },
    {
      id: 24,
      category: 'Web & DNS Posture',
      text: 'DNS hygiene (stale records, registrar lock, 2FA)',
      choices: [
        { value: 0, label: 'Unknown' },
        { value: 1, label: 'Some controls' },
        { value: 2, label: 'Audited + locked + 2FA' },
      ],
    },
  ],
  // P5 — Backup & DR Maturity
  p5: [
    {
      id: 25,
      category: 'Backup & DR Maturity',
      text: '3-2-1 rule',
      choices: [
        { value: 0, label: 'Not met' },
        { value: 1, label: 'Partially' },
        { value: 2, label: 'Fully met' },
      ],
    },
    {
      id: 26,
      category: 'Backup & DR Maturity',
      text: 'RPO/RTO defined per system',
      choices: [
        { value: 0, label: 'No targets' },
        { value: 1, label: 'Rough targets' },
        { value: 2, label: 'Documented+tested' },
      ],
    },
    {
      id: 27,
      category: 'Backup & DR Maturity',
      text: 'DR exercise last 12 months',
      choices: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Tabletop' },
        { value: 2, label: 'Live restore w/ timings' },
      ],
    },
  ],
  // P6 — Logging & Monitoring
  p6: [
    {
      id: 28,
      category: 'Logging & Monitoring',
      text: 'Centralized logs',
      choices: [
        { value: 0, label: 'Local only' },
        { value: 1, label: 'Partial' },
        { value: 2, label: 'Centralized+retention' },
      ],
    },
    {
      id: 29,
      category: 'Logging & Monitoring',
      text: 'Alerting coverage',
      choices: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Best-effort' },
        { value: 2, label: 'Defined on-call or vendor SOC' },
      ],
    },
    {
      id: 30,
      category: 'Logging & Monitoring',
      text: 'Use cases (MFA fails, impossible travel, EDR hits)',
      choices: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Few' },
        { value: 2, label: 'Curated set + weekly review' },
      ],
    },
  ],
};

// Mode composition
export const modeQuestions: { [K in AssessmentMode]: Question[] } = {
  lite: core12,
  standard: [...core12, ...miniPacks.p2, ...miniPacks.p5], // Core 12 + P2 + P5
  pro: [...core12, ...miniPacks.p1, ...miniPacks.p2, ...miniPacks.p3, ...miniPacks.p4, ...miniPacks.p5, ...miniPacks.p6],
};

export const modeConfig = {
  lite: { questions: 12, time: '3-4 min' },
  standard: { questions: 18, time: '5-6 min' },
  pro: { questions: 30, time: '9-11 min' },
};

// Tier configuration
export const tiers: TierConfig[] = [
  {
    name: 'red',
    color: '#ff5c5c',
    minPercent: 0,
    maxPercent: 0.35,
    copy: "You're exposed. Fix the basics below first.",
  },
  {
    name: 'amber',
    color: '#ffb020',
    minPercent: 0.35,
    maxPercent: 0.66,
    copy: 'Getting there. Close your top gaps next.',
  },
  {
    name: 'green',
    color: '#31d0aa',
    minPercent: 0.66,
    maxPercent: 1,
    copy: 'Solid baseline. Formalize and monitor.',
  },
];

// Top fixes priority order
export const topFixes = [
  'Enable MFA Everywhere',
  'Deploy EDR on All Devices',
  'Implement Immutable Backups',
  'Adopt a Password Manager',
  'Same-Day Account Off-boarding',
  'Segment Your Wi-Fi',
  'Run Phishing Simulations',
  'Write an Incident Response Plan',
  'Centralize SSO+MFA for SaaS',
  'Quarterly App Access Reviews',
  'Least-Privilege Admin Roles',
  'SPF/DKIM/DMARC Setup',
  'Microsoft 365 Hardening',
  'TLS/HSTS+Security Headers',
  'Centralized Logs+Alerts',
  'RPO/RTO+DR Testing',
];

// Fix descriptions
export const fixDescriptions: { [key: string]: string } = {
  'Enable MFA Everywhere': 'Enable MFA for email and admin roles first; expand to all apps.',
  'Deploy EDR on All Devices': 'Deploy EDR to every endpoint; review detections weekly.',
  'Implement Immutable Backups': 'Add immutable copies; test a full restore quarterly.',
  'Adopt a Password Manager': 'Roll out org vault; enforce unique+long passphrases.',
  'Same-Day Account Off-boarding': 'Automate account disablement on last workday.',
  'Segment Your Wi-Fi': 'Separate staff/guest/IoT SSIDs; block east-west traffic.',
  'Run Phishing Simulations': 'Quarterly sims; add a one-click "Report Phish".',
  'Write an Incident Response Plan': 'Name roles, contacts, playbooks; rehearse twice a year.',
  'Centralize SSO+MFA for SaaS': 'Centralize auth; force MFA on critical apps.',
  'Quarterly App Access Reviews': 'Quarterly entitlements review; remove stale access.',
  'Least-Privilege Admin Roles': 'Scoped admin roles; break-glass with alerts.',
  'SPF/DKIM/DMARC Setup': 'Pass SPF/DKIM; move DMARC to reject; review reports.',
  'Microsoft 365 Hardening': 'Conditional Access; Safe Links/Attachments; kill legacy auth.',
  'TLS/HSTS+Security Headers': 'Force HTTPS; add HSTS; apply baseline headers.',
  'Centralized Logs+Alerts': 'Centralize logs; add alert playbooks; on-call coverage.',
  'RPO/RTO+DR Testing': 'Define targets; schedule DR restores with timings.',
};

// Canada baseline checklist (10 items from core)
export const canadaBaseline = [
  'Multi-factor authentication on email and admin accounts',
  'Company-wide password manager with policies',
  'Automatic device patching and full-disk encryption',
  'EDR/Next-Gen antivirus on all endpoints',
  'Network segmentation (staff, guest, IoT)',
  'Quarterly phishing simulations and training',
  '"Report phishing" button available to all staff',
  'Daily backups including immutable/offline copies',
  'Documented restore testing (every 6 months)',
  'Written Incident Response plan with emergency contacts',
];