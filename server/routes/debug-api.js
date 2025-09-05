const express = require('express');
const router = express.Router();

// Debug endpoint to check database connection
router.get('/database-info', async(req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        // Check if KYC table exists
        const kycTables = await prisma.$queryRaw `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%Kyc%'
    `;

        // Check if MFA table exists
        const mfaTables = await prisma.$queryRaw `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%Mfa%'
    `;

        res.json({
            success: true,
            databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
            kycTables: kycTables,
            mfaTables: mfaTables,
            timestamp: new Date().toISOString()
        });

        await prisma.$disconnect();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
        });
    }
});

module.exports = router;