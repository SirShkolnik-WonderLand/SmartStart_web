import type { Tier } from './content';

export function getComplianceHint(lastAnswer: number, tier: Tier): string {
  // Q12 (index 11) determines compliance focus
  switch (lastAnswer) {
    case 0:
      // General SMB (PIPEDA)
      return `Meet PIPEDA baseline requirements for Canadian businesses. Consider pursuing ISO 27001 certification to build client trust and demonstrate security maturity.`;
    case 1:
      // Health data (PHIPA / ISO 27799)
      return `Add PHIPA controls for health information protection. ISO 27001 and ISO 27799 (health-specific) certifications are strongly recommended for your sector.`;
    case 2:
      // Enterprise/US clients (ISO 27001 / SOC 2)
      return `Your clients may require ISO 27001 or SOC 2 Type II attestation. You're currently ${tier.toLowerCase()} — consider engaging a compliance advisor to accelerate certification readiness.`;
    default:
      return `Meet PIPEDA baseline requirements. Consider ISO 27001 for enhanced trust.`;
  }
}

export const baselineControls = [
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

