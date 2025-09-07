/**
 * SmartStart Onboarding Orchestrator
 * Central controller for managing user onboarding journey
 * Integrates with state machines, RBAC, and all platform systems
 */

const { PrismaClient } = require('@prisma/client')
const { interpret } = require('xstate')
const userJourneyMachine = require('../state-machines/user-journey/UserJourneyStateMachine')
const legalStateMachine = require('../state-machines/legal/LegalStateMachine')
const EventEmitter = require('events')

const prisma = new PrismaClient()

class OnboardingOrchestrator extends EventEmitter {
  constructor() {
    super()
    this.userJourneyServices = new Map()
    this.legalServices = new Map()
  }

  /**
   * Initialize user journey for new user
   */
  async initializeUserJourney(userId) {
    try {
      console.log(`🚀 Initializing journey for user: ${userId}`)

      // Create user journey state machine service
      const userJourneyService = interpret(userJourneyMachine.withContext({
        userId,
        currentRbacLevel: 'GUEST',
        targetRbacLevel: 'MEMBER',
        journeyStage: 'ONBOARDING',
        onboardingProgress: 0,
        journeyStartDate: new Date(),
        milestones: [],
        completedMilestones: [],
        achievements: [],
        auditTrail: []
      }))

      this.userJourneyServices.set(userId, userJourneyService)

      // Start the service
      userJourneyService.start()

      // Create initial journey states for all stages
      await this.createInitialJourneyStates(userId)

      // Emit journey started event
      this.emit('journeyStarted', { userId, stage: 'ONBOARDING' })

      return {
        success: true,
        message: 'User journey initialized successfully',
        currentStage: 'ONBOARDING',
        progress: 0
      }

    } catch (error) {
      console.error('Error initializing user journey:', error)
      throw error
    }
  }

  /**
   * Create initial journey states for all stages
   */
  async createInitialJourneyStates(userId) {
    let stages = await prisma.journeyStage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    // If no stages exist, create default ones
    if (stages.length === 0) {
      console.log('⚠️ No journey stages found, creating default stages...')
      
      const defaultStages = [
        {
          name: 'Welcome',
          description: 'Welcome to SmartStart! Complete your profile setup.',
          order: 1,
          isActive: true
        },
        {
          name: 'Profile Setup',
          description: 'Complete your user profile with skills and preferences.',
          order: 2,
          isActive: true
        },
        {
          name: 'Legal Pack',
          description: 'Review and sign the platform legal documents.',
          order: 3,
          isActive: true
        },
        {
          name: 'First Venture',
          description: 'Create your first venture or join an existing one.',
          order: 4,
          isActive: true
        },
        {
          name: 'Team Building',
          description: 'Build your team and start collaborating.',
          order: 5,
          isActive: true
        }
      ]

      for (const stageData of defaultStages) {
        const stage = await prisma.journeyStage.create({
          data: stageData
        })
        stages.push(stage)
      }
      
      console.log(`✅ Created ${defaultStages.length} default journey stages`)
    }

    for (const stage of stages) {
      await prisma.userJourneyState.upsert({
        where: {
          userId_stageId: {
            userId,
            stageId: stage.id
          }
        },
        update: {},
        create: {
          userId,
          stageId: stage.id,
          status: 'NOT_STARTED',
          metadata: {
            stageName: stage.name,
            stageOrder: stage.order,
            initializedAt: new Date().toISOString()
          }
        }
      })
    }

    console.log(`✅ Created initial journey states for user: ${userId}`)
  }

  /**
   * Update journey progress based on completed actions
   */
  async updateJourneyProgress(userId, action, data = {}) {
    try {
      console.log(`📈 Updating journey progress for user: ${userId}, action: ${action}`)

      const userJourneyService = this.userJourneyServices.get(userId)
      if (!userJourneyService) {
        await this.initializeUserJourney(userId)
        return this.updateJourneyProgress(userId, action, data)
      }

      // Send action to state machine
      userJourneyService.send({ type: action, data })

      // Update specific journey stages based on action
      await this.updateSpecificJourneyStage(userId, action, data)

      // Calculate overall progress
      const progress = await this.calculateJourneyProgress(userId)

      // Emit progress update event
      this.emit('progressUpdated', { userId, action, progress, data })

      return {
        success: true,
        message: 'Journey progress updated successfully',
        progress,
        action
      }

    } catch (error) {
      console.error('Error updating journey progress:', error)
      throw error
    }
  }

  /**
   * Update specific journey stage based on action
   */
  async updateSpecificJourneyStage(userId, action, data) {
    const actionStageMap = {
      'PROFILE_COMPLETE': 'Profile Setup',
      'LEGAL_DOCUMENTS_SIGNED': 'Platform Legal Pack',
      'SUBSCRIPTION_ACTIVE': 'Subscription Selection',
      'DASHBOARD_ACCESSED': 'Welcome & Dashboard'
    }

    const stageName = actionStageMap[action]
    if (!stageName) return

    const stage = await prisma.journeyStage.findFirst({
      where: { name: stageName }
    })

    if (stage) {
      await prisma.userJourneyState.update({
        where: {
          userId_stageId: {
            userId,
            stageId: stage.id
          }
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          metadata: {
            ...data,
            completedAt: new Date().toISOString(),
            action
          }
        }
      })

      console.log(`✅ Completed stage: ${stageName} for user: ${userId}`)
    }
  }

