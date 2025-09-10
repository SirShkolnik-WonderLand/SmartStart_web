# Data Dictionary (Stub)

Canonical reference for tables, fields, types, relationships, and PII tags.

Legend: PII[low|med|high], SEC[secret]

## User
- id: String (pk)
- email: String (unique) PII[high]
- username: String? (unique) PII[med]
- password: String? SEC
- name: String? PII[med]
- firstName: String? PII[med]
- lastName: String? PII[med]
- role: String? (default TEAM_MEMBER)
- createdAt: DateTime
- updatedAt: DateTime
- tenantId: String? (default "default")
- level: Enum(UserLevel)
- xp: Int
- reputation: Int
- status: Enum(UserStatus)
- lastActive: DateTime
- totalPortfolioValue: Float
- activeProjectsCount: Int
- totalContributions: Int
- totalEquityOwned: Float
- averageEquityPerProject: Float
- portfolioDiversity: Int
- lastEquityEarned: DateTime?

Relations: ProfilePrivacy(1:1), subscriptions[], invoices[], payments[], platformLegalPacks[], PlatformNDA[], ESignatureConsent[], projectsOwned[], contributions[], messages[], ... (see Prisma schema)

## ProfilePrivacy
- id: String (pk)
- userId: String (unique, fk User)
- showExactPercToHub: Boolean
- showActivity: Boolean
- showSkills: Boolean
- showReputation: Boolean

## Project
- id: String (pk)
- name: String
- summary: String?
- ownerId: String (fk User)
- createdAt: DateTime
- updatedAt: DateTime
- deletedAt: DateTime?
- tenantId: String?
- totalValue: Float
- activeMembers: Int
- completionRate: Float
- lastActivity: DateTime
- contractVersion: String
- equityModel: Enum(EquityModel)
- vestingSchedule: Enum(VestingSchedule)
- ownerMinPct: Float
- aliceCapPct: Float
- reservePct: Float

Relations: capEntries[], sprints[], tasks[], ideas[], polls[], messages[], contractOffers[], contractSignatures[], equityVesting[], legalEntity?, coop?, legalDocuments[], members[], visibility?, insights[], submission?, equityConversions[], legalHolds[], revenueShares[], opportunities[]

---

Note: This stub will be expanded to cover all models, including legal document entities, billing, opportunities, umbrella, venture management, and audit trails. PII tagging follows `07-security/data_classification_standard.txt`.
