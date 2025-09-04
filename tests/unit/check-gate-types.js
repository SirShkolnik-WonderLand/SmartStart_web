#!/usr/bin/env node

/**
 * Check all gate types in the database
 * This script identifies all gate types that exist in the database
 */

const { PrismaClient } = require('@prisma/client');

async function checkGateTypes() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔍 Checking all gate types in database...');
        
        // Get all gates with their types
        const gates = await prisma.journeyGate.findMany({
            select: {
                id: true,
                name: true,
                gateType: true,
                stageId: true
            }
        });
        
        console.log(`Found ${gates.length} gates total`);
        
        // Group by gate type
        const gateTypes = {};
        gates.forEach(gate => {
            if (!gateTypes[gate.gateType]) {
                gateTypes[gate.gateType] = [];
            }
            gateTypes[gate.gateType].push(gate);
        });
        
        console.log('\n📊 Gate types found in database:');
        Object.keys(gateTypes).forEach(type => {
            console.log(`  - ${type}: ${gateTypes[type].length} gates`);
            gateTypes[type].forEach(gate => {
                console.log(`    * ${gate.name} (${gate.id})`);
            });
        });
        
        // Check which ones are in the enum
        const validEnumTypes = [
            'SUBSCRIPTION', 'LEGAL_PACK', 'NDA', 'CONTRACT', 
            'PAYMENT', 'VERIFICATION', 'PROFILE', 'DOCUMENT', 
            'LAUNCH', 'CUSTOM'
        ];
        
        console.log('\n✅ Valid enum types:');
        validEnumTypes.forEach(type => {
            console.log(`  - ${type}`);
        });
        
        console.log('\n❌ Invalid gate types (not in enum):');
        Object.keys(gateTypes).forEach(type => {
            if (!validEnumTypes.includes(type)) {
                console.log(`  - ${type}: ${gateTypes[type].length} gates`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error checking gate types:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the check
if (require.main === module) {
    checkGateTypes()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { checkGateTypes };