  /**
   * Calculate overall journey progress
   */
  async calculateJourneyProgress(userId) {
    const userStates = await prisma.userJourneyState.findMany({
      where: { userId },
      include: { stage: true }
    })

    const totalStages = userStates.length
    const completedStages = userStates.filter(state => state.status === 'COMPLETED').length
    const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0

    return {
      totalStages,
      completedStages,
      percentage,
      stages: userStates.map(state => ({
        name: state.stage.name,
        status: state.status,
        order: state.stage.order
      }))
    }
  }

  /**
   * Get user journey status
   */
  async getUserJourneyStatus(userId) {
    try {
      const progress = await this.calculateJourneyProgress(userId)
      
      const currentStage = await prisma.userJourneyState.findFirst({
        where: {
          userId,
          status: 'IN_PROGRESS'
        },
        include: { stage: true }
      })

      const nextStage = await prisma.userJourneyState.findFirst({
        where: {
          userId,
          status: 'NOT_STARTED'
        },
        include: { stage: true },
        orderBy: { stage: { order: 'asc' } }
      })

      return {
        success: true,
        data: {
          userId,
          progress,
          currentStage: currentStage?.stage || null,
          nextStage: nextStage?.stage || null,
          isComplete: progress.percentage === 100
        }
      }

    } catch (error) {
      console.error('Error getting user journey status:', error)
      throw error
    }
  }

  /**
   * Handle legal document signing
   */
  async handleLegalDocumentSigning(userId, documentId, signatureData) {
    try {
      console.log(`📝 Handling legal document signing for user: ${userId}`)

      // Update journey progress
      await this.updateJourneyProgress(userId, 'LEGAL_DOCUMENTS_SIGNED', {
        documentId,
        signedAt: new Date().toISOString(),
        signatureData
      })

      // Check if all legal documents are signed
      const legalPackStatus = await this.checkLegalPackCompletion(userId)
      
      if (legalPackStatus.allSigned) {
        // Move to next stage
        await this.updateJourneyProgress(userId, 'LEGAL_PACK_COMPLETE', {
          completedAt: new Date().toISOString(),
          allDocumentsSigned: true
        })
      }

      return {
        success: true,
        message: 'Legal document signing processed',
        legalPackStatus
      }

    } catch (error) {
      console.error('Error handling legal document signing:', error)
      throw error
    }
  }

  /**
   * Check legal pack completion status
   */
  async checkLegalPackCompletion(userId) {
    const legalPacks = await prisma.platformLegalPack.findMany({
      where: { userId },
      include: { documents: true }
    })

    let totalDocuments = 0
    let signedDocuments = 0

    for (const pack of legalPacks) {
      for (const doc of pack.documents) {
        totalDocuments++
        if (doc.status === 'effective' || doc.signatureCount > 0) {
          signedDocuments++
        }
      }
    }

    return {
      totalDocuments,
      signedDocuments,
      allSigned: totalDocuments > 0 && signedDocuments === totalDocuments,
      percentage: totalDocuments > 0 ? Math.round((signedDocuments / totalDocuments) * 100) : 0
    }
  }

  /**
   * Handle subscription activation
   */
  async handleSubscriptionActivation(userId, subscriptionData) {
    try {
      console.log(`💳 Handling subscription activation for user: ${userId}`)

      // Update journey progress
      await this.updateJourneyProgress(userId, 'SUBSCRIPTION_ACTIVE', {
        ...subscriptionData,
        activatedAt: new Date().toISOString()
      })

      // Update user RBAC level if needed
      await this.updateUserRBACLevel(userId, 'SUBSCRIBER')

      return {
        success: true,
        message: 'Subscription activation processed',
        subscriptionData
      }

    } catch (error) {
      console.error('Error handling subscription activation:', error)
      throw error
    }
  }

  /**
   * Update user RBAC level
   */
  async updateUserRBACLevel(userId, newLevel) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { role: newLevel }
      })

      console.log(`✅ Updated RBAC level for user ${userId} to ${newLevel}`)
    } catch (error) {
      console.error('Error updating RBAC level:', error)
    }
  }

  /**
   * Get onboarding recommendations
   */
  async getOnboardingRecommendations(userId) {
    try {
      const status = await this.getUserJourneyStatus(userId)
      const recommendations = []

      if (!status.data.currentStage) {
        recommendations.push({
          type: 'start_journey',
          title: 'Start Your Journey',
          description: 'Begin your SmartStart platform journey',
          action: 'initialize_journey',
          priority: 'high'
        })
      }

      if (status.data.progress.percentage < 50) {
        recommendations.push({
          type: 'complete_profile',
          title: 'Complete Your Profile',
          description: 'Add skills, experience, and portfolio information',
          action: 'update_profile',
          priority: 'medium'
        })
      }

      if (status.data.progress.percentage >= 50 && status.data.progress.percentage < 100) {
        recommendations.push({
          type: 'subscribe',
          title: 'Unlock Full Features',
          description: 'Subscribe to access all platform features',
          action: 'subscribe',
          priority: 'high'
        })
      }

      return {
        success: true,
        data: {
          recommendations,
          currentProgress: status.data.progress
        }
      }

    } catch (error) {
      console.error('Error getting onboarding recommendations:', error)
      throw error
    }
  }

  /**
   * Cleanup user journey service
   */
  cleanupUserJourney(userId) {
    const service = this.userJourneyServices.get(userId)
    if (service) {
      service.stop()
      this.userJourneyServices.delete(userId)
    }
  }
}

// Create singleton instance
const onboardingOrchestrator = new OnboardingOrchestrator()

module.exports = onboardingOrchestrator
