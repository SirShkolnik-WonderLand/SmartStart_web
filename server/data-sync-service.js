#!/usr/bin/env node

/**
 * SmartStart Data Synchronization Service
 * Ensures data consistency across all systems in real-time
 */

const eventSystem = require('./event-system');
const messageQueue = require('./message-queue');
const { PrismaClient } = require('@prisma/client');

class SmartStartDataSyncService {
    constructor(options = {}) {
        this.prisma = new PrismaClient();
        this.syncRules = new Map();
        this.syncQueue = new Map(); // entityType -> Set of pending syncs
        this.conflictResolution = options.conflictResolution || 'timestamp';
        this.batchSize = options.batchSize || 100;
        this.syncInterval = options.syncInterval || 5000; // 5 seconds

        this.setupSyncRules();
        this.setupEventHandlers();
        this.startSyncProcessor();
    }

    setupSyncRules() {
        // Define synchronization rules for each entity type
        const rules = [{
                entityType: 'user',
                primaryKey: 'id',
                syncFields: ['name', 'email', 'role', 'status', 'updatedAt'],
                dependencies: ['account', 'userProfile', 'userConnection'],
                triggers: ['user.created', 'user.updated', 'user.deleted']
            },
            {
                entityType: 'venture',
                primaryKey: 'id',
                syncFields: ['name', 'description', 'status', 'stage', 'updatedAt'],
                dependencies: ['ventureMember', 'ventureDocument', 'ventureMilestone'],
                triggers: ['venture.created', 'venture.updated', 'venture.deleted']
            },
            {
                entityType: 'team',
                primaryKey: 'id',
                syncFields: ['name', 'description', 'status', 'updatedAt'],
                dependencies: ['teamMember', 'teamGoal', 'teamProject'],
                triggers: ['team.created', 'team.updated', 'team.deleted']
            },
            {
                entityType: 'buzToken',
                primaryKey: 'id',
                syncFields: ['balance', 'staked', 'available', 'updatedAt'],
                dependencies: ['buzTransaction', 'buzReward'],
                triggers: ['buz.transaction', 'buz.award', 'buz.spend']
            },
            {
                entityType: 'legalDocument',
                primaryKey: 'id',
                syncFields: ['name', 'status', 'signedAt', 'updatedAt'],
                dependencies: ['documentSignature', 'legalPack'],
                triggers: ['legal.document.signed', 'legal.document.updated']
            },
            {
                entityType: 'subscription',
                primaryKey: 'id',
                syncFields: ['planId', 'status', 'nextBillingDate', 'updatedAt'],
                dependencies: ['billingCycle', 'paymentMethod'],
                triggers: ['subscription.created', 'subscription.updated', 'subscription.cancelled']
            }
        ];

        rules.forEach(rule => {
            this.syncRules.set(rule.entityType, rule);
        });
    }

    setupEventHandlers() {
        // Listen for data change events
        const eventTypes = [
            'user.created', 'user.updated', 'user.deleted',
            'venture.created', 'venture.updated', 'venture.deleted',
            'team.created', 'team.updated', 'team.deleted',
            'buz.transaction', 'buz.award', 'buz.spend',
            'legal.document.signed', 'legal.document.updated',
            'subscription.created', 'subscription.updated', 'subscription.cancelled'
        ];

        eventTypes.forEach(eventType => {
            eventSystem.subscribe(eventType, this.handleDataChange.bind(this));
        });
    }

    startSyncProcessor() {
        // Process sync queue every 5 seconds
        setInterval(() => {
            this.processSyncQueue();
        }, this.syncInterval);

        console.log('🔄 Data synchronization service started');
    }

    async handleDataChange(event) {
        try {
            const entityType = this.getEntityTypeFromEvent(event.type);
            if (!entityType) return;

            const rule = this.syncRules.get(entityType);
            if (!rule) return;

            const entityId = event.data.id || event.data.userId || event.data.ventureId;
            if (!entityId) return;

            // Add to sync queue
            this.addToSyncQueue(entityType, entityId, event);

            console.log(`🔄 Data change queued for sync: ${entityType}:${entityId}`);
        } catch (error) {
            console.error('❌ Error handling data change:', error);
        }
    }

    getEntityTypeFromEvent(eventType) {
        const typeMap = {
            'user.created': 'user',
            'user.updated': 'user',
            'user.deleted': 'user',
            'venture.created': 'venture',
            'venture.updated': 'venture',
            'venture.deleted': 'venture',
            'team.created': 'team',
            'team.updated': 'team',
            'team.deleted': 'team',
            'buz.transaction': 'buzToken',
            'buz.award': 'buzToken',
            'buz.spend': 'buzToken',
            'legal.document.signed': 'legalDocument',
            'legal.document.updated': 'legalDocument',
            'subscription.created': 'subscription',
            'subscription.updated': 'subscription',
            'subscription.cancelled': 'subscription'
        };

        return typeMap[eventType];
    }

    addToSyncQueue(entityType, entityId, event) {
        if (!this.syncQueue.has(entityType)) {
            this.syncQueue.set(entityType, new Set());
        }

        this.syncQueue.get(entityType).add({
            entityId,
            event,
            timestamp: new Date(),
            retryCount: 0
        });
    }

    async processSyncQueue() {
        for (const [entityType, syncItems] of this.syncQueue) {
            if (syncItems.size === 0) continue;

            const rule = this.syncRules.get(entityType);
            if (!rule) continue;

            // Process in batches
            const batch = Array.from(syncItems).slice(0, this.batchSize);

            for (const syncItem of batch) {
                try {
                    await this.syncEntity(entityType, syncItem.entityId, rule);
                    syncItems.delete(syncItem);
                } catch (error) {
                    console.error(`❌ Sync failed for ${entityType}:${syncItem.entityId}:`, error);

                    // Retry logic
                    syncItem.retryCount++;
                    if (syncItem.retryCount < 3) {
                        // Re-queue for retry
                        setTimeout(() => {
                            syncItems.add(syncItem);
                        }, 5000 * syncItem.retryCount);
                    } else {
                        // Max retries reached, remove from queue
                        syncItems.delete(syncItem);
                        console.error(`❌ Max retries reached for ${entityType}:${syncItem.entityId}`);
                    }
                }
            }
        }
    }

    async syncEntity(entityType, entityId, rule) {
        try {
            // Get the primary entity data
            const primaryData = await this.getPrimaryEntityData(entityType, entityId);
            if (!primaryData) return;

            // Get dependent entities
            const dependentData = await this.getDependentEntitiesData(entityType, entityId, rule.dependencies);

            // Create sync payload
            const syncPayload = {
                entityType,
                entityId,
                primaryData,
                dependentData,
                timestamp: new Date(),
                version: this.generateVersion(primaryData)
            };

            // Sync to all dependent systems
            await this.syncToSystems(syncPayload);

            // Update sync timestamp
            await this.updateSyncTimestamp(entityType, entityId);

            console.log(`✅ Synced ${entityType}:${entityId}`);
        } catch (error) {
            console.error(`❌ Error syncing ${entityType}:${entityId}:`, error);
            throw error;
        }
    }

    async getPrimaryEntityData(entityType, entityId) {
        try {
            switch (entityType) {
                case 'user':
                    return await this.prisma.user.findUnique({
                        where: { id: entityId },
                        include: {
                            accounts: true,
                            userProfile: true,
                            userConnections: true
                        }
                    });

                case 'venture':
                    return await this.prisma.venture.findUnique({
                        where: { id: entityId },
                        include: {
                            ventureMembers: true,
                            ventureDocuments: true,
                            ventureMilestones: true
                        }
                    });

                case 'team':
                    return await this.prisma.team.findUnique({
                        where: { id: entityId },
                        include: {
                            teamMembers: true,
                            teamGoals: true,
                            teamProjects: true
                        }
                    });

                case 'buzToken':
                    return await this.prisma.bUZToken.findUnique({
                        where: { id: entityId },
                        include: {
                            transactions: true,
                            rewards: true
                        }
                    });

                case 'legalDocument':
                    return await this.prisma.legalDocument.findUnique({
                        where: { id: entityId },
                        include: {
                            signatures: true,
                            legalPacks: true
                        }
                    });

                case 'subscription':
                    return await this.prisma.subscription.findUnique({
                        where: { id: entityId },
                        include: {
                            billingCycles: true,
                            paymentMethods: true
                        }
                    });

                default:
                    return null;
            }
        } catch (error) {
            console.error(`❌ Error getting primary entity data for ${entityType}:${entityId}:`, error);
            return null;
        }
    }

    async getDependentEntitiesData(entityType, entityId, dependencies) {
        const dependentData = {};

        for (const dependency of dependencies) {
            try {
                switch (dependency) {
                    case 'account':
                        dependentData.accounts = await this.prisma.account.findMany({
                            where: { userId: entityId }
                        });
                        break;

                    case 'userProfile':
                        dependentData.userProfile = await this.prisma.userProfile.findUnique({
                            where: { userId: entityId }
                        });
                        break;

                    case 'ventureMember':
                        dependentData.ventureMembers = await this.prisma.ventureMember.findMany({
                            where: { ventureId: entityId }
                        });
                        break;

                    case 'buzTransaction':
                        dependentData.transactions = await this.prisma.bUZTransaction.findMany({
                            where: { userId: entityId },
                            orderBy: { createdAt: 'desc' },
                            take: 50 // Limit to recent transactions
                        });
                        break;

                        // Add more dependency mappings as needed
                }
            } catch (error) {
                console.error(`❌ Error getting dependent data for ${dependency}:`, error);
            }
        }

        return dependentData;
    }

    async syncToSystems(syncPayload) {
        // Sync to WebSocket system for real-time updates
        await this.syncToWebSocket(syncPayload);

        // Sync to analytics system
        await this.syncToAnalytics(syncPayload);

        // Sync to external systems (if configured)
        await this.syncToExternalSystems(syncPayload);

        // Publish sync event
        eventSystem.publishEvent('data.sync.completed', {
            entityType: syncPayload.entityType,
            entityId: syncPayload.entityId,
            timestamp: syncPayload.timestamp
        });
    }

    async syncToWebSocket(syncPayload) {
        try {
            // Send real-time update to connected clients
            eventSystem.publishEvent('websocket.data.update', {
                type: 'DATA_SYNC',
                entityType: syncPayload.entityType,
                entityId: syncPayload.entityId,
                data: syncPayload.primaryData,
                timestamp: syncPayload.timestamp
            });
        } catch (error) {
            console.error('❌ Error syncing to WebSocket:', error);
        }
    }

    async syncToAnalytics(syncPayload) {
        try {
            // Queue analytics job
            await messageQueue.addJob('analytics', {
                type: 'DATA_SYNC',
                entityType: syncPayload.entityType,
                entityId: syncPayload.entityId,
                data: syncPayload.primaryData,
                timestamp: syncPayload.timestamp
            });
        } catch (error) {
            console.error('❌ Error syncing to analytics:', error);
        }
    }

    async syncToExternalSystems(syncPayload) {
        try {
            // Sync to external systems (CRM, accounting, etc.)
            // This would be implemented based on specific integrations
            console.log(`🔄 Syncing ${syncPayload.entityType}:${syncPayload.entityId} to external systems`);
        } catch (error) {
            console.error('❌ Error syncing to external systems:', error);
        }
    }

    async updateSyncTimestamp(entityType, entityId) {
        try {
            // Update the last sync timestamp for this entity
            await this.prisma.syncLog.upsert({
                where: {
                    entityType_entityId: {
                        entityType,
                        entityId
                    }
                },
                update: {
                    lastSyncedAt: new Date(),
                    syncCount: { increment: 1 }
                },
                create: {
                    entityType,
                    entityId,
                    lastSyncedAt: new Date(),
                    syncCount: 1
                }
            });
        } catch (error) {
            console.error('❌ Error updating sync timestamp:', error);
        }
    }

    generateVersion(data) {
        // Generate a version hash based on the data
        const dataString = JSON.stringify(data, Object.keys(data).sort());
        return require('crypto')
            .createHash('md5')
            .update(dataString)
            .digest('hex')
            .substring(0, 8);
    }

    // Conflict Resolution
    async resolveConflict(entityType, entityId, localData, remoteData) {
        switch (this.conflictResolution) {
            case 'timestamp':
                return localData.updatedAt > remoteData.updatedAt ? localData : remoteData;

            case 'version':
                return localData.version > remoteData.version ? localData : remoteData;

            case 'manual':
                // Queue for manual resolution
                await messageQueue.addJob('conflict-resolution', {
                    entityType,
                    entityId,
                    localData,
                    remoteData,
                    timestamp: new Date()
                });
                return localData; // Use local as default

            default:
                return localData;
        }
    }

    // Manual Sync Operations
    async syncAllEntities(entityType) {
        try {
            const rule = this.syncRules.get(entityType);
            if (!rule) throw new Error(`No sync rule found for ${entityType}`);

            const entities = await this.getAllEntities(entityType);

            for (const entity of entities) {
                await this.syncEntity(entityType, entity.id, rule);
            }

            console.log(`✅ Synced all ${entityType} entities`);
        } catch (error) {
            console.error(`❌ Error syncing all ${entityType} entities:`, error);
            throw error;
        }
    }

    async getAllEntities(entityType) {
        try {
            switch (entityType) {
                case 'user':
                    return await this.prisma.user.findMany();
                case 'venture':
                    return await this.prisma.venture.findMany();
                case 'team':
                    return await this.prisma.team.findMany();
                case 'buzToken':
                    return await this.prisma.bUZToken.findMany();
                case 'legalDocument':
                    return await this.prisma.legalDocument.findMany();
                case 'subscription':
                    return await this.prisma.subscription.findMany();
                default:
                    return [];
            }
        } catch (error) {
            console.error(`❌ Error getting all ${entityType} entities:`, error);
            return [];
        }
    }

    // Health Check
    async getSyncStatus() {
        try {
            const status = {
                totalRules: this.syncRules.size,
                queueSizes: {},
                lastSync: {},
                health: 'healthy'
            };

            // Get queue sizes
            for (const [entityType, queue] of this.syncQueue) {
                status.queueSizes[entityType] = queue.size;
            }

            // Get last sync times
            const syncLogs = await this.prisma.syncLog.findMany({
                orderBy: { lastSyncedAt: 'desc' },
                take: 10
            });

            status.lastSync = syncLogs.reduce((acc, log) => {
                acc[`${log.entityType}:${log.entityId}`] = log.lastSyncedAt;
                return acc;
            }, {});

            return status;
        } catch (error) {
            console.error('❌ Error getting sync status:', error);
            return { health: 'unhealthy', error: error.message };
        }
    }

    // Cleanup
    async destroy() {
        try {
            await this.prisma.$disconnect();
            console.log('✅ Data sync service destroyed');
        } catch (error) {
            console.error('❌ Error destroying data sync service:', error);
        }
    }
}

// Create singleton instance
const dataSyncService = new SmartStartDataSyncService({
    conflictResolution: 'timestamp',
    batchSize: 100,
    syncInterval: 5000
});

module.exports = dataSyncService;