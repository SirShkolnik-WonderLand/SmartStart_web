/**
 * Global Test Teardown
 * Runs once after all tests complete
 */

const { PrismaClient } = require('@prisma/client');

module.exports = async () => {
  console.log('🧹 Cleaning up global test environment...');
  
  const prisma = new PrismaClient();
  
  try {
    // Connect to test database
    await prisma.$connect();
    
    // Clean up all test data
    await cleanupTestData(prisma);
    
    console.log('✅ Global test cleanup completed');
    
  } catch (error) {
    console.error('❌ Global test cleanup failed:', error);
    // Don't throw error to avoid masking test failures
  } finally {
    await prisma.$disconnect();
  }
};

async function cleanupTestData(prisma) {
  try {
    console.log('🗑️ Cleaning up test data...');
    
    // Clean up in reverse order of dependencies
    const cleanupOperations = [
      // Clean up document signatures
      () => prisma.documentSignature.deleteMany({
        where: {
          OR: [
            { user_id: { startsWith: 'test-' } },
            { document_id: { startsWith: 'test-' } }
          ]
        }
      }),
      
      // Clean up user document status
      () => prisma.userDocumentStatus.deleteMany({
        where: {
          OR: [
            { user_id: { startsWith: 'test-' } },
            { document_id: { startsWith: 'test-' } }
          ]
        }
      }),
      
      // Clean up document audit logs
      () => prisma.documentAuditLog.deleteMany({
        where: {
          OR: [
            { user_id: { startsWith: 'test-' } },
            { document_id: { startsWith: 'test-' } }
          ]
        }
      }),
      
      // Clean up venture management data
      () => prisma.ventureLaunchTimeline.deleteMany({
        where: { ventureId: { startsWith: 'test-' } }
      }),
      
      () => prisma.ventureMilestone.deleteMany({
        where: { timelineId: { startsWith: 'test-' } }
      }),
      
      () => prisma.ventureDailyCheckin.deleteMany({
        where: { ventureId: { startsWith: 'test-' } }
      }),
      
      () => prisma.ventureSprint.deleteMany({
        where: { ventureId: { startsWith: 'test-' } }
      }),
      
      () => prisma.ventureSprintTask.deleteMany({
        where: { sprintId: { startsWith: 'test-' } }
      }),
      
      () => prisma.ventureRisk.deleteMany({
        where: { ventureId: { startsWith: 'test-' } }
      }),
      
      () => prisma.ventureAnalytics.deleteMany({
        where: { ventureId: { startsWith: 'test-' } }
      }),
      
      () => prisma.ventureNotification.deleteMany({
        where: { ventureId: { startsWith: 'test-' } }
      }),
      
      () => prisma.ventureSlackIntegration.deleteMany({
        where: { ventureId: { startsWith: 'test-' } }
      }),
      
      () => prisma.slackMessage.deleteMany({
        where: { ventureId: { startsWith: 'test-' } }
      }),
      
      () => prisma.slackReaction.deleteMany({
        where: { messageId: { startsWith: 'test-' } }
      }),
      
      // Clean up core entities
      () => prisma.venture.deleteMany({
        where: { id: { startsWith: 'test-' } }
      }),
      
      () => prisma.company.deleteMany({
        where: { id: { startsWith: 'test-' } }
      }),
      
      () => prisma.team.deleteMany({
        where: { id: { startsWith: 'test-' } }
      }),
      
      () => prisma.user.deleteMany({
        where: { id: { startsWith: 'test-' } }
      }),
      
      // Clean up legal documents
      () => prisma.legalDocument.deleteMany({
        where: { id: { startsWith: 'test-' } }
      })
    ];
    
    // Execute cleanup operations
    for (const operation of cleanupOperations) {
      try {
        await operation();
      } catch (error) {
        console.warn('⚠️ Cleanup operation failed:', error.message);
      }
    }
    
    console.log('✅ Test data cleanup completed');
    
  } catch (error) {
    console.error('❌ Failed to cleanup test data:', error);
    throw error;
  }
}
