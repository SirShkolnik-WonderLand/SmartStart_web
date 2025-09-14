#!/usr/bin/env node

/**
 * SmartStart Data Synchronization API Endpoints
 * RESTful API for managing data synchronization across systems
 */

const express = require('express');
const dataSyncService = require('./data-sync-service');
const eventSystem = require('./event-system');

const router = express.Router();

// Middleware for authentication and validation
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // In a real implementation, this would validate the JWT token
    req.user = { id: 'user-123', email: 'user@example.com', name: 'Test User' };
    next();
};

// Get sync status
router.get('/status', authenticateUser, async(req, res) => {
    try {
        const status = await dataSyncService.getSyncStatus();
        res.json({
            success: true,
            status: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get sync rules
router.get('/rules', authenticateUser, (req, res) => {
    try {
        const rules = Array.from(dataSyncService.syncRules.values());
        res.json({
            success: true,
            rules: rules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get sync queue status
router.get('/queue', authenticateUser, (req, res) => {
    try {
        const queueStatus = {};
        for (const [entityType, queue] of dataSyncService.syncQueue) {
            queueStatus[entityType] = {
                size: queue.size,
                items: Array.from(queue).map(item => ({
                    entityId: item.entityId,
                    timestamp: item.timestamp,
                    retryCount: item.retryCount
                }))
            };
        }

        res.json({
            success: true,
            queue: queueStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Manual sync for specific entity
router.post('/sync/:entityType/:entityId', authenticateUser, async(req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const rule = dataSyncService.syncRules.get(entityType);

        if (!rule) {
            return res.status(400).json({
                success: false,
                error: `No sync rule found for entity type: ${entityType}`
            });
        }

        await dataSyncService.syncEntity(entityType, entityId, rule);

        res.json({
            success: true,
            message: `Entity ${entityType}:${entityId} synced successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Sync all entities of a specific type
router.post('/sync/:entityType', authenticateUser, async(req, res) => {
    try {
        const { entityType } = req.params;
        const { force = false } = req.body;

        if (force) {
            // Force sync all entities
            await dataSyncService.syncAllEntities(entityType);
        } else {
            // Add to sync queue
            const entities = await dataSyncService.getAllEntities(entityType);
            for (const entity of entities) {
                dataSyncService.addToSyncQueue(entityType, entity.id, {
                    type: 'manual.sync',
                    data: { entityId: entity.id }
                });
            }
        }

        res.json({
            success: true,
            message: `Sync initiated for all ${entityType} entities`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get sync history for an entity
router.get('/history/:entityType/:entityId', authenticateUser, async(req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const { limit = 50 } = req.query;

        // This would query the sync log from database
        // For now, return mock data
        const history = [{
            id: 'sync-1',
            entityType,
            entityId,
            lastSyncedAt: new Date().toISOString(),
            syncCount: 5,
            status: 'success'
        }];

        res.json({
            success: true,
            history: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Resolve sync conflict
router.post('/conflict/:conflictId/resolve', authenticateUser, async(req, res) => {
    try {
        const { conflictId } = req.params;
        const { resolution, data } = req.body;

        // This would resolve the conflict in the database
        // For now, return success
        res.json({
            success: true,
            message: `Conflict ${conflictId} resolved with ${resolution} strategy`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get sync conflicts
router.get('/conflicts', authenticateUser, async(req, res) => {
    try {
        const { entityType, status = 'pending' } = req.query;

        // This would query conflicts from database
        // For now, return mock data
        const conflicts = [{
            id: 'conflict-1',
            entityType: 'user',
            entityId: 'user-123',
            localData: { name: 'John Doe', updatedAt: '2025-09-14T10:00:00Z' },
            remoteData: { name: 'John Smith', updatedAt: '2025-09-14T09:30:00Z' },
            resolution: null,
            createdAt: new Date().toISOString()
        }];

        res.json({
            success: true,
            conflicts: conflicts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Force sync all systems
router.post('/sync-all', authenticateUser, async(req, res) => {
    try {
        const { entityTypes = [] } = req.body;

        if (entityTypes.length === 0) {
            // Sync all entity types
            const allTypes = Array.from(dataSyncService.syncRules.keys());
            for (const entityType of allTypes) {
                await dataSyncService.syncAllEntities(entityType);
            }
        } else {
            // Sync specific entity types
            for (const entityType of entityTypes) {
                await dataSyncService.syncAllEntities(entityType);
            }
        }

        res.json({
            success: true,
            message: 'All systems synced successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get sync metrics
router.get('/metrics', authenticateUser, async(req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // This would query sync metrics from database
        // For now, return mock data
        const metrics = {
            totalSyncs: 1250,
            successfulSyncs: 1200,
            failedSyncs: 50,
            averageSyncTime: 150, // milliseconds
            syncsByEntityType: {
                user: 400,
                venture: 300,
                team: 250,
                buzToken: 200,
                legalDocument: 100
            },
            syncsByHour: Array.from({ length: 24 }, (_, i) => ({
                hour: i,
                count: Math.floor(Math.random() * 100)
            }))
        };

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    try {
        const status = dataSyncService.getSyncStatus();
        res.json({
            success: true,
            status: 'healthy',
            service: 'data-sync',
            timestamp: new Date().toISOString(),
            details: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message
        });
    }
});

module.exports = router;