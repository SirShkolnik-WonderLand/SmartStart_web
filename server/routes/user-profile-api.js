const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profiles';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// ===== USER PROFILE MANAGEMENT =====

// Get current user profile (without userId)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Get from JWT token
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                companies: {
                    include: {
                        company: true,
                        role: true
                    }
                },
                teams: {
                    include: {
                        team: {
                            include: {
                                company: true
                            }
                        },
                        role: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                name: user.name,
                level: user.level,
                xp: user.xp,
                reputation: user.reputation,
                status: user.status,
                lastActive: user.lastActive,
                profile: user.profile,
                companies: user.companies,
                teams: user.teams
            },
            message: 'User profile retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user profile',
            error: error.message
        });
    }
});

// Get user profile by userId
router.get('/profile/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can view this profile
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view this profile'
            });
        }

        const profile = await prisma.userProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        level: true,
                        xp: true,
                        reputation: true,
                        status: true,
                        lastActive: true,
                        createdAt: true
                    }
                },
                skills: {
                    include: {
                        skill: true
                    }
                },
                experiences: {
                    orderBy: { startDate: 'desc' }
                },
                education: {
                    orderBy: { startDate: 'desc' }
                },
                socialLinks: true,
                achievements: {
                    include: {
                        badge: true
                    },
                    orderBy: { earnedAt: 'desc' }
                }
            }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        res.json({
            success: true,
            profile: {
                ...profile,
                isOwnProfile: requestingUser.id === userId,
                canEdit: requestingUser.id === userId || requestingUser.permissions.includes('write:user')
            }
        });

    } catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile',
            error: error.message
        });
    }
});

// Update current user profile (without userId)
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Get from JWT token
        const { firstName, lastName, name, bio, location, website, linkedin, github, twitter } = req.body;

        // Update user basic info
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                name: name || `${firstName} ${lastName}`.trim(),
                updatedAt: new Date()
            }
        });

        // Update or create profile
        const updatedProfile = await prisma.userProfile.upsert({
            where: { userId: userId },
            update: {
                bio,
                location,
                website,
                linkedin,
                github,
                twitter,
                updatedAt: new Date()
            },
            create: {
                userId: userId,
                bio,
                location,
                website,
                linkedin,
                github,
                twitter
            }
        });

        res.json({
            success: true,
            data: {
                user: updatedUser,
                profile: updatedProfile
            },
            message: 'User profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user profile',
            error: error.message
        });
    }
});

