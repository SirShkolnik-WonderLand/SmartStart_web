const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

// Email configuration (you'll need to set up your email service)
const emailTransporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ===== TEAM INVITATION SYSTEM =====

// Create team invitation
router.post('/invite', authenticateToken, async(req, res) => {
    try {
        const {
            teamId,
            ventureId,
            invitedUserId,
            role = 'MEMBER',
            permissions = [],
            message,
            expiresInDays = 7
        } = req.body;

        // Validate required fields
        if (!teamId || !invitedUserId) {
            return res.status(400).json({
                success: false,
                message: 'teamId and invitedUserId are required'
            });
        }

        // Check if user is already a team member
        const existingMember = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId: invitedUserId
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'User is already a team member'
            });
        }

        // Check if invitation already exists
        const existingInvitation = await prisma.teamInvitation.findFirst({
            where: {
                teamId,
                invitedUserId,
                status: 'pending'
            }
        });

        if (existingInvitation) {
            return res.status(400).json({
                success: false,
                message: 'Invitation already exists for this user'
            });
        }

        // Create invitation
        const invitation = await prisma.teamInvitation.create({
            data: {
                teamId,
                ventureId,
                invitedUserId,
                invitedByUserId: req.user.id,
                role,
                permissions,
                message: message || 'You have been invited to join our team!',
                expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
                status: 'pending'
            },
            include: {
                invitedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        purpose: true
                    }
                }
            }
        });

        // Send email notification
        try {
            await emailTransporter.sendMail({
                from: process.env.EMAIL_USER,
                to: invitation.invitedUser.email,
                subject: `Team Invitation: ${invitation.team.name}`,
                html: `
          <h2>You've been invited to join ${invitation.team.name}!</h2>
          <p>${invitation.message}</p>
          <p><strong>Role:</strong> ${role}</p>
          <p><strong>Team Purpose:</strong> ${invitation.team.purpose}</p>
          <p>Click the link below to accept or decline the invitation:</p>
          <a href="${process.env.FRONTEND_URL}/teams/invitations/${invitation.id}">View Invitation</a>
          <p><small>This invitation expires on ${invitation.expiresAt.toLocaleDateString()}</small></p>
        `
            });
        } catch (emailError) {
            console.warn('Failed to send invitation email:', emailError);
            // Don't fail the request if email fails
        }

        res.json({
            success: true,
            message: 'Invitation sent successfully',
            invitation,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Team invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create team invitation',
            error: error.message
        });
    }
});

// Get team invitations
router.get('/team/:teamId', authenticateToken, async(req, res) => {
    try {
        const { teamId } = req.params;
        const { status, limit = 20, offset = 0 } = req.query;

        const where = { teamId };
        if (status) where.status = status;

        const invitations = await prisma.teamInvitation.findMany({
            where,
            include: {
                invitedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                invitedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        const total = await prisma.teamInvitation.count({ where });

        res.json({
            success: true,
            invitations,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: offset + invitations.length < total
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Get team invitations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get team invitations',
            error: error.message
        });
    }
});

// Get user invitations
router.get('/user/:userId', authenticateToken, async(req, res) => {
    try {
        const { userId } = req.params;
        const { status, limit = 20, offset = 0 } = req.query;

        const where = { invitedUserId: userId };
        if (status) where.status = status;

        const invitations = await prisma.teamInvitation.findMany({
            where,
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        purpose: true,
                        company: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                invitedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        const total = await prisma.teamInvitation.count({ where });

        res.json({
            success: true,
            invitations,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: offset + invitations.length < total
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Get user invitations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user invitations',
            error: error.message
        });
    }
});

// Accept invitation
router.post('/:invitationId/accept', authenticateToken, async(req, res) => {
    try {
        const { invitationId } = req.params;

        // Get invitation
        const invitation = await prisma.teamInvitation.findUnique({
            where: { id: invitationId },
            include: {
                team: true,
                invitedUser: true
            }
        });

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Invitation is no longer pending'
            });
        }

        if (invitation.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invitation has expired'
            });
        }

        // Check if user is already a team member
        const existingMember = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId: invitation.teamId,
                    userId: invitation.invitedUserId
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'User is already a team member'
            });
        }

        // Create team member
        const teamMember = await prisma.teamMember.create({
            data: {
                teamId: invitation.teamId,
                userId: invitation.invitedUserId,
                role: invitation.role,
                permissions: invitation.permissions,
                joinedAt: new Date()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Update invitation status
        await prisma.teamInvitation.update({
            where: { id: invitationId },
            data: {
                status: 'accepted',
                acceptedAt: new Date()
            }
        });

        // Add XP for joining team
        try {
            const gamificationResponse = await fetch(`${process.env.API_BASE_URL}/api/gamification/xp/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${req.token}`
                },
                body: JSON.stringify({
                    userId: invitation.invitedUserId,
                    activityType: 'TEAM_JOIN',
                    amount: 100
                })
            });
        } catch (xpError) {
            console.warn('Failed to add XP for team join:', xpError);
        }

        res.json({
            success: true,
            message: 'Invitation accepted successfully',
            teamMember,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept invitation',
            error: error.message
        });
    }
});

// Decline invitation
router.post('/:invitationId/decline', authenticateToken, async(req, res) => {
    try {
        const { invitationId } = req.params;

        // Get invitation
        const invitation = await prisma.teamInvitation.findUnique({
            where: { id: invitationId }
        });

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Invitation is no longer pending'
            });
        }

        // Update invitation status
        await prisma.teamInvitation.update({
            where: { id: invitationId },
            data: {
                status: 'declined',
                declinedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Invitation declined successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Decline invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to decline invitation',
            error: error.message
        });
    }
});

// Cancel invitation
router.delete('/:invitationId', authenticateToken, async(req, res) => {
    try {
        const { invitationId } = req.params;

        // Get invitation
        const invitation = await prisma.teamInvitation.findUnique({
            where: { id: invitationId }
        });

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        // Check if user has permission to cancel (team lead or invitation creator)
        const teamMember = await prisma.teamMember.findFirst({
            where: {
                teamId: invitation.teamId,
                userId: req.user.id,
                role: { in: ['LEAD', 'ADMIN'] }
            }
        });

        if (!teamMember && invitation.invitedByUserId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to cancel this invitation'
            });
        }

        // Delete invitation
        await prisma.teamInvitation.delete({
            where: { id: invitationId }
        });

        res.json({
            success: true,
            message: 'Invitation cancelled successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Cancel invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel invitation',
            error: error.message
        });
    }
});

// Get invitation by ID
router.get('/:invitationId', authenticateToken, async(req, res) => {
    try {
        const { invitationId } = req.params;

        const invitation = await prisma.teamInvitation.findUnique({
            where: { id: invitationId },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        purpose: true,
                        company: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                invitedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                invitedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        res.json({
            success: true,
            invitation,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Get invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get invitation',
            error: error.message
        });
    }
});

// Health check
router.get('/health', async(req, res) => {
    try {
        const stats = {
            totalInvitations: await prisma.teamInvitation.count(),
            pendingInvitations: await prisma.teamInvitation.count({
                where: { status: 'pending' }
            }),
            acceptedInvitations: await prisma.teamInvitation.count({
                where: { status: 'accepted' }
            }),
            declinedInvitations: await prisma.teamInvitation.count({
                where: { status: 'declined' }
            })
        };

        res.json({
            success: true,
            message: 'Team Invitations API is healthy',
            stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team invitations health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Team invitations health check failed',
            error: error.message
        });
    }
});

module.exports = router;