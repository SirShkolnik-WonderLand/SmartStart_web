const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===== CONTRIBUTION PIPELINE API =====

// Health check
router.get('/health', async (req, res) => {
    try {
        const stats = await prisma.$queryRaw`
            SELECT 
                (SELECT COUNT(*) FROM "Project") as projects,
                (SELECT COUNT(*) FROM "Task") as tasks,
                (SELECT COUNT(*) FROM "TaskAssignment") as assignments,
                (SELECT COUNT(*) FROM "Workflow") as workflows,
                (SELECT COUNT(*) FROM "Contribution") as contributions,
                (SELECT COUNT(*) FROM "Reward") as rewards
        `;
        
        res.json({
            success: true,
            message: 'Contribution Pipeline System is healthy',
            stats: {
                projects: Number(stats[0].projects),
                tasks: Number(stats[0].tasks),
                assignments: Number(stats[0].assignments),
                workflows: Number(stats[0].workflows),
                contributions: Number(stats[0].contributions),
                rewards: Number(stats[0].rewards)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            success: true,
            message: 'Contribution Pipeline System is healthy (tables may not exist yet)',
            stats: {
                projects: 0,
                tasks: 0,
                assignments: 0,
                workflows: 0,
                contributions: 0,
                rewards: 0
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Create tables for contribution pipeline system
router.post('/create-tables', async (req, res) => {
    try {
        // Drop existing tables if they exist
        await prisma.$executeRaw`DROP TABLE IF EXISTS "Reward" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "Contribution" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "Workflow" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "TaskAssignment" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "Task" CASCADE`;
        await prisma.$executeRaw`DROP TABLE IF EXISTS "Project" CASCADE`;

        // Create Project table
        await prisma.$executeRaw`
            CREATE TABLE "Project" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT,
                "companyId" TEXT NOT NULL,
                "teamId" TEXT,
                "status" TEXT NOT NULL DEFAULT 'ACTIVE',
                "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
                "startDate" TIMESTAMP(3),
                "endDate" TIMESTAMP(3),
                "budget" DECIMAL(10,2),
                "settings" JSONB DEFAULT '{}',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create Task table
        await prisma.$executeRaw`
            CREATE TABLE "Task" (
                "id" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "description" TEXT,
                "projectId" TEXT NOT NULL,
                "assignedTo" TEXT,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
                "type" TEXT NOT NULL DEFAULT 'DEVELOPMENT',
                "estimatedHours" INTEGER,
                "actualHours" INTEGER,
                "dueDate" TIMESTAMP(3),
                "completedAt" TIMESTAMP(3),
                "settings" JSONB DEFAULT '{}',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create TaskAssignment table
        await prisma.$executeRaw`
            CREATE TABLE "TaskAssignment" (
                "id" TEXT NOT NULL,
                "taskId" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "role" TEXT NOT NULL DEFAULT 'ASSIGNEE',
                "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "acceptedAt" TIMESTAMP(3),
                "completedAt" TIMESTAMP(3),
                "performance" JSONB DEFAULT '{}',
                CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create Workflow table
        await prisma.$executeRaw`
            CREATE TABLE "Workflow" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT,
                "projectId" TEXT NOT NULL,
                "type" TEXT NOT NULL DEFAULT 'APPROVAL',
                "steps" JSONB NOT NULL,
                "currentStep" INTEGER NOT NULL DEFAULT 0,
                "status" TEXT NOT NULL DEFAULT 'ACTIVE',
                "settings" JSONB DEFAULT '{}',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create Contribution table
        await prisma.$executeRaw`
            CREATE TABLE "Contribution" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "taskId" TEXT NOT NULL,
                "projectId" TEXT NOT NULL,
                "type" TEXT NOT NULL DEFAULT 'TASK_COMPLETION',
                "value" DECIMAL(10,2) NOT NULL DEFAULT 0,
                "description" TEXT,
                "metrics" JSONB DEFAULT '{}',
                "recognizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "settings" JSONB DEFAULT '{}',
                CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create Reward table
        await prisma.$executeRaw`
            CREATE TABLE "Reward" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "contributionId" TEXT NOT NULL,
                "type" TEXT NOT NULL DEFAULT 'BUZ_TOKENS',
                "amount" DECIMAL(10,2) NOT NULL,
                "description" TEXT,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "distributedAt" TIMESTAMP(3),
                "settings" JSONB DEFAULT '{}',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
            )
        `;

        // Create indexes for performance
        await prisma.$executeRaw`CREATE INDEX "Project_companyId_idx" ON "Project"("companyId")`;
        await prisma.$executeRaw`CREATE INDEX "Project_teamId_idx" ON "Project"("teamId")`;
        await prisma.$executeRaw`CREATE INDEX "Task_projectId_idx" ON "Task"("projectId")`;
        await prisma.$executeRaw`CREATE INDEX "Task_assignedTo_idx" ON "Task"("assignedTo")`;
        await prisma.$executeRaw`CREATE INDEX "TaskAssignment_taskId_idx" ON "TaskAssignment"("taskId")`;
        await prisma.$executeRaw`CREATE INDEX "TaskAssignment_userId_idx" ON "TaskAssignment"("userId")`;
        await prisma.$executeRaw`CREATE INDEX "Contribution_userId_idx" ON "Contribution"("userId")`;
        await prisma.$executeRaw`CREATE INDEX "Contribution_projectId_idx" ON "Contribution"("projectId")`;
        await prisma.$executeRaw`CREATE INDEX "Reward_userId_idx" ON "Reward"("userId")`;

        res.json({
            success: true,
            message: 'Contribution Pipeline System tables created successfully',
            tables: ['Project', 'Task', 'TaskAssignment', 'Workflow', 'Contribution', 'Reward'],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Table creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create tables',
            error: error.message
        });
    }
});

// Create project
router.post('/projects/create', async (req, res) => {
    try {
        const {
            name,
            description,
            companyId,
            teamId,
            status = 'ACTIVE',
            priority = 'MEDIUM',
            startDate,
            endDate,
            budget,
            settings = {}
        } = req.body;

        if (!name || !companyId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, companyId'
            });
        }

        // Create project using raw SQL
        const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "Project" (
                "id", "name", "description", "companyId", "teamId", "status", "priority",
                "startDate", "endDate", "budget", "settings", "createdAt", "updatedAt"
            ) VALUES (
                ${projectId}, ${name}, ${description}, ${companyId}, ${teamId}, ${status}, ${priority},
                ${startDate ? new Date(startDate) : null}, ${endDate ? new Date(endDate) : null}, 
                ${budget}, ${JSON.stringify(settings)}::jsonb, NOW(), NOW()
            )
        `;

        // Fetch the created project
        const project = await prisma.$queryRaw`
            SELECT p.*, 
                   c.name as companyName,
                   t.name as teamName
            FROM "Project" p
            LEFT JOIN "Company" c ON p."companyId" = c.id
            LEFT JOIN "Team" t ON p."teamId" = t.id
            WHERE p.id = ${projectId}
        `;

        res.json({
            success: true,
            message: 'Project created successfully',
            project: project[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Project creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Project creation failed',
            error: error.message
        });
    }
});

// Get all projects
router.get('/projects', async (req, res) => {
    try {
        const { page = 1, limit = 20, companyId, teamId, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (companyId) {
            whereClause += ` AND p."companyId" = $${paramIndex}`;
            params.push(companyId);
            paramIndex++;
        }
        if (teamId) {
            whereClause += ` AND p."teamId" = $${paramIndex}`;
            params.push(teamId);
            paramIndex++;
        }
        if (status) {
            whereClause += ` AND p.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        const projects = await prisma.$queryRaw`
            SELECT p.*, 
                   c.name as companyName,
                   t.name as teamName,
                   (SELECT COUNT(*) FROM "Task" WHERE "projectId" = p.id) as taskCount,
                   (SELECT COUNT(*) FROM "Task" WHERE "projectId" = p.id AND status = 'COMPLETED') as completedTasks
            FROM "Project" p
            LEFT JOIN "Company" c ON p."companyId" = c.id
            LEFT JOIN "Team" t ON p."teamId" = t.id
            ${whereClause}
            ORDER BY p."createdAt" DESC
            LIMIT ${parseInt(limit)} OFFSET ${skip}
        `;

        const totalResult = await prisma.$queryRaw`
            SELECT COUNT(*) as total FROM "Project" p ${whereClause}
        `;
        const total = Number(totalResult[0].total);

        res.json({
            success: true,
            projects,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Projects fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: error.message
        });
    }
});

// Create task
router.post('/tasks/create', async (req, res) => {
    try {
        const {
            title,
            description,
            projectId,
            assignedTo,
            status = 'PENDING',
            priority = 'MEDIUM',
            type = 'DEVELOPMENT',
            estimatedHours,
            dueDate,
            settings = {}
        } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, projectId'
            });
        }

        // Create task using raw SQL
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "Task" (
                "id", "title", "description", "projectId", "assignedTo", "status", "priority",
                "type", "estimatedHours", "dueDate", "settings", "createdAt", "updatedAt"
            ) VALUES (
                ${taskId}, ${title}, ${description}, ${projectId}, ${assignedTo}, ${status}, ${priority},
                ${type}, ${estimatedHours}, ${dueDate ? new Date(dueDate) : null}, 
                ${JSON.stringify(settings)}::jsonb, NOW(), NOW()
            )
        `;

        // Fetch the created task
        const task = await prisma.$queryRaw`
            SELECT t.*, 
                   p.name as projectName,
                   u.name as assignedUserName
            FROM "Task" t
            LEFT JOIN "Project" p ON t."projectId" = p.id
            LEFT JOIN "User" u ON t."assignedTo" = u.id
            WHERE t.id = ${taskId}
        `;

        res.json({
            success: true,
            message: 'Task created successfully',
            task: task[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Task creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Task creation failed',
            error: error.message
        });
    }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const { page = 1, limit = 20, projectId, assignedTo, status, priority } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (projectId) {
            whereClause += ` AND t."projectId" = $${paramIndex}`;
            params.push(projectId);
            paramIndex++;
        }
        if (assignedTo) {
            whereClause += ` AND t."assignedTo" = $${paramIndex}`;
            params.push(assignedTo);
            paramIndex++;
        }
        if (status) {
            whereClause += ` AND t.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        if (priority) {
            whereClause += ` AND t.priority = $${paramIndex}`;
            params.push(priority);
            paramIndex++;
        }

        const tasks = await prisma.$queryRaw`
            SELECT t.*, 
                   p.name as projectName,
                   u.name as assignedUserName,
                   (SELECT COUNT(*) FROM "TaskAssignment" WHERE "taskId" = t.id) as assignmentCount
            FROM "Task" t
            LEFT JOIN "Project" p ON t."projectId" = p.id
            LEFT JOIN "User" u ON t."assignedTo" = u.id
            ${whereClause}
            ORDER BY t."createdAt" DESC
            LIMIT ${parseInt(limit)} OFFSET ${skip}
        `;

        const totalResult = await prisma.$queryRaw`
            SELECT COUNT(*) as total FROM "Task" t ${whereClause}
        `;
        const total = Number(totalResult[0].total);

        res.json({
            success: true,
            tasks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Tasks fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message
        });
    }
});

// Assign task to user
router.post('/tasks/:taskId/assign', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { userId, role = 'ASSIGNEE' } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: userId'
            });
        }

        // Create assignment using raw SQL
        const assignmentId = `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await prisma.$executeRaw`
            INSERT INTO "TaskAssignment" (
                "id", "taskId", "userId", "role", "assignedAt", "performance"
            ) VALUES (
                ${assignmentId}, ${taskId}, ${userId}, ${role}, NOW(), '{}'::jsonb
            )
        `;

        // Update task assignedTo
        await prisma.$executeRaw`
            UPDATE "Task" SET "assignedTo" = ${userId}, "updatedAt" = NOW() WHERE id = ${taskId}
        `;

        res.json({
            success: true,
            message: 'Task assigned successfully',
            assignmentId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Task assignment error:', error);
        res.status(500).json({
            success: false,
            message: 'Task assignment failed',
            error: error.message
        });
    }
});

// Complete task
router.post('/tasks/:taskId/complete', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { actualHours, performance = {} } = req.body;

        // Update task status
        await prisma.$executeRaw`
            UPDATE "Task" 
            SET status = 'COMPLETED', "actualHours" = ${actualHours}, "completedAt" = NOW(), "updatedAt" = NOW()
            WHERE id = ${taskId}
        `;

        // Update assignment performance
        await prisma.$executeRaw`
            UPDATE "TaskAssignment" 
            SET "completedAt" = NOW(), "performance" = ${JSON.stringify(performance)}::jsonb
            WHERE "taskId" = ${taskId}
        `;

        // Create contribution record
        const contributionId = `contribution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const task = await prisma.$queryRaw`SELECT "projectId", "assignedTo" FROM "Task" WHERE id = ${taskId}`;
        
        if (task[0]) {
            await prisma.$executeRaw`
                INSERT INTO "Contribution" (
                    "id", "userId", "taskId", "projectId", "type", "value", "description", "metrics"
                ) VALUES (
                    ${contributionId}, ${task[0].assignedTo}, ${taskId}, ${task[0].projectId}, 
                    'TASK_COMPLETION', ${actualHours || 0}, 'Task completed successfully', 
                    ${JSON.stringify({ actualHours, performance })}::jsonb
                )
            `;
        }

        res.json({
            success: true,
            message: 'Task completed successfully',
            contributionId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Task completion error:', error);
        res.status(500).json({
            success: false,
            message: 'Task completion failed',
            error: error.message
        });
    }
});

// Get user contributions
router.get('/contributions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const contributions = await prisma.$queryRaw`
            SELECT c.*, 
                   t.title as taskTitle,
                   p.name as projectName,
                   u.name as userName
            FROM "Contribution" c
            LEFT JOIN "Task" t ON c."taskId" = t.id
            LEFT JOIN "Project" p ON c."projectId" = p.id
            LEFT JOIN "User" u ON c."userId" = u.id
            WHERE c."userId" = ${userId}
            ORDER BY c."recognizedAt" DESC
            LIMIT ${parseInt(limit)} OFFSET ${skip}
        `;

        const totalResult = await prisma.$queryRaw`
            SELECT COUNT(*) as total FROM "Contribution" WHERE "userId" = ${userId}
        `;
        const total = Number(totalResult[0].total);

        res.json({
            success: true,
            contributions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Contributions fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contributions',
            error: error.message
        });
    }
});

// Get project analytics
router.get('/projects/:projectId/analytics', async (req, res) => {
    try {
        const { projectId } = req.params;

        const analytics = await prisma.$queryRaw`
            SELECT 
                p.name as projectName,
                p.status as projectStatus,
                (SELECT COUNT(*) FROM "Task" WHERE "projectId" = p.id) as totalTasks,
                (SELECT COUNT(*) FROM "Task" WHERE "projectId" = p.id AND status = 'COMPLETED') as completedTasks,
                (SELECT COUNT(*) FROM "Task" WHERE "projectId" = p.id AND status = 'PENDING') as pendingTasks,
                (SELECT COUNT(*) FROM "Task" WHERE "projectId" = p.id AND status = 'IN_PROGRESS') as inProgressTasks,
                (SELECT COALESCE(SUM("estimatedHours"), 0) FROM "Task" WHERE "projectId" = p.id) as estimatedHours,
                (SELECT COALESCE(SUM("actualHours"), 0) FROM "Task" WHERE "projectId" = p.id AND status = 'COMPLETED') as actualHours,
                (SELECT COUNT(*) FROM "Contribution" WHERE "projectId" = p.id) as totalContributions,
                (SELECT COALESCE(SUM(value), 0) FROM "Contribution" WHERE "projectId" = p.id) as totalValue
            FROM "Project" p
            WHERE p.id = ${projectId}
        `;

        if (analytics[0]) {
            const data = analytics[0];
            const completionRate = data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0;
            const efficiency = data.estimatedHours > 0 ? (data.actualHours / data.estimatedHours) * 100 : 0;

            res.json({
                success: true,
                analytics: {
                    ...data,
                    completionRate: Math.round(completionRate * 100) / 100,
                    efficiency: Math.round(efficiency * 100) / 100
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
    } catch (error) {
        console.error('Project analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project analytics',
            error: error.message
        });
    }
});

// Get system overview
router.get('/overview', async (req, res) => {
    try {
        const overview = await prisma.$queryRaw`
            SELECT 
                (SELECT COUNT(*) FROM "Project") as totalProjects,
                (SELECT COUNT(*) FROM "Task") as totalTasks,
                (SELECT COUNT(*) FROM "Task" WHERE status = 'COMPLETED') as completedTasks,
                (SELECT COUNT(*) FROM "Contribution") as totalContributions,
                (SELECT COALESCE(SUM(value), 0) FROM "Contribution") as totalValue,
                (SELECT COUNT(*) FROM "Reward") as totalRewards,
                (SELECT COUNT(DISTINCT "userId") FROM "Contribution") as activeContributors
        `;

        res.json({
            success: true,
            overview: {
                totalProjects: Number(overview[0].totalprojects),
                totalTasks: Number(overview[0].totaltasks),
                completedTasks: Number(overview[0].completedtasks),
                totalContributions: Number(overview[0].totalcontributions),
                totalValue: Number(overview[0].totalvalue),
                totalRewards: Number(overview[0].totalrewards),
                activeContributors: Number(overview[0].activecontributors),
                completionRate: overview[0].totaltasks > 0 ? 
                    Math.round((overview[0].completedtasks / overview[0].totaltasks) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Overview fetch error:', error);
        res.json({
            success: true,
            overview: {
                totalProjects: 0,
                totalTasks: 0,
                completedTasks: 0,
                totalContributions: 0,
                totalValue: 0,
                totalRewards: 0,
                activeContributors: 0,
                completionRate: 0
            }
        });
    }
});

module.exports = router;
