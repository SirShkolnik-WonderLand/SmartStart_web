const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTeamInvitationsTable() {
    try {
        console.log('🔨 Creating Team Invitations table...');

        // Create TeamInvitation table
        await prisma.$executeRaw `
      CREATE TABLE IF NOT EXISTS "TeamInvitation" (
        "id" TEXT NOT NULL,
        "teamId" TEXT NOT NULL,
        "ventureId" TEXT,
        "invitedUserId" TEXT NOT NULL,
        "invitedByUserId" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'MEMBER',
        "permissions" TEXT[] NOT NULL DEFAULT '{}',
        "message" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "acceptedAt" TIMESTAMP(3),
        "declinedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id")
      );
    `;

        // Create indexes
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamInvitation_teamId_idx" ON "TeamInvitation"("teamId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamInvitation_invitedUserId_idx" ON "TeamInvitation"("invitedUserId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamInvitation_invitedByUserId_idx" ON "TeamInvitation"("invitedByUserId");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamInvitation_status_idx" ON "TeamInvitation"("status");`;
        await prisma.$executeRaw `CREATE INDEX IF NOT EXISTS "TeamInvitation_expiresAt_idx" ON "TeamInvitation"("expiresAt");`;

        // Create unique constraint to prevent duplicate pending invitations
        await prisma.$executeRaw `CREATE UNIQUE INDEX IF NOT EXISTS "TeamInvitation_teamId_invitedUserId_pending_key" ON "TeamInvitation"("teamId", "invitedUserId") WHERE "status" = 'pending';`;

        console.log('✅ Team Invitations table created successfully');

        // Add foreign key constraints
        try {
            await prisma.$executeRaw `
        ALTER TABLE "TeamInvitation" 
        ADD CONSTRAINT "TeamInvitation_teamId_fkey" 
        FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE;
      `;
        } catch (error) {
            console.log('Foreign key constraint already exists or failed:', error.message);
        }

        try {
            await prisma.$executeRaw `
        ALTER TABLE "TeamInvitation" 
        ADD CONSTRAINT "TeamInvitation_invitedUserId_fkey" 
        FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE CASCADE;
      `;
        } catch (error) {
            console.log('Foreign key constraint already exists or failed:', error.message);
        }

        try {
            await prisma.$executeRaw `
        ALTER TABLE "TeamInvitation" 
        ADD CONSTRAINT "TeamInvitation_invitedByUserId_fkey" 
        FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE CASCADE;
      `;
        } catch (error) {
            console.log('Foreign key constraint already exists or failed:', error.message);
        }

        console.log('✅ Team Invitations table setup complete');

    } catch (error) {
        console.error('❌ Error creating Team Invitations table:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
if (require.main === module) {
    createTeamInvitationsTable()
        .then(() => {
            console.log('🎉 Team Invitations table migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Team Invitations table migration failed:', error);
            process.exit(1);
        });
}

module.exports = { createTeamInvitationsTable };