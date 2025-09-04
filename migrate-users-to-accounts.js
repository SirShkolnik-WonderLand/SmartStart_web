const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function migrateUsersToAccounts() {
  try {
    console.log('🔄 Migrating users to Account model...');

    // First, seed permissions and roles if they don't exist
    await seedPermissionsAndRoles();

    // Get all users that don't have accounts
    const usersWithoutAccounts = await prisma.user.findMany({
      where: {
        account: null
      }
    });

    console.log(`Found ${usersWithoutAccounts.length} users without accounts`);

    // Get default role (TEAM_MEMBER)
    const defaultRole = await prisma.role.findUnique({
      where: { name: 'TEAM_MEMBER' }
    });

    if (!defaultRole) {
      throw new Error('Default role TEAM_MEMBER not found. Please run seed-permissions-roles.js first.');
    }

    // Create accounts for users
    for (const user of usersWithoutAccounts) {
      try {
        // Hash password if it exists
        let hashedPassword = null;
        if (user.password) {
          hashedPassword = await bcrypt.hash(user.password, 12);
        }

        // Create account
        const account = await prisma.account.create({
          data: {
            email: user.email,
            password: hashedPassword,
            roleId: defaultRole.id,
            userId: user.id,
            isActive: user.status === 'ACTIVE'
          }
        });

        console.log(`✅ Created account for user: ${user.email} (${user.id})`);
      } catch (error) {
        console.error(`❌ Failed to create account for user ${user.email}:`, error.message);
      }
    }

    // Verify migration
    const totalUsers = await prisma.user.count();
    const totalAccounts = await prisma.account.count();
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`- Total Users: ${totalUsers}`);
    console.log(`- Total Accounts: ${totalAccounts}`);
    console.log(`- Users without accounts: ${totalUsers - totalAccounts}`);

    if (totalUsers === totalAccounts) {
      console.log('✅ All users now have accounts!');
    } else {
      console.log('⚠️ Some users still need accounts');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedPermissionsAndRoles() {
  try {
    // Check if roles already exist
    const existingRoles = await prisma.role.count();
    if (existingRoles > 0) {
      console.log('✅ Roles already exist, skipping seed');
      return;
    }

    console.log('🌱 Seeding permissions and roles...');

    // Create permissions
    const permissions = [
      { name: 'user:read', description: 'Read user information', resource: 'user' },
      { name: 'user:write', description: 'Create and update users', resource: 'user' },
      { name: 'project:read', description: 'Read project information', resource: 'project' },
      { name: 'project:write', description: 'Create and update projects', resource: 'project' },
      { name: 'contract:read', description: 'Read contract information', resource: 'contract' },
      { name: 'contract:write', description: 'Create and update contracts', resource: 'contract' },
      { name: 'document:read', description: 'Read documents', resource: 'document' },
      { name: 'document:write', description: 'Create and update documents', resource: 'document' },
      { name: 'journey:read', description: 'Read journey information', resource: 'journey' },
      { name: 'journey:write', description: 'Update journey state', resource: 'journey' },
    ];

    for (const perm of permissions) {
      await prisma.permission.create({
        data: perm
      });
    }

    // Create basic roles
    const roles = [
      {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with full system access',
        level: 100,
        isSystem: true,
        permissions: permissions.map(p => p.name)
      },
      {
        name: 'ADMIN',
        description: 'System Administrator',
        level: 90,
        isSystem: true,
        permissions: ['user:read', 'user:write', 'project:read', 'project:write', 'contract:read', 'contract:write', 'document:read', 'document:write', 'journey:read', 'journey:write']
      },
      {
        name: 'TEAM_MEMBER',
        description: 'Team Member',
        level: 40,
        isSystem: false,
        permissions: ['user:read', 'project:read', 'contract:read', 'document:read', 'journey:read', 'journey:write']
      }
    ];

    for (const roleData of roles) {
      const { permissions: rolePermissions, ...roleInfo } = roleData;
      
      const role = await prisma.role.create({
        data: roleInfo
      });

      // Assign permissions to role
      for (const permissionName of rolePermissions) {
        const permission = await prisma.permission.findUnique({
          where: { name: permissionName }
        });

        if (permission) {
          await prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: permission.id
            }
          });
        }
      }
    }

    console.log('✅ Permissions and roles seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding permissions and roles:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  migrateUsersToAccounts()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateUsersToAccounts };
