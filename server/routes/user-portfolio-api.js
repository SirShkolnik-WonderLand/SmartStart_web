const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configure multer for portfolio file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/portfolio';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'portfolio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/', 'application/pdf', 'text/'];
        if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'));
        }
    }
});

// ===== USER PORTFOLIO MANAGEMENT =====

// Get user portfolio overview
router.get('/portfolio/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can view this portfolio
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view this portfolio'
            });
        }

        const portfolio = await prisma.userPortfolio.findUnique({
            where: { userId },
            include: {
                projects: {
                    include: {
                        skills: {
                            include: { skill: true }
                        },
                        client: true,
                        deliverables: true,
                        feedback: {
                            include: { client: true }
                        }
                    },
                    orderBy: { startDate: 'desc' }
                },
                skills: {
                    include: { skill: true },
                    orderBy: { level: 'desc' }
                },
                testimonials: {
                    include: { client: true },
                    orderBy: { createdAt: 'desc' }
                },
                certifications: {
                    orderBy: { earnedAt: 'desc' }
                }
            }
        });

        if (!portfolio) {
            return res.json({
                success: true,
                portfolio: {
                    userId,
                    projects: [],
                    skills: [],
                    testimonials: [],
                    certifications: [],
                    isOwnPortfolio: requestingUser.id === userId,
                    canEdit: requestingUser.id === userId || requestingUser.permissions.includes('write:user')
                }
            });
        }

        res.json({
            success: true,
            portfolio: {
                ...portfolio,
                isOwnPortfolio: requestingUser.id === userId,
                canEdit: requestingUser.id === userId || requestingUser.permissions.includes('write:user')
            }
        });

    } catch (error) {
        console.error('Portfolio retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve portfolio',
            error: error.message
        });
    }
});

// Create or update portfolio project
router.put('/portfolio/:userId/projects/:projectId?', authenticateToken, async(req, res) => {
    try {
        const { userId, projectId } = req.params;
        const requestingUser = req.user;

        // Check if user can edit this portfolio
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('write:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to edit this portfolio'
            });
        }

        const {
            title,
            description,
            clientId,
            startDate,
            endDate,
            isCurrent,
            budget,
            technologies,
            skills,
            deliverables,
            achievements,
            challenges,
            solutions,
            results,
            isPublic
        } = req.body;

        let project;

        if (projectId) {
            // Update existing project
            project = await prisma.portfolioProject.update({
                where: { id: projectId },
                data: {
                    title,
                    description,
                    clientId,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    isCurrent: isCurrent || false,
                    budget: budget ? parseFloat(budget) : null,
                    technologies: technologies || [],
                    achievements: achievements || [],
                    challenges: challenges || [],
                    solutions: solutions || [],
                    results: results || '',
                    isPublic: isPublic !== false,
                    updatedAt: new Date()
                }
            });
        } else {
            // Create new project
            project = await prisma.portfolioProject.create({
                data: {
                    userId,
                    title,
                    description,
                    clientId,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    isCurrent: isCurrent || false,
                    budget: budget ? parseFloat(budget) : null,
                    technologies: technologies || [],
                    achievements: achievements || [],
                    challenges: challenges || [],
                    solutions: solutions || [],
                    results: results || '',
                    isPublic: isPublic !== false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
        }

        // Handle skills
        if (skills && Array.isArray(skills)) {
            // Remove existing skills
            await prisma.projectSkill.deleteMany({
                where: { projectId: project.id }
            });

            // Add new skills
            for (const skillData of skills) {
                await prisma.projectSkill.create({
                    data: {
                        projectId: project.id,
                        skillId: skillData.skillId,
                        level: skillData.level || 'BEGINNER',
                        importance: skillData.importance || 'MEDIUM'
                    }
                });
            }
        }

        // Handle deliverables
        if (deliverables && Array.isArray(deliverables)) {
            // Remove existing deliverables
            await prisma.projectDeliverable.deleteMany({
                where: { projectId: project.id }
            });

            // Add new deliverables
            for (const deliverableData of deliverables) {
                await prisma.projectDeliverable.create({
                    data: {
                        projectId: project.id,
                        name: deliverableData.name,
                        description: deliverableData.description,
                        type: deliverableData.type || 'DOCUMENT',
                        status: deliverableData.status || 'COMPLETED',
                        deliveredAt: deliverableData.deliveredAt ? new Date(deliverableData.deliveredAt) : null
                    }
                });
            }
        }

        res.json({
            success: true,
            message: projectId ? 'Project updated successfully' : 'Project created successfully',
            project
        });

    } catch (error) {
        console.error('Project update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: error.message
        });
    }
});

// Add client feedback to project
router.post('/portfolio/:userId/projects/:projectId/feedback', authenticateToken, async(req, res) => {
    try {
        const { userId, projectId } = req.params;
        const requestingUser = req.user;

        // Check if user can add feedback to this project
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('write:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to add feedback to this project'
            });
        }

        const {
            clientId,
            rating,
            comment,
            isPublic
        } = req.body;

        const feedback = await prisma.projectFeedback.create({
            data: {
                projectId,
                clientId,
                rating: parseInt(rating),
                comment,
                isPublic: isPublic !== false,
                createdAt: new Date()
            },
            include: {
                client: true
            }
        });

        res.json({
            success: true,
            message: 'Feedback added successfully',
            feedback
        });

    } catch (error) {
        console.error('Feedback creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add feedback',
            error: error.message
        });
    }
});

// Upload portfolio files
router.post('/portfolio/:userId/upload', authenticateToken, upload.array('files', 5), async(req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can upload to this portfolio
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('write:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to upload to this portfolio'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files provided'
            });
        }

        const uploadedFiles = [];

        for (const file of req.files) {
            const fileUrl = `/uploads/portfolio/${file.filename}`;

            const portfolioFile = await prisma.portfolioFile.create({
                data: {
                    userId,
                    filename: file.originalname,
                    fileUrl,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    isPublic: true,
                    uploadedAt: new Date()
                }
            });

            uploadedFiles.push(portfolioFile);
        }

        res.json({
            success: true,
            message: 'Files uploaded successfully',
            files: uploadedFiles
        });

    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload files',
            error: error.message
        });
    }
});

// Get portfolio analytics
router.get('/portfolio/:userId/analytics', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can view this portfolio
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view this portfolio'
            });
        }

        // Get portfolio statistics
        const [
            totalProjects,
            completedProjects,
            totalBudget,
            averageRating,
            skillCount,
            clientCount
        ] = await Promise.all([
            prisma.portfolioProject.count({ where: { userId } }),
            prisma.portfolioProject.count({ where: { userId, isCurrent: false } }),
            prisma.portfolioProject.aggregate({
                where: { userId, budget: { not: null } },
                _sum: { budget: true }
            }),
            prisma.projectFeedback.aggregate({
                where: { project: { userId } },
                _avg: { rating: true }
            }),
            prisma.userSkill.count({ where: { userId } }),
            prisma.portfolioProject.groupBy({
                by: ['clientId'],
                where: { userId },
                _count: { clientId: true }
            })
        ]);

        // Get skills breakdown
        const skillsBreakdown = await prisma.userSkill.findMany({
            where: { userId },
            include: { skill: true },
            orderBy: { level: 'desc' }
        });

        // Get project timeline
        const projectTimeline = await prisma.portfolioProject.findMany({
            where: { userId },
            select: {
                title: true,
                startDate: true,
                endDate: true,
                isCurrent: true,
                client: { select: { name: true } }
            },
            orderBy: { startDate: 'desc' }
        });

        res.json({
            success: true,
            analytics: {
                overview: {
                    totalProjects,
                    completedProjects,
                    activeProjects: totalProjects - completedProjects,
                    totalBudget: totalBudget._sum.budget || 0,
                    averageRating: averageRating._avg.rating || 0,
                    skillCount,
                    clientCount: clientCount.length
                },
                skillsBreakdown,
                projectTimeline
            }
        });

    } catch (error) {
        console.error('Analytics retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve analytics',
            error: error.message
        });
    }
});

// Get public portfolio (for sharing)
router.get('/portfolio/:userId/public', async(req, res) => {
    try {
        const { userId } = req.params;

        const publicPortfolio = await prisma.userPortfolio.findUnique({
            where: { userId },
            include: {
                projects: {
                    where: { isPublic: true },
                    include: {
                        skills: {
                            include: { skill: true }
                        },
                        client: { select: { name: true } },
                        deliverables: true,
                        feedback: {
                            where: { isPublic: true },
                            include: { client: { select: { name: true } } }
                        }
                    },
                    orderBy: { startDate: 'desc' }
                },
                skills: {
                    where: { isPublic: true },
                    include: { skill: true },
                    orderBy: { level: 'desc' }
                },
                testimonials: {
                    where: { isPublic: true },
                    include: { client: { select: { name: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!publicPortfolio) {
            return res.status(404).json({
                success: false,
                message: 'Public portfolio not found'
            });
        }

        res.json({
            success: true,
            portfolio: publicPortfolio
        });

    } catch (error) {
        console.error('Public portfolio retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve public portfolio',
            error: error.message
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'User Portfolio System is healthy',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /portfolio/:userId - Get user portfolio',
            'PUT /portfolio/:userId/projects/:projectId? - Create/update project',
            'POST /portfolio/:userId/projects/:projectId/feedback - Add client feedback',
            'POST /portfolio/:userId/upload - Upload portfolio files',
            'GET /portfolio/:userId/analytics - Get portfolio analytics',
            'GET /portfolio/:userId/public - Get public portfolio'
        ]
    });
});

module.exports = router;