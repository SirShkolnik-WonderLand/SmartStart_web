#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Initialize journey state for a user
async function initializeUserJourney(userId) {
  try {
    console.log(`🚀 Initializing journey for user: ${userId}`);

    // Get the first stage (discover)
    const firstStage = await prisma.journeyStage.findFirst({
      where: { 
        isActive: true,
        order: 1 // First stage
      }
    });

    if (!firstStage) {
      throw new Error('No journey stages found. Please seed the journey stages first.');
    }

    // Check if user already has journey states
    const existingStates = await prisma.userJourneyState.findMany({
      where: { userId }
    });

    if (existingStates.length > 0) {
      console.log(`✅ User ${userId} already has journey states (${existingStates.length} stages)`);
      return existingStates;
    }

    // Create initial journey state for the first stage
    const initialState = await prisma.userJourneyState.create({
      data: {
        userId,
        stageId: firstStage.id,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        metadata: {
          initialized: true,
          initializedAt: new Date().toISOString()
        }
      },
      include: {
        stage: true
      }
    });

    console.log(`✅ Initialized journey for user ${userId} - Stage: ${firstStage.name}`);
    return [initialState];

  } catch (error) {
    console.error(`❌ Error initializing journey for user ${userId}:`, error);
    throw error;
  }
}

// Initialize journey for all users who don't have journey states
async function initializeAllUserJourneys() {
  try {
    console.log('🌱 Initializing journeys for all users...');

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });

    console.log(`📊 Found ${users.length} users`);

    // Get users who don't have journey states
    const usersWithoutJourney = [];
    for (const user of users) {
      const journeyStates = await prisma.userJourneyState.findMany({
        where: { userId: user.id }
      });

      if (journeyStates.length === 0) {
        usersWithoutJourney.push(user);
      }
    }

    console.log(`📊 Found ${usersWithoutJourney.length} users without journey states`);

    // Initialize journey for each user
    for (const user of usersWithoutJourney) {
      await initializeUserJourney(user.id);
    }

    console.log('🎉 All user journeys initialized successfully!');

  } catch (error) {
    console.error('❌ Error initializing user journeys:', error);
    throw error;
  }
}

// Get user's current journey progress
async function getUserJourneyProgress(userId) {
  try {
    // Get all stages
    const stages = await prisma.journeyStage.findMany({
      where: { isActive: true },
      include: {
        gates: true
      },
      orderBy: { order: 'asc' }
    });

    // Get user's journey states
    const userStates = await prisma.userJourneyState.findMany({
      where: { userId },
      include: {
        stage: true
      }
    });

    // Calculate progress
    const totalStages = stages.length;
    const completedStages = userStates.filter(state => state.status === 'COMPLETED').length;
    const inProgressStages = userStates.filter(state => state.status === 'IN_PROGRESS').length;
    const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

    // Find current stage
    const currentStage = userStates.find(state => state.status === 'IN_PROGRESS')?.stage;

    // Find next stage
    const nextStage = stages.find(stage =>
      !userStates.find(state => state.stageId === stage.id && state.status === 'COMPLETED')
    );

    return {
      userId,
      progress: {
        totalStages,
        completedStages,
        inProgressStages,
        percentage
      },
      currentStage,
      nextStage,
      stages: stages.map(stage => {
        const userState = userStates.find(state => state.stageId === stage.id);
        return {
          ...stage,
          userState: userState || null,
          status: userState?.status || 'NOT_STARTED',
          canStart: !userState || userState.status === 'NOT_STARTED',
          canComplete: userState?.status === 'IN_PROGRESS'
        };
      })
    };

  } catch (error) {
    console.error(`❌ Error getting journey progress for user ${userId}:`, error);
    throw error;
  }
}

async function main() {
  try {
    const command = process.argv[2];
    const userId = process.argv[3];

    switch (command) {
      case 'init-user':
        if (!userId) {
          console.error('❌ User ID required for init-user command');
          process.exit(1);
        }
        await initializeUserJourney(userId);
        break;

      case 'init-all':
        await initializeAllUserJourneys();
        break;

      case 'progress':
        if (!userId) {
          console.error('❌ User ID required for progress command');
          process.exit(1);
        }
        const progress = await getUserJourneyProgress(userId);
        console.log('📊 User Journey Progress:', JSON.stringify(progress, null, 2));
        break;

      default:
        console.log('Usage:');
        console.log('  node initialize-user-journey.js init-user <userId>  - Initialize journey for specific user');
        console.log('  node initialize-user-journey.js init-all           - Initialize journey for all users');
        console.log('  node initialize-user-journey.js progress <userId>  - Get user journey progress');
        break;
    }

  } catch (error) {
    console.error('Failed to execute command:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { initializeUserJourney, initializeAllUserJourneys, getUserJourneyProgress };