// Create or update user profile by userId
router.put('/profile/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can edit this profile
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('write:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to edit this profile'
            });
        }

        const {
            bio,
            location,
            website,
            phone,
            dateOfBirth,
            gender,
            industry,
            company,
            jobTitle,
            skills,
            experiences,
            education,
            socialLinks,
            privacySettings
        } = req.body;

        // Create or update profile
        const profile = await prisma.userProfile.upsert({
            where: { userId },
            update: {
                bio,
                location,
                website,
                phone,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender,
                industry,
                company,
                jobTitle,
                privacySettings: privacySettings || {},
                updatedAt: new Date()
            },
            create: {
                userId,
                bio,
                location,
                website,
                phone,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender,
                industry,
                company,
                jobTitle,
                privacySettings: privacySettings || {},
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        // Handle skills
        if (skills && Array.isArray(skills)) {
            // Remove existing skills
            await prisma.userSkill.deleteMany({
                where: { userId }
            });

            // Add new skills
            for (const skillData of skills) {
                await prisma.userSkill.create({
                    data: {
                        userId,
                        skillId: skillData.skillId,
                        level: skillData.level || 'BEGINNER',
                        yearsOfExperience: skillData.yearsOfExperience || 0,
                        isVerified: skillData.isVerified || false
                    }
                });
            }
        }

        // Handle experiences
        if (experiences && Array.isArray(experiences)) {
            // Remove existing experiences
            await prisma.userExperience.deleteMany({
                where: { userId }
            });

            // Add new experiences
            for (const expData of experiences) {
                await prisma.userExperience.create({
                    data: {
                        userId,
                        title: expData.title,
                        company: expData.company,
                        description: expData.description,
                        startDate: new Date(expData.startDate),
                        endDate: expData.endDate ? new Date(expData.endDate) : null,
                        isCurrent: expData.isCurrent || false,
                        location: expData.location,
                        achievements: expData.achievements || []
                    }
                });
            }
        }

        // Handle education
        if (education && Array.isArray(education)) {
            // Remove existing education
            await prisma.userEducation.deleteMany({
                where: { userId }
            });

            // Add new education
            for (const eduData of education) {
                await prisma.userEducation.create({
                    data: {
                        userId,
                        institution: eduData.institution,
                        degree: eduData.degree,
                        fieldOfStudy: eduData.fieldOfStudy,
                        startDate: new Date(eduData.startDate),
                        endDate: eduData.endDate ? new Date(eduData.endDate) : null,
                        isCurrent: eduData.isCurrent || false,
                        gpa: eduData.gpa,
                        description: eduData.description
                    }
                });
            }
        }

        // Handle social links
        if (socialLinks && Array.isArray(socialLinks)) {
            // Remove existing social links
            await prisma.userSocialLink.deleteMany({
                where: { userId }
            });

            // Add new social links
            for (const linkData of socialLinks) {
                await prisma.userSocialLink.create({
                    data: {
                        userId,
                        platform: linkData.platform,
                        url: linkData.url,
                        isPublic: linkData.isPublic !== false
                    }
                });
            }
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

// Upload profile photo
router.post('/profile/:userId/photo', authenticateToken, upload.single('photo'), async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can edit this profile
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('write:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to edit this profile'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No photo file provided'
            });
        }

        const photoUrl = `/uploads/profiles/${req.file.filename}`;

        // Update profile with photo
        await prisma.userProfile.upsert({
            where: { userId },
            update: {
                photoUrl,
                updatedAt: new Date()
            },
            create: {
                userId,
                photoUrl,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            photoUrl
        });

    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload photo',
            error: error.message
        });
    }
});

// Get user skills
router.get('/profile/:userId/skills', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can view this profile
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view this profile'
            });
        }

        const skills = await prisma.userSkill.findMany({
            where: { userId },
            include: {
                skill: true
            },
            orderBy: { level: 'desc' }
        });

        res.json({
            success: true,
            skills
        });

    } catch (error) {
        console.error('Skills retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve skills',
            error: error.message
        });
    }
});

// Get user achievements
router.get('/profile/:userId/achievements', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user can view this profile
        if (requestingUser.id !== userId && !requestingUser.permissions.includes('read:user')) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to view this profile'
            });
        }

        const achievements = await prisma.userBadge.findMany({
            where: { userId },
            include: {
                badge: true
            },
            orderBy: { earnedAt: 'desc' }
        });

        res.json({
            success: true,
            achievements
        });

    } catch (error) {
        console.error('Achievements retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve achievements',
            error: error.message
        });
    }
});

// Get user privacy settings
router.get('/profile/:userId/privacy', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Users can only view their own privacy settings
        if (requestingUser.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Can only view own privacy settings'
            });
        }

        const profile = await prisma.userProfile.findUnique({
            where: { userId },
            select: { privacySettings: true }
        });

        res.json({
            success: true,
            privacySettings: profile?.privacySettings || {}
        });

    } catch (error) {
        console.error('Privacy settings retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve privacy settings',
            error: error.message
        });
    }
});

// Update user privacy settings
router.put('/profile/:userId/privacy', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;
        const { privacySettings } = req.body;

        // Users can only update their own privacy settings
        if (requestingUser.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Can only update own privacy settings'
            });
        }

        await prisma.userProfile.upsert({
            where: { userId },
            update: {
                privacySettings,
                updatedAt: new Date()
            },
            create: {
                userId,
                privacySettings,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Privacy settings updated successfully'
        });

    } catch (error) {
        console.error('Privacy settings update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update privacy settings',
            error: error.message
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'User Profile Management System is healthy',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /profile/:userId - Get user profile',
            'PUT /profile/:userId - Create/update profile',
            'POST /profile/:userId/photo - Upload profile photo',
            'GET /profile/:userId/skills - Get user skills',
            'GET /profile/:userId/achievements - Get user achievements',
            'GET /profile/:userId/privacy - Get privacy settings',
            'PUT /profile/:userId/privacy - Update privacy settings'
        ]
    });
});

module.exports = router;
