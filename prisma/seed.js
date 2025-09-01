const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

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
    { category: 'auth', key: 'session_timeout_hours', value: '24', description: 'Session timeout in hours' },
    { category: 'auth', key: 'max_login_attempts', value: '5', description: 'Maximum login attempts before lockout' },
    { category: 'auth', key: 'lockout_duration_minutes', value: '30', description: 'Account lockout duration in minutes' },
  ]

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { category_key: { category: setting.category, key: setting.key } },
      update: { value: setting.value, description: setting.description },
      create: setting,
    })
  }

  // Create roles with hierarchy
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Full system access and control', level: 100, isSystem: true },
    { name: 'ADMIN', description: 'Administrative access to all features', level: 80, isSystem: true },
    { name: 'OWNER', description: 'Project owner with full project control', level: 60, isSystem: true },
    { name: 'CONTRIBUTOR', description: 'Active project contributor', level: 40, isSystem: true },
    { name: 'MEMBER', description: 'Regular platform member', level: 20, isSystem: true },
    { name: 'VIEWER', description: 'Read-only access', level: 10, isSystem: true },
    { name: 'GUEST', description: 'Limited guest access', level: 5, isSystem: true },
  ]

  const createdRoles = {}
  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, level: role.level, isSystem: role.isSystem },
      create: role,
    })
    createdRoles[role.name] = createdRole
  }

  // Create comprehensive permissions
  const permissions = [
    // User permissions
    { name: 'user:read', description: 'Read user profiles', resource: 'user', action: 'read' },
    { name: 'user:write', description: 'Update user profiles', resource: 'user', action: 'write' },
    { name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete' },
    { name: 'user:admin', description: 'Full user management', resource: 'user', action: 'admin' },
    
    // Project permissions
    { name: 'project:read', description: 'Read project details', resource: 'project', action: 'read' },
    { name: 'project:write', description: 'Update project details', resource: 'project', action: 'write' },
    { name: 'project:delete', description: 'Delete projects', resource: 'project', action: 'delete' },
    { name: 'project:admin', description: 'Full project management', resource: 'project', action: 'admin' },
    
    // Equity permissions
    { name: 'equity:read', description: 'Read equity information', resource: 'equity', action: 'read' },
    { name: 'equity:write', description: 'Update equity allocations', resource: 'equity', action: 'write' },
    { name: 'equity:admin', description: 'Full equity management', resource: 'equity', action: 'admin' },
    
    // Contract permissions
    { name: 'contract:read', description: 'Read contracts', resource: 'contract', action: 'read' },
    { name: 'contract:write', description: 'Create and update contracts', resource: 'contract', action: 'write' },
    { name: 'contract:sign', description: 'Sign contracts', resource: 'contract', action: 'sign' },
    { name: 'contract:admin', description: 'Full contract management', resource: 'contract', action: 'admin' },
    
    // System permissions
    { name: 'system:read', description: 'Read system settings', resource: 'system', action: 'read' },
    { name: 'system:write', description: 'Update system settings', resource: 'system', action: 'write' },
    { name: 'system:admin', description: 'Full system administration', resource: 'system', action: 'admin' },
  ]

  const createdPermissions = {}
  for (const permission of permissions) {
    const createdPermission = await prisma.permission.upsert({
      where: { name: permission.name },
      update: { description: permission.description, resource: permission.resource, action: permission.action },
      create: permission,
    })
    createdPermissions[permission.name] = createdPermission
  }

  // Assign permissions to roles
  const rolePermissions = {
    'SUPER_ADMIN': Object.keys(createdPermissions), // All permissions
    'ADMIN': [
      'user:read', 'user:write', 'user:admin',
      'project:read', 'project:write', 'project:admin',
      'equity:read', 'equity:write', 'equity:admin',
      'contract:read', 'contract:write', 'contract:admin',
      'system:read', 'system:write'
    ],
    'OWNER': [
      'user:read', 'user:write',
      'project:read', 'project:write', 'project:admin',
      'equity:read', 'equity:write',
      'contract:read', 'contract:write', 'contract:sign'
    ],
    'CONTRIBUTOR': [
      'user:read',
      'project:read', 'project:write',
      'equity:read',
      'contract:read', 'contract:sign'
    ],
    'MEMBER': [
      'user:read',
      'project:read',
      'equity:read',
      'contract:read'
    ],
    'VIEWER': [
      'user:read',
      'project:read'
    ],
    'GUEST': [
      'user:read'
    ]
  }

  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    const role = createdRoles[roleName]
    for (const permissionName of permissionNames) {
      const permission = createdPermissions[permissionName]
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
          grantedBy: 'system'
        }
      })
    }
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

  // Create enhanced users with proper accounts
  const users = [
    {
      name: 'Admin User',
      email: 'admin@smartstart.com',
      password: 'admin123',
      roleName: 'SUPER_ADMIN',
      level: 'WISE_OWL',
      xp: 250
    },
    {
      name: 'Regular User',
      email: 'user@smartstart.com',
      password: 'user123',
      roleName: 'MEMBER',
      level: 'WISE_OWL',
      xp: 250
    },
    {
      name: 'Demo Owner',
      email: 'owner@demo.local',
      password: 'owner123',
      roleName: 'OWNER',
      level: 'WISE_OWL',
      xp: 250
    },
    {
      name: 'Demo Contributor',
      email: 'contrib@demo.local',
      password: 'contrib123',
      roleName: 'CONTRIBUTOR',
      level: 'WISE_OWL',
      xp: 250
    },
    {
      name: 'Brian Johnson',
      email: 'brian@smartstart.com',
      password: 'brian123',
      roleName: 'MEMBER',
      level: 'WISE_OWL',
      xp: 180
    }
  ]

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        level: userData.level,
        xp: userData.xp
      },
      create: {
        name: userData.name,
        email: userData.email,
        level: userData.level,
        xp: userData.xp
      }
    })

    await prisma.account.upsert({
      where: { userId: user.id },
      update: {
        email: userData.email,
        password: hashedPassword,
        roleId: createdRoles[userData.roleName].id,
        isActive: true
      },
      create: {
        email: userData.email,
        password: hashedPassword,
        roleId: createdRoles[userData.roleName].id,
        userId: user.id,
        isActive: true
      }
    })
  }

  console.log('✅ Database seed completed successfully!')
}

// Export the main function for use in API
async function runSeed() {
  try {
    await main();
    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { runSeed };

// Run if called directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Error during seeding:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
