#!/usr/bin/env node

/**
 * SmartStart Message Queue Service
 * Handles background tasks and job processing
 */

const Redis = require('ioredis');
const EventEmitter = require('events');

class SmartStartMessageQueue extends EventEmitter {
    constructor(options = {}) {
        super();

        this.redis = options.redis || null;
        this.queues = new Map(); // queueName -> Queue
        this.workers = new Map(); // queueName -> Set of workers
        this.processing = new Set(); // Set of currently processing jobs
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 5000;
        this.concurrency = options.concurrency || 5;

        this.setupRedis();
        this.setupQueues();
    }

    setupRedis() {
        if (this.redis) {
            this.redis.on('connect', () => {
                console.log('🔗 Redis connected for message queue');
                this.startWorkers();
            });

            this.redis.on('error', (err) => {
                console.error('❌ Redis error in message queue:', err);
            });
        }
    }

    setupQueues() {
        // Define queue configurations
        const queueConfigs = {
            'email': {
                concurrency: 3,
                retryAttempts: 3,
                retryDelay: 5000
            },
            'notification': {
                concurrency: 5,
                retryAttempts: 2,
                retryDelay: 2000
            },
            'analytics': {
                concurrency: 2,
                retryAttempts: 1,
                retryDelay: 10000
            },
            'buz-processing': {
                concurrency: 1,
                retryAttempts: 5,
                retryDelay: 3000
            },
            'legal-documents': {
                concurrency: 2,
                retryAttempts: 3,
                retryDelay: 5000
            },
            'venture-setup': {
                concurrency: 1,
                retryAttempts: 2,
                retryDelay: 10000
            }
        };

        // Initialize queues
        Object.keys(queueConfigs).forEach(queueName => {
            this.queues.set(queueName, {
                config: queueConfigs[queueName],
                workers: new Set(),
                processing: 0
            });
        });
    }

    // Job Management
    async addJob(queueName, jobData, options = {}) {
        if (!this.queues.has(queueName)) {
            throw new Error(`Queue ${queueName} does not exist`);
        }

        const job = {
            id: this.generateJobId(),
            queue: queueName,
            data: jobData,
            options: {
                priority: options.priority || 0,
                delay: options.delay || 0,
                attempts: options.attempts || this.queues.get(queueName).config.retryAttempts,
                backoff: options.backoff || 'exponential',
                removeOnComplete: options.removeOnComplete || 100,
                removeOnFail: options.removeOnFail || 50,
                ...options
            },
            createdAt: new Date().toISOString(),
            status: 'waiting'
        };

        // Store job in Redis
        if (this.redis) {
            await this.storeJob(job);
        }

        // Add to processing queue
        await this.enqueueJob(job);

        console.log(`📝 Job added to queue ${queueName}: ${job.id}`);
        return job;
    }

    async storeJob(job) {
        if (!this.redis) return;

        const key = `job:${job.id}`;
        await this.redis.hset(key, {
            id: job.id,
            queue: job.queue,
            data: JSON.stringify(job.data),
            options: JSON.stringify(job.options),
            status: job.status,
            createdAt: job.createdAt,
            attempts: 0,
            processedAt: null,
            completedAt: null,
            failedAt: null,
            error: null
        });

        // Set expiration (24 hours)
        await this.redis.expire(key, 86400);
    }

    async enqueueJob(job) {
        if (!this.redis) return;

        const queueKey = `queue:${job.queue}`;
        const priority = job.options.priority || 0;

        // Use priority score for ordering
        await this.redis.zadd(queueKey, priority, JSON.stringify(job));
    }

    async getJob(jobId) {
        if (!this.redis) return null;

        const key = `job:${jobId}`;
        const jobData = await this.redis.hgetall(key);

        if (Object.keys(jobData).length === 0) {
            return null;
        }

        return {
            id: jobData.id,
            queue: jobData.queue,
            data: JSON.parse(jobData.data),
            options: JSON.parse(jobData.options),
            status: jobData.status,
            createdAt: jobData.createdAt,
            attempts: parseInt(jobData.attempts),
            processedAt: jobData.processedAt,
            completedAt: jobData.completedAt,
            failedAt: jobData.failedAt,
            error: jobData.error
        };
    }

    // Worker Management
    startWorkers() {
        this.queues.forEach((queue, queueName) => {
            this.startQueueWorker(queueName);
        });
    }

    startQueueWorker(queueName) {
        const queue = this.queues.get(queueName);
        if (!queue) return;

        const worker = setInterval(async() => {
            if (queue.processing >= queue.config.concurrency) {
                return; // Max concurrency reached
            }

            const job = await this.getNextJob(queueName);
            if (job) {
                this.processJob(job);
            }
        }, 1000); // Check every second

        queue.workers.add(worker);
        console.log(`👷 Worker started for queue: ${queueName}`);
    }

    async getNextJob(queueName) {
        if (!this.redis) return null;

        const queueKey = `queue:${queueName}`;

        // Get highest priority job
        const jobData = await this.redis.zpopmax(queueKey);
        if (!jobData || jobData.length === 0) {
            return null;
        }

        const job = JSON.parse(jobData[0]);
        return job;
    }

    async processJob(job) {
        const queue = this.queues.get(job.queue);
        if (!queue) return;

        queue.processing++;
        this.processing.add(job.id);

        try {
            // Update job status
            await this.updateJobStatus(job.id, 'processing', {
                processedAt: new Date().toISOString(),
                attempts: (job.attempts || 0) + 1
            });

            // Process the job
            await this.executeJob(job);

            // Mark as completed
            await this.updateJobStatus(job.id, 'completed', {
                completedAt: new Date().toISOString()
            });

            console.log(`✅ Job completed: ${job.id}`);
            this.emit('job.completed', job);

        } catch (error) {
            console.error(`❌ Job failed: ${job.id}`, error);

            const attempts = (job.attempts || 0) + 1;
            const maxAttempts = job.options.attempts || queue.config.retryAttempts;

            if (attempts < maxAttempts) {
                // Retry job
                await this.retryJob(job, error);
            } else {
                // Mark as failed
                await this.updateJobStatus(job.id, 'failed', {
                    failedAt: new Date().toISOString(),
                    error: error.message
                });
                this.emit('job.failed', job, error);
            }
        } finally {
            queue.processing--;
            this.processing.delete(job.id);
        }
    }

    async executeJob(job) {
        // Route job to appropriate handler
        const handler = this.getJobHandler(job.queue);
        if (!handler) {
            throw new Error(`No handler found for queue: ${job.queue}`);
        }

        await handler(job.data, job);
    }

    getJobHandler(queueName) {
        const handlers = {
            'email': this.handleEmailJob.bind(this),
            'notification': this.handleNotificationJob.bind(this),
            'analytics': this.handleAnalyticsJob.bind(this),
            'buz-processing': this.handleBuzProcessingJob.bind(this),
            'legal-documents': this.handleLegalDocumentsJob.bind(this),
            'venture-setup': this.handleVentureSetupJob.bind(this)
        };

        return handlers[queueName];
    }

    // Job Handlers
    async handleEmailJob(data, job) {
        console.log('📧 Processing email job:', data.type);

        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In real implementation, this would send actual emails
        console.log(`📧 Email sent to ${data.to}: ${data.subject}`);
    }

    async handleNotificationJob(data, job) {
        console.log('🔔 Processing notification job:', data.type);

        // Simulate notification processing
        await new Promise(resolve => setTimeout(resolve, 500));

        // In real implementation, this would send actual notifications
        console.log(`🔔 Notification sent to ${data.userId}: ${data.title}`);
    }

    async handleAnalyticsJob(data, job) {
        console.log('📊 Processing analytics job:', data.type);

        // Simulate analytics processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In real implementation, this would process analytics data
        console.log(`📊 Analytics processed for ${data.entityType}: ${data.entityId}`);
    }

    async handleBuzProcessingJob(data, job) {
        console.log('💰 Processing BUZ transaction job:', data.type);

        // Simulate BUZ processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In real implementation, this would process BUZ transactions
        console.log(`💰 BUZ transaction processed: ${data.transactionId}`);
    }

    async handleLegalDocumentsJob(data, job) {
        console.log('⚖️ Processing legal document job:', data.type);

        // Simulate legal document processing
        await new Promise(resolve => setTimeout(resolve, 3000));

        // In real implementation, this would process legal documents
        console.log(`⚖️ Legal document processed: ${data.documentId}`);
    }

    async handleVentureSetupJob(data, job) {
        console.log('🚀 Processing venture setup job:', data.type);

        // Simulate venture setup
        await new Promise(resolve => setTimeout(resolve, 5000));

        // In real implementation, this would set up venture infrastructure
        console.log(`🚀 Venture setup completed: ${data.ventureId}`);
    }

    // Job Status Management
    async updateJobStatus(jobId, status, updates = {}) {
        if (!this.redis) return;

        const key = `job:${jobId}`;
        const updateData = { status, ...updates };

        await this.redis.hset(key, updateData);
    }

    async retryJob(job, error) {
        const delay = this.calculateRetryDelay(job);

        console.log(`🔄 Retrying job ${job.id} in ${delay}ms`);

        setTimeout(async() => {
            await this.enqueueJob(job);
        }, delay);
    }

    calculateRetryDelay(job) {
        const attempts = job.attempts || 0;
        const backoff = job.options.backoff || 'exponential';

        if (backoff === 'exponential') {
            return Math.pow(2, attempts) * this.retryDelay;
        } else if (backoff === 'linear') {
            return attempts * this.retryDelay;
        } else {
            return this.retryDelay;
        }
    }

    // Queue Management
    async getQueueStats(queueName) {
        if (!this.redis) return null;

        const queueKey = `queue:${queueName}`;
        const length = await this.redis.zcard(queueKey);
        const queue = this.queues.get(queueName);

        return {
            name: queueName,
            waiting: length,
            processing: queue.processing,
            completed: 0, // Would need to track this separately
            failed: 0, // Would need to track this separately
            concurrency: queue.config.concurrency
        };
    }

    async getAllQueueStats() {
        const stats = {};

        for (const queueName of this.queues.keys()) {
            stats[queueName] = await this.getQueueStats(queueName);
        }

        return stats;
    }

    // Utility Methods
    generateJobId() {
        return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getStats() {
        return {
            totalQueues: this.queues.size,
            totalProcessing: this.processing.size,
            redisConnected: this.redis ? this.redis.status === 'ready' : false,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        };
    }

    // Cleanup
    async destroy() {
        // Stop all workers
        this.queues.forEach((queue, queueName) => {
            queue.workers.forEach(worker => {
                clearInterval(worker);
            });
            queue.workers.clear();
        });

        if (this.redis) {
            await this.redis.disconnect();
        }

        this.removeAllListeners();
        this.queues.clear();
        this.processing.clear();
    }
}

// Create singleton instance
const messageQueue = new SmartStartMessageQueue({
    redis: process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null,
    maxRetries: 3,
    retryDelay: 5000,
    concurrency: 5
});

module.exports = messageQueue;