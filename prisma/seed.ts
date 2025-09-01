import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create system settings
  const systemSettings = [
    { category: 'equity', key: 'owner_min_percentage', value: '35', description: 'Minimum equity percentage for project owners' },
    { category: 'equity', key: 'alice_cap_percentage', value: '25', description: 'Maximum equity percentage for AliceSolutions' },
    { category: 'equity', key: 'contribution_min_percentage', value: '0.5', description: 'Minimum equity percentage for contributions' },
    { category: 'equity', key: 'contribution_max_percentage', value: '5.0', description: 'Maximum equity percentage for contributions' },
    { category: 'security', key: 'mfa_required', value: 'true', description: 'Whether MFA is required for all users' },
    { category: 'security', key: 'kyc_required', value: 'true', description: 'Whether KYC is required for equity participation' },
    { category: 'governance', key: 'dispute_resolution_days', value: '7', description: 'Number of days for dispute resolution' },
    { category: 'governance', key: 'quarterly_rebalance_enabled', value: 'true', description: 'Whether quarterly equity rebalancing is enabled' },
  ]

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { category_key: { category: setting.category, key: setting.key } },
      update: { value: setting.value, description: setting.description },
      create: setting,
    })
  }

  // Create default skills
  const defaultSkills = [
    { name: 'JavaScript', category: 'engineering', description: 'JavaScript programming language', demand: 5, complexity: 3 },
    { name: 'TypeScript', category: 'engineering', description: 'TypeScript programming language', demand: 5, complexity: 4 },
    { name: 'React', category: 'engineering', description: 'React frontend framework', demand: 5, complexity: 3 },
    { name: 'Node.js', category: 'engineering', description: 'Node.js runtime environment', demand: 5, complexity: 3 },
    { name: 'Prisma', category: 'engineering', description: 'Prisma ORM', demand: 4, complexity: 2 },
    { name: 'PostgreSQL', category: 'engineering', description: 'PostgreSQL database', demand: 4, complexity: 3 },
    { name: 'UI/UX Design', category: 'design', description: 'User interface and experience design', demand: 4, complexity: 4 },
    { name: 'Product Management', category: 'ops', description: 'Product management and strategy', demand: 4, complexity: 4 },
    { name: 'Business Development', category: 'bizdev', description: 'Business development and partnerships', demand: 4, complexity: 3 },
    { name: 'Marketing', category: 'bizdev', description: 'Digital marketing and growth', demand: 4, complexity: 3 },
    { name: 'Legal Compliance', category: 'legal', description: 'Legal and regulatory compliance', demand: 3, complexity: 5 },
    { name: 'Financial Planning', category: 'finance', description: 'Financial planning and analysis', demand: 3, complexity: 4 },
  ]

  for (const skill of defaultSkills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category, description: skill.description, demand: skill.demand, complexity: skill.complexity },
      create: skill,
    })
  }

  // Create default badges
  const defaultBadges = [
    { name: 'First Contribution', description: 'Made your first contribution to a project', icon: '🎯', condition: '{"type": "first_contribution"}', category: 'achievement', rarity: 'COMMON' },
    { name: 'Team Player', description: 'Collaborated on 5+ projects', icon: '🤝', condition: '{"type": "team_collaboration", "count": 5}', category: 'collaboration', rarity: 'UNCOMMON' },
    { name: 'Code Master', description: 'Completed 10+ code contributions', icon: '💻', condition: '{"type": "code_contributions", "count": 10}', category: 'engineering', rarity: 'RARE' },
    { name: 'Design Expert', description: 'Completed 10+ design contributions', icon: '🎨', condition: '{"type": "design_contributions", "count": 10}', category: 'design', rarity: 'RARE' },
    { name: 'Growth Hacker', description: 'Completed 10+ growth contributions', icon: '📈', condition: '{"type": "growth_contributions", "count": 10}', category: 'bizdev', rarity: 'RARE' },
    { name: 'Equity Holder', description: 'Earned equity in a project', icon: '🏆', condition: '{"type": "equity_earned"}', category: 'achievement', rarity: 'EPIC' },
    { name: 'Project Owner', description: 'Own a project with active contributors', icon: '👑', condition: '{"type": "project_owner"}', category: 'leadership', rarity: 'LEGENDARY' },
  ]

  for (const badge of defaultBadges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: { description: badge.description, icon: badge.icon, condition: badge.condition, category: badge.category, rarity: badge.rarity },
      create: badge,
    })
  }

  console.log('✅ Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
