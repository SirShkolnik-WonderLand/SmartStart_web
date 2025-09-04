#!/usr/bin/env node

/**
 * Fix GateType enum in production database
 * This script updates the CONTRACT gate type to a valid enum value
 */

const { PrismaClient } = require('@prisma/client');

async function fixGateTypeEnum() {
    const prisma = new PrismaClient();

    try {
        console.log('🔧 Fixing GateType enum in database...');

        // Find all gates with CONTRACT type
        const contractGates = await prisma.journeyGate.findMany({
            where: {
                gateType: 'CONTRACT'
            }
        });

        console.log(`Found ${contractGates.length} gates with CONTRACT type`);

        if (contractGates.length > 0) {
            // Update CONTRACT gates to LEGAL_PACK (most similar)
            const updateResult = await prisma.journeyGate.updateMany({
                where: {
                    gateType: 'CONTRACT'
                },
                data: {
                    gateType: 'LEGAL_PACK'
                }
            });

            console.log(`✅ Updated ${updateResult.count} gates from CONTRACT to LEGAL_PACK`);
        }

        // Test the journey stages endpoint
        const stages = await prisma.journeyStage.findMany({
            where: { isActive: true },
            include: {
                gates: {
                    where: { isActive: true }
                }
            },
            orderBy: { order: 'asc' }
        });

        console.log(`✅ Successfully fetched ${stages.length} journey stages`);
        console.log('🎉 GateType enum fix completed successfully!');

    } catch (error) {
        console.error('❌ Error fixing GateType enum:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the fix
if (require.main === module) {
    fixGateTypeEnum()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { fixGateTypeEnum };