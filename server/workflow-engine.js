#!/usr/bin/env node

/**
 * SmartStart Workflow Engine
 * Automated workflows and process automation
 */

const eventSystem = require('./event-system');
const messageQueue = require('./message-queue');
const { PrismaClient } = require('@prisma/client');

class SmartStartWorkflowEngine {
    constructor(options = {}) {
        this.prisma = new PrismaClient();
        this.workflows = new Map();
        this.activeExecutions = new Map();
        this.workflowTemplates = new Map();
        this.executionHistory = new Map();
        this.batchSize = options.batchSize || 100;
        this.processInterval = options.processInterval || 5000; // 5 seconds
        this.maxRetries = options.maxRetries || 3;

        this.setupWorkflowTemplates();
        this.setupEventHandlers();
        this.startWorkflowProcessor();
    }

    setupWorkflowTemplates() {
        const templates = [{
                id: 'user_onboarding',
                name: 'User Onboarding Workflow',
                description: 'Automated user onboarding process',
                triggers: ['user.created'],
                steps: [{
                        id: 'send_welcome_email',
                        type: 'notification',
                        config: {
                            type: 'email',
                            template: 'welcome',
                            delay: 0
                        }
                    },
                    {
                        id: 'create_user_profile',
                        type: 'database',
                        config: {
                            action: 'create',
                            table: 'userProfile',
                            data: {
                                userId: '{{trigger.userId}}',
                                status: 'incomplete'
                            }
                        }
                    },
                    {
                        id: 'assign_default_team',
                        type: 'database',
                        config: {
                            action: 'create',
                            table: 'teamMember',
                            data: {
                                userId: '{{trigger.userId}}',
                                teamId: 'default-team',
                                role: 'member'
                            }
                        }
                    },
                    {
                        id: 'schedule_profile_reminder',
                        type: 'delay',
                        config: {
                            delay: 24 * 60 * 60 * 1000, // 24 hours
                            nextStep: 'send_profile_reminder'
                        }
                    }
                ]
            },
            {
                id: 'venture_creation',
                name: 'Venture Creation Workflow',
                description: 'Automated venture setup process',
                triggers: ['venture.created'],
                steps: [{
                        id: 'create_venture_documents',
                        type: 'database',
                        config: {
                            action: 'create',
                            table: 'legalDocument',
                            data: {
                                ventureId: '{{trigger.ventureId}}',
                                type: 'venture_agreement',
                                status: 'pending'
                            }
                        }
                    },
                    {
                        id: 'notify_team_members',
                        type: 'notification',
                        config: {
                            type: 'in_app',
                            template: 'venture_created',
                            recipients: '{{trigger.teamMembers}}'
                        }
                    },
                    {
                        id: 'create_initial_milestones',
                        type: 'database',
                        config: {
                            action: 'create',
                            table: 'ventureMilestone',
                            data: {
                                ventureId: '{{trigger.ventureId}}',
                                title: 'Initial Setup',
                                description: 'Complete venture setup',
                                status: 'pending'
                            }
                        }
                    }
                ]
            },
            {
                id: 'subscription_renewal',
                name: 'Subscription Renewal Workflow',
                description: 'Automated subscription renewal process',
                triggers: ['subscription.renewal_due'],
                steps: [{
                        id: 'send_renewal_reminder',
                        type: 'notification',
                        config: {
                            type: 'email',
                            template: 'subscription_renewal',
                            delay: 7 * 24 * 60 * 60 * 1000 // 7 days before
                        }
                    },
                    {
                        id: 'attempt_payment',
                        type: 'payment',
                        config: {
                            action: 'charge_subscription',
                            subscriptionId: '{{trigger.subscriptionId}}'
                        }
                    },
                    {
                        id: 'handle_payment_result',
                        type: 'conditional',
                        config: {
                            condition: '{{payment.success}}',
                            onSuccess: 'update_subscription_status',
                            onFailure: 'send_payment_failed_notification'
                        }
                    }
                ]
            },
            {
                id: 'team_collaboration',
                name: 'Team Collaboration Workflow',
                description: 'Automated team collaboration setup',
                triggers: ['team.member_added'],
                steps: [{
                        id: 'send_team_invitation',
                        type: 'notification',
                        config: {
                            type: 'email',
                            template: 'team_invitation',
                            recipient: '{{trigger.newMemberId}}'
                        }
                    },
                    {
                        id: 'create_collaboration_space',
                        type: 'database',
                        config: {
                            action: 'create',
                            table: 'collaborationSpace',
                            data: {
                                teamId: '{{trigger.teamId}}',
                                memberId: '{{trigger.newMemberId}}',
                                permissions: 'member'
                            }
                        }
                    },
                    {
                        id: 'schedule_onboarding_call',
                        type: 'calendar',
                        config: {
                            action: 'create_event',
                            title: 'Team Onboarding Call',
                            participants: '{{trigger.teamMembers}}',
                            duration: 60
                        }
                    }
                ]
            },
            {
                id: 'legal_document_workflow',
                name: 'Legal Document Workflow',
                description: 'Automated legal document processing',
                triggers: ['legal.document.uploaded'],
                steps: [{
                        id: 'validate_document',
                        type: 'validation',
                        config: {
                            rules: ['file_type', 'file_size', 'content_check']
                        }
                    },
                    {
                        id: 'notify_legal_team',
                        type: 'notification',
                        config: {
                            type: 'in_app',
                            template: 'document_review_needed',
                            recipients: 'legal_team'
                        }
                    },
                    {
                        id: 'schedule_review',
                        type: 'calendar',
                        config: {
                            action: 'create_event',
                            title: 'Document Review',
                            participants: 'legal_team',
                            duration: 30
                        }
                    }
                ]
            }
        ];

        templates.forEach(template => {
            this.workflowTemplates.set(template.id, template);
        });
    }

    setupEventHandlers() {
        // Listen for workflow trigger events
        const eventTypes = [
            'user.created', 'user.updated', 'user.deleted',
            'venture.created', 'venture.updated', 'venture.deleted',
            'team.created', 'team.updated', 'team.member_added',
            'subscription.created', 'subscription.renewal_due', 'subscription.cancelled',
            'legal.document.uploaded', 'legal.document.signed',
            'payment.succeeded', 'payment.failed',
            'workflow.triggered', 'workflow.completed', 'workflow.failed'
        ];

        eventTypes.forEach(eventType => {
            eventSystem.subscribe(eventType, this.handleWorkflowTrigger.bind(this));
        });
    }

    startWorkflowProcessor() {
        // Process workflows every 5 seconds
        setInterval(() => {
            this.processWorkflowQueue();
        }, this.processInterval);

        console.log('⚙️ Workflow engine started');
    }

    async handleWorkflowTrigger(event) {
        try {
            const { type, data } = event;

            // Find workflows that should be triggered by this event
            for (const [workflowId, template] of this.workflowTemplates) {
                if (template.triggers.includes(type)) {
                    await this.triggerWorkflow(workflowId, data, event);
                }
            }
        } catch (error) {
            console.error('❌ Error handling workflow trigger:', error);
        }
    }

    async triggerWorkflow(workflowId, data, event) {
        try {
            const template = this.workflowTemplates.get(workflowId);
            if (!template) return;

            const executionId = this.generateExecutionId();
            const execution = {
                id: executionId,
                workflowId: workflowId,
                template: template,
                data: data,
                event: event,
                status: 'running',
                currentStep: 0,
                steps: template.steps.map(step => ({
                    ...step,
                    status: 'pending',
                    startedAt: null,
                    completedAt: null,
                    error: null,
                    retryCount: 0
                })),
                startedAt: new Date(),
                completedAt: null,
                error: null
            };

            this.activeExecutions.set(executionId, execution);

            // Queue for processing
            await messageQueue.addJob('workflow', {
                type: 'EXECUTE_WORKFLOW',
                executionId: executionId,
                workflowId: workflowId
            });

            console.log(`⚙️ Workflow ${workflowId} triggered with execution ${executionId}`);
        } catch (error) {
            console.error('❌ Error triggering workflow:', error);
        }
    }

    async processWorkflowQueue() {
        try {
            // Process active executions
            for (const [executionId, execution] of this.activeExecutions) {
                if (execution.status === 'running') {
                    await this.executeWorkflowStep(execution);
                }
            }
        } catch (error) {
            console.error('❌ Error processing workflow queue:', error);
        }
    }

    async executeWorkflowStep(execution) {
        try {
            const currentStepIndex = execution.currentStep;
            const step = execution.steps[currentStepIndex];

            if (!step) {
                // Workflow completed
                execution.status = 'completed';
                execution.completedAt = new Date();
                this.moveToHistory(execution);
                return;
            }

            step.status = 'running';
            step.startedAt = new Date();

            try {
                await this.executeStep(step, execution);

                step.status = 'completed';
                step.completedAt = new Date();
                execution.currentStep++;

                console.log(`✅ Workflow step ${step.id} completed for execution ${execution.id}`);
            } catch (error) {
                step.status = 'failed';
                step.error = error.message;
                step.retryCount++;

                if (step.retryCount < this.maxRetries) {
                    // Retry step
                    step.status = 'pending';
                    console.log(`🔄 Retrying workflow step ${step.id} (attempt ${step.retryCount + 1})`);
                } else {
                    // Max retries reached, fail workflow
                    execution.status = 'failed';
                    execution.error = `Step ${step.id} failed after ${this.maxRetries} retries: ${error.message}`;
                    execution.completedAt = new Date();
                    this.moveToHistory(execution);
                }
            }
        } catch (error) {
            console.error('❌ Error executing workflow step:', error);
        }
    }

    async executeStep(step, execution) {
        const { type, config } = step;
        const data = this.resolveVariables(config, execution);

        switch (type) {
            case 'notification':
                await this.executeNotificationStep(data, execution);
                break;
            case 'database':
                await this.executeDatabaseStep(data, execution);
                break;
            case 'payment':
                await this.executePaymentStep(data, execution);
                break;
            case 'delay':
                await this.executeDelayStep(data, execution);
                break;
            case 'conditional':
                await this.executeConditionalStep(data, execution);
                break;
            case 'validation':
                await this.executeValidationStep(data, execution);
                break;
            case 'calendar':
                await this.executeCalendarStep(data, execution);
                break;
            default:
                throw new Error(`Unknown step type: ${type}`);
        }
    }

    async executeNotificationStep(config, execution) {
        try {
            const { type, template, recipients, delay = 0 } = config;

            if (delay > 0) {
                // Schedule delayed notification
                setTimeout(async() => {
                    await this.sendNotification(type, template, recipients, execution);
                }, delay);
            } else {
                await this.sendNotification(type, template, recipients, execution);
            }
        } catch (error) {
            console.error('❌ Error executing notification step:', error);
            throw error;
        }
    }

    async sendNotification(type, template, recipients, execution) {
        try {
            const notification = {
                type: type,
                template: template,
                recipients: recipients,
                data: execution.data,
                workflowId: execution.workflowId,
                executionId: execution.id
            };

            await messageQueue.addJob('notification', {
                type: 'WORKFLOW_NOTIFICATION',
                notification: notification
            });
        } catch (error) {
            console.error('❌ Error sending notification:', error);
            throw error;
        }
    }

    async executeDatabaseStep(config, execution) {
        try {
            const { action, table, data } = config;

            switch (action) {
                case 'create':
                    await this.prisma[table].create({ data });
                    break;
                case 'update':
                    await this.prisma[table].update({
                        where: { id: data.id },
                        data: data
                    });
                    break;
                case 'delete':
                    await this.prisma[table].delete({
                        where: { id: data.id }
                    });
                    break;
                default:
                    throw new Error(`Unknown database action: ${action}`);
            }
        } catch (error) {
            console.error('❌ Error executing database step:', error);
            throw error;
        }
    }

    async executePaymentStep(config, execution) {
        try {
            const { action, subscriptionId } = config;

            // This would integrate with payment service
            console.log(`💳 Executing payment step: ${action} for subscription ${subscriptionId}`);

            // Mock payment result
            const result = { success: true, transactionId: 'txn_' + Date.now() };
            execution.data.payment = result;
        } catch (error) {
            console.error('❌ Error executing payment step:', error);
            throw error;
        }
    }

    async executeDelayStep(config, execution) {
        try {
            const { delay, nextStep } = config;

            // Schedule next step
            setTimeout(() => {
                const nextStepIndex = execution.steps.findIndex(step => step.id === nextStep);
                if (nextStepIndex !== -1) {
                    execution.currentStep = nextStepIndex;
                }
            }, delay);
        } catch (error) {
            console.error('❌ Error executing delay step:', error);
            throw error;
        }
    }

    async executeConditionalStep(config, execution) {
        try {
            const { condition, onSuccess, onFailure } = config;

            const result = this.evaluateCondition(condition, execution);
            const nextStep = result ? onSuccess : onFailure;

            if (nextStep) {
                const nextStepIndex = execution.steps.findIndex(step => step.id === nextStep);
                if (nextStepIndex !== -1) {
                    execution.currentStep = nextStepIndex;
                }
            }
        } catch (error) {
            console.error('❌ Error executing conditional step:', error);
            throw error;
        }
    }

    async executeValidationStep(config, execution) {
        try {
            const { rules } = config;

            for (const rule of rules) {
                await this.validateRule(rule, execution);
            }
        } catch (error) {
            console.error('❌ Error executing validation step:', error);
            throw error;
        }
    }

    async executeCalendarStep(config, execution) {
        try {
            const { action, title, participants, duration } = config;

            // This would integrate with calendar service
            console.log(`📅 Executing calendar step: ${action} - ${title}`);
        } catch (error) {
            console.error('❌ Error executing calendar step:', error);
            throw error;
        }
    }

    resolveVariables(config, execution) {
        const resolved = {...config };

        // Replace {{variable}} with actual values
        const resolveValue = (value) => {
            if (typeof value === 'string') {
                return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
                    const keys = path.split('.');
                    let result = execution;

                    for (const key of keys) {
                        if (result && typeof result === 'object') {
                            result = result[key];
                        } else {
                            return match; // Return original if path not found
                        }
                    }

                    return result || match;
                });
            } else if (typeof value === 'object' && value !== null) {
                const resolvedObj = {};
                for (const [key, val] of Object.entries(value)) {
                    resolvedObj[key] = resolveValue(val);
                }
                return resolvedObj;
            }

            return value;
        };

        return resolveValue(resolved);
    }

    evaluateCondition(condition, execution) {
        // Simple condition evaluation
        // In a real implementation, this would be more sophisticated
        const parts = condition.split('.');
        let result = execution;

        for (const part of parts) {
            if (result && typeof result === 'object') {
                result = result[part];
            } else {
                return false;
            }
        }

        return Boolean(result);
    }

    async validateRule(rule, execution) {
        switch (rule) {
            case 'file_type':
                // Validate file type
                break;
            case 'file_size':
                // Validate file size
                break;
            case 'content_check':
                // Validate content
                break;
            default:
                throw new Error(`Unknown validation rule: ${rule}`);
        }
    }

    moveToHistory(execution) {
        this.executionHistory.set(execution.id, execution);
        this.activeExecutions.delete(execution.id);
    }

    // API Methods
    async createWorkflow(workflowData) {
        try {
            const workflow = {
                id: this.generateWorkflowId(),
                ...workflowData,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            this.workflowTemplates.set(workflow.id, workflow);

            return { success: true, workflow: workflow };
        } catch (error) {
            console.error('❌ Error creating workflow:', error);
            throw error;
        }
    }

    async updateWorkflow(workflowId, updates) {
        try {
            const workflow = this.workflowTemplates.get(workflowId);
            if (!workflow) {
                throw new Error('Workflow not found');
            }

            const updatedWorkflow = {
                ...workflow,
                ...updates,
                updatedAt: new Date()
            };

            this.workflowTemplates.set(workflowId, updatedWorkflow);

            return { success: true, workflow: updatedWorkflow };
        } catch (error) {
            console.error('❌ Error updating workflow:', error);
            throw error;
        }
    }

    async deleteWorkflow(workflowId) {
        try {
            const workflow = this.workflowTemplates.get(workflowId);
            if (!workflow) {
                throw new Error('Workflow not found');
            }

            this.workflowTemplates.delete(workflowId);

            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting workflow:', error);
            throw error;
        }
    }

    async getWorkflows() {
        try {
            const workflows = Array.from(this.workflowTemplates.values());
            return { success: true, workflows: workflows };
        } catch (error) {
            console.error('❌ Error getting workflows:', error);
            throw error;
        }
    }

    async getWorkflow(workflowId) {
        try {
            const workflow = this.workflowTemplates.get(workflowId);
            if (!workflow) {
                throw new Error('Workflow not found');
            }

            return { success: true, workflow: workflow };
        } catch (error) {
            console.error('❌ Error getting workflow:', error);
            throw error;
        }
    }

    async getExecutions(workflowId = null) {
        try {
            let executions = Array.from(this.activeExecutions.values());

            if (workflowId) {
                executions = executions.filter(exec => exec.workflowId === workflowId);
            }

            return { success: true, executions: executions };
        } catch (error) {
            console.error('❌ Error getting executions:', error);
            throw error;
        }
    }

    async getExecution(executionId) {
        try {
            const execution = this.activeExecutions.get(executionId) ||
                this.executionHistory.get(executionId);

            if (!execution) {
                throw new Error('Execution not found');
            }

            return { success: true, execution: execution };
        } catch (error) {
            console.error('❌ Error getting execution:', error);
            throw error;
        }
    }

    async getExecutionHistory(workflowId = null, limit = 100) {
        try {
            let history = Array.from(this.executionHistory.values());

            if (workflowId) {
                history = history.filter(exec => exec.workflowId === workflowId);
            }

            history.sort((a, b) => b.startedAt - a.startedAt);
            history = history.slice(0, limit);

            return { success: true, history: history };
        } catch (error) {
            console.error('❌ Error getting execution history:', error);
            throw error;
        }
    }

    async getWorkflowStats() {
        try {
            const stats = {
                totalWorkflows: this.workflowTemplates.size,
                activeExecutions: this.activeExecutions.size,
                completedExecutions: this.executionHistory.size,
                executionsByStatus: {
                    running: 0,
                    completed: 0,
                    failed: 0
                }
            };

            // Count executions by status
            for (const execution of this.activeExecutions.values()) {
                stats.executionsByStatus[execution.status]++;
            }

            for (const execution of this.executionHistory.values()) {
                stats.executionsByStatus[execution.status]++;
            }

            return { success: true, stats: stats };
        } catch (error) {
            console.error('❌ Error getting workflow stats:', error);
            throw error;
        }
    }

    generateWorkflowId() {
        return `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateExecutionId() {
        return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Health check
    getHealth() {
        return {
            status: 'healthy',
            service: 'workflow-engine',
            timestamp: new Date(),
            workflows: this.workflowTemplates.size,
            activeExecutions: this.activeExecutions.size,
            executionHistory: this.executionHistory.size,
            uptime: process.uptime()
        };
    }

    // Cleanup
    async destroy() {
        try {
            await this.prisma.$disconnect();
            this.workflows.clear();
            this.activeExecutions.clear();
            this.workflowTemplates.clear();
            this.executionHistory.clear();
            console.log('✅ Workflow engine destroyed');
        } catch (error) {
            console.error('❌ Error destroying workflow engine:', error);
        }
    }
}

// Create singleton instance
const workflowEngine = new SmartStartWorkflowEngine({
    batchSize: 100,
    processInterval: 5000,
    maxRetries: 3
});

module.exports = workflowEngine;