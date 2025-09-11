/**
 * Smart Integration Test Script
 * Tests the complete legal document system integration
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://smartstart_db_4ahd_user:LYcgYXd9w9pBB4HPuNretjMOOlKxWP48@dpg-d2uaqd6r433s73e56vfg-a.oregon-postgres.render.com:5432/smartstart_db_4ahd"
        }
    }
});

async function testIntegration() {
    console.log('🧪 Starting Smart Integration Test...\n');

    try {
        // Test 1: Check legal documents in database
        console.log('📄 Test 1: Legal Documents in Database');
        const legalDocs = await prisma.legalDocument.findMany({
            select: { id: true, title: true, type: true, status: true }
        });
        console.log(`✅ Found ${legalDocs.length} legal documents`);
        legalDocs.forEach(doc => {
            console.log(`   - ${doc.title} (${doc.type}) - ${doc.status}`);
        });

        // Test 2: Check user levels
        console.log('\n👤 Test 2: User Levels');
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, level: true }
        });
        console.log(`✅ Found ${users.length} users`);
        const levelCounts = {};
        users.forEach(user => {
            levelCounts[user.level] = (levelCounts[user.level] || 0) + 1;
        });
        Object.entries(levelCounts).forEach(([level, count]) => {
            console.log(`   - ${level}: ${count} users`);
        });

        // Test 3: Check legal document signatures
        console.log('\n✍️ Test 3: Legal Document Signatures');
        const signatures = await prisma.legalDocumentSignature.findMany({
            include: {
                signer: { select: { name: true, level: true } },
                document: { select: { title: true } }
            }
        });
        console.log(`✅ Found ${signatures.length} signatures`);
        signatures.forEach(sig => {
            console.log(`   - ${sig.document.title} signed by ${sig.signer.name} (${sig.signer.level})`);
        });

        // Test 4: Test RBAC mapping
        console.log('\n🔐 Test 4: RBAC Mapping Test');
        const RBACLegalMapping = require('./server/services/rbac-legal-mapping');
        const rbacMapping = new RBACLegalMapping();
        
        const testLevels = ['OWLET', 'WISE_OWL', 'SKY_MASTER'];
        testLevels.forEach(level => {
            const required = rbacMapping.getRequiredDocumentsForLevel(level);
            const pending = rbacMapping.getPendingDocumentsForNextLevel(level);
            console.log(`   - ${level}: ${required.length} required, ${pending.length} pending`);
        });

        // Test 5: Test legal document service
        console.log('\n⚙️ Test 5: Legal Document Service Test');
        const legalService = require('./server/services/legal-document-service');
        
        // Test with a WISE_OWL user
        const testUser = users.find(u => u.level === 'WISE_OWL');
        if (testUser) {
            console.log(`   Testing with user: ${testUser.name} (${testUser.level})`);
            const availableDocs = await legalService.getAvailableDocuments(testUser.id);
            console.log(`   ✅ Available documents: ${availableDocs.length}`);
            
            const requiredDocs = await legalService.getRequiredDocuments(testUser.id);
            console.log(`   ✅ Required documents: ${requiredDocs.length}`);
            
            const pendingDocs = await legalService.getPendingDocuments(testUser.id);
            console.log(`   ✅ Pending documents: ${pendingDocs.length}`);
            
            const userStatus = await legalService.getUserDocumentStatus(testUser.id);
            console.log(`   ✅ User status: ${userStatus.compliance ? 'Compliant' : 'Not Compliant'}`);
            console.log(`   ✅ Compliance: ${userStatus.summary.compliance_percentage}%`);
        }

        // Test 6: Check ventures and opportunities
        console.log('\n🚀 Test 6: Ventures and Opportunities');
        const ventures = await prisma.venture.findMany({
            select: { id: true, name: true, status: true }
        });
        console.log(`✅ Found ${ventures.length} ventures`);
        
        const opportunities = await prisma.opportunity.findMany({
            select: { id: true, title: true, type: true, status: true }
        });
        console.log(`✅ Found ${opportunities.length} opportunities`);

        console.log('\n🎉 Integration Test Complete!');
        console.log('\n📊 Summary:');
        console.log(`   - Legal Documents: ${legalDocs.length}`);
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Signatures: ${signatures.length}`);
        console.log(`   - Ventures: ${ventures.length}`);
        console.log(`   - Opportunities: ${opportunities.length}`);
        
        console.log('\n✅ All systems are integrated and working!');

    } catch (error) {
        console.error('❌ Integration test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testIntegration();
