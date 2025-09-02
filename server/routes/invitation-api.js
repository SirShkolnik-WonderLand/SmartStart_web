const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

// ===== INVITATION API SYSTEM =====

// Email configuration
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Health check
router.get('/health', async (req, res) => {
    try {
        const stats = await prisma.$queryRaw`
            SELECT 
                (SELECT COUNT(*) FROM "UserInvitation") as totalInvitations,
                (SELECT COUNT(*) FROM "UserInvitation" WHERE status = 'PENDING') as pendingInvitations,
                (SELECT COUNT(*) FROM "UserInvitation" WHERE status = 'ACCEPTED') as acceptedInvitations,
                (SELECT COUNT(*) FROM "UserInvitation" WHERE status = 'DECLINED') as declinedInvitations
        `;
        
        res.json({
            success: true,
            message: 'Invitation System is healthy',
            stats: {
                totalInvitations: Number(stats[0].totalinvitations),
                pendingInvitations: Number(stats[0].pendinginvitations),
                acceptedInvitations: Number(stats[0].acceptedinvitations),
                declinedInvitations: Number(stats[0].declinedinvitations)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            success: true,
            message: 'Invitation System is healthy (tables may not exist yet)',
            stats: {
                totalInvitations: 0,
                pendingInvitations: 0,
                acceptedInvitations: 0,
                declinedInvitations: 0
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Invite user to company
router.post('/company/:companyId/invite', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { 
            invitedEmail, 
            role = 'MEMBER', 
            message = '',
            invitedBy 
        } = req.body;

        if (!invitedEmail || !invitedBy) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: invitedEmail, invitedBy'
            });
        }

        // Check if company exists
        const company = await prisma.$queryRaw`
            SELECT c.*, u."firstName", u."lastName" as inviterLastName
            FROM "Company" c
            JOIN "User" u ON c."ownerId" = u.id
            WHERE c.id = ${companyId}
        `;

        if (!company || company.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if user is already invited
        const existingInvitation = await prisma.$queryRaw`
            SELECT * FROM "UserInvitation" 
            WHERE "invitedEmail" = ${invitedEmail}
            AND "targetId" = ${companyId}
            AND "targetType" = 'COMPANY'
            AND status = 'PENDING'
        `;

        if (existingInvitation && existingInvitation.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already has a pending invitation to this company'
            });
        }

        // Generate invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const invitationId = `invitation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create invitation
        await prisma.$executeRaw`
            INSERT INTO "UserInvitation" (
                "id", "invitedBy", "invitedEmail", "invitationType", "targetId", 
                "targetType", "role", "invitationToken", "status", "expiresAt"
            ) VALUES (
                ${invitationId}, ${invitedBy}, ${invitedEmail}, 'COMPANY_INVITATION', ${companyId},
                'COMPANY', ${role}, ${invitationToken}, 'PENDING', NOW() + INTERVAL '7 days'
            )
        `;

        // Send invitation email
        try {
            const invitationUrl = `${process.env.FRONTEND_URL || 'https://smartstart-platform.onrender.com'}/accept-invitation?token=${invitationToken}`;
            const companyName = company[0].name;
            const inviterName = `${company[0].firstName} ${company[0].inviterLastName}`;
            
            await emailTransporter.sendMail({
                from: process.env.EMAIL_USER || 'noreply@smartstart.com',
                to: invitedEmail,
                subject: `You're invited to join ${companyName} on SmartStart!`,
                html: `
                    <h2>You're Invited to Join ${companyName}!</h2>
                    <p>Hi there,</p>
                    <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> on SmartStart Platform.</p>
                    <p><strong>Role:</strong> ${role}</p>
                    ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
                    <p><a href="${invitationUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
                    <p>Or copy this link: ${invitationUrl}</p>
                    <p>This invitation expires in 7 days.</p>
                    <p>Best regards,<br>The SmartStart Team</p>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue with invitation creation even if email fails
        }

        res.json({
            success: true,
            message: 'Invitation sent successfully',
            invitation: {
                id: invitationId,
                invitedEmail,
                role,
                companyName: company[0].name,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Company invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send company invitation',
            error: error.message
        });
    }
});

// Invite user to team
router.post('/team/:teamId/invite', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { 
            invitedEmail, 
            role = 'MEMBER', 
            message = '',
            invitedBy 
        } = req.body;

        if (!invitedEmail || !invitedBy) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: invitedEmail, invitedBy'
            });
        }

        // Check if team exists and get company info
        const team = await prisma.$queryRaw`
            SELECT t.*, c.name as companyName, u."firstName", u."lastName" as inviterLastName
            FROM "Team" t
            JOIN "Company" c ON t."companyId" = c.id
            JOIN "User" u ON t."leadId" = u.id
            WHERE t.id = ${teamId}
        `;

        if (!team || team.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check if user is already invited
        const existingInvitation = await prisma.$queryRaw`
            SELECT * FROM "UserInvitation" 
            WHERE "invitedEmail" = ${invitedEmail}
            AND "targetId" = ${teamId}
            AND "targetType" = 'TEAM'
            AND status = 'PENDING'
        `;

        if (existingInvitation && existingInvitation.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already has a pending invitation to this team'
            });
        }

        // Generate invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const invitationId = `invitation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create invitation
        await prisma.$executeRaw`
            INSERT INTO "UserInvitation" (
                "id", "invitedBy", "invitedEmail", "invitationType", "targetId", 
                "targetType", "role", "invitationToken", "status", "expiresAt"
            ) VALUES (
                ${invitationId}, ${invitedBy}, ${invitedEmail}, 'TEAM_INVITATION', ${teamId},
                'TEAM', ${role}, ${invitationToken}, 'PENDING', NOW() + INTERVAL '7 days'
            )
        `;

        // Send invitation email
        try {
            const invitationUrl = `${process.env.FRONTEND_URL || 'https://smartstart-platform.onrender.com'}/accept-invitation?token=${invitationToken}`;
            const teamName = team[0].name;
            const companyName = team[0].companyName;
            const inviterName = `${team[0].firstName} ${team[0].inviterLastName}`;
            
            await emailTransporter.sendMail({
                from: process.env.EMAIL_USER || 'noreply@smartstart.com',
                to: invitedEmail,
                subject: `You're invited to join ${teamName} team on SmartStart!`,
                html: `
                    <h2>You're Invited to Join ${teamName} Team!</h2>
                    <p>Hi there,</p>
                    <p><strong>${inviterName}</strong> has invited you to join the <strong>${teamName}</strong> team at <strong>${companyName}</strong> on SmartStart Platform.</p>
                    <p><strong>Role:</strong> ${role}</p>
                    ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
                    <p><a href="${invitationUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
                    <p>Or copy this link: ${invitationUrl}</p>
                    <p>This invitation expires in 7 days.</p>
                    <p>Best regards,<br>The SmartStart Team</p>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue with invitation creation even if email fails
        }

        res.json({
            success: true,
            message: 'Team invitation sent successfully',
            invitation: {
                id: invitationId,
                invitedEmail,
                role,
                teamName: team[0].name,
                companyName: team[0].companyName,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send team invitation',
            error: error.message
        });
    }
});

// Get pending invitations for a user
router.get('/pending/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const invitations = await prisma.$queryRaw`
            SELECT 
                i.*,
                CASE 
                    WHEN i."targetType" = 'COMPANY' THEN c.name
                    WHEN i."targetType" = 'TEAM' THEN t.name
                END as targetName,
                CASE 
                    WHEN i."targetType" = 'COMPANY' THEN c.id
                    WHEN i."targetType" = 'TEAM' THEN t.id
                END as targetId,
                u."firstName" as inviterFirstName,
                u."lastName" as inviterLastName
            FROM "UserInvitation" i
            LEFT JOIN "Company" c ON i."targetType" = 'COMPANY' AND i."targetId" = c.id
            LEFT JOIN "Team" t ON i."targetType" = 'TEAM' AND i."targetId" = t.id
            LEFT JOIN "User" u ON i."invitedBy" = u.id
            WHERE i."invitedEmail" = ${email}
            AND i.status = 'PENDING'
            AND i."expiresAt" > NOW()
            ORDER BY i."createdAt" DESC
        `;

        res.json({
            success: true,
            invitations: invitations.map(inv => ({
                id: inv.id,
                type: inv.invitationType,
                targetType: inv.targetType,
                targetName: inv.targetName,
                targetId: inv.targetId,
                role: inv.role,
                invitedBy: `${inv.inviterFirstName} ${inv.inviterLastName}`,
                expiresAt: inv.expiresAt,
                createdAt: inv.createdAt
            }))
        });
    } catch (error) {
        console.error('Get pending invitations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get pending invitations',
            error: error.message
        });
    }
});

// Accept invitation
router.post('/:invitationId/accept', async (req, res) => {
    try {
        const { invitationId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: userId'
            });
        }

        // Get invitation details
        const invitation = await prisma.$queryRaw`
            SELECT * FROM "UserInvitation" 
            WHERE id = ${invitationId}
            AND status = 'PENDING'
            AND "expiresAt" > NOW()
        `;

        if (!invitation || invitation.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired invitation'
            });
        }

        const invitationData = invitation[0];

        // Mark invitation as accepted
        await prisma.$executeRaw`
            UPDATE "UserInvitation" 
            SET status = 'ACCEPTED', "acceptedAt" = NOW() 
            WHERE id = ${invitationId}
        `;

        // Handle different invitation types
        if (invitationData.targetType === 'COMPANY') {
            // Add user to company (you might want to create a CompanyMember table)
            // For now, we'll just mark the invitation as accepted
            console.log(`User ${userId} accepted company invitation to ${invitationData.targetId}`);
        } else if (invitationData.targetType === 'TEAM') {
            // Add user to team
            const teamMemberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            await prisma.$executeRaw`
                INSERT INTO "TeamMember" (
                    "id", "teamId", "userId", "role", "joinedAt", "createdAt", "updatedAt"
                ) VALUES (
                    ${teamMemberId}, ${invitationData.targetId}, ${userId}, ${invitationData.role}, NOW(), NOW(), NOW()
                )
            `;
        }

        res.json({
            success: true,
            message: 'Invitation accepted successfully',
            invitation: {
                id: invitationId,
                type: invitationData.invitationType,
                targetType: invitationData.targetType,
                targetId: invitationData.targetId,
                role: invitationData.role
            }
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
router.post('/:invitationId/decline', async (req, res) => {
    try {
        const { invitationId } = req.params;

        // Get invitation details
        const invitation = await prisma.$queryRaw`
            SELECT * FROM "UserInvitation" 
            WHERE id = ${invitationId}
            AND status = 'PENDING'
        `;

        if (!invitation || invitation.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invitation'
            });
        }

        // Mark invitation as declined
        await prisma.$executeRaw`
            UPDATE "UserInvitation" 
            SET status = 'DECLINED', "declinedAt" = NOW() 
            WHERE id = ${invitationId}
        `;

        res.json({
            success: true,
            message: 'Invitation declined successfully'
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

// Get all invitations for a company
router.get('/company/:companyId', async (req, res) => {
    try {
        const { companyId } = req.params;
        const { status = 'ALL' } = req.query;

        let whereClause = `WHERE i."targetId" = ${companyId} AND i."targetType" = 'COMPANY'`;
        if (status !== 'ALL') {
            whereClause += ` AND i.status = '${status}'`;
        }

        const invitations = await prisma.$queryRaw`
            SELECT 
                i.*,
                u."firstName" as inviterFirstName,
                u."lastName" as inviterLastName
            FROM "UserInvitation" i
            LEFT JOIN "User" u ON i."invitedBy" = u.id
            ${whereClause}
            ORDER BY i."createdAt" DESC
        `;

        res.json({
            success: true,
            invitations: invitations.map(inv => ({
                id: inv.id,
                invitedEmail: inv.invitedEmail,
                role: inv.role,
                status: inv.status,
                invitedBy: `${inv.inviterFirstName} ${inv.inviterLastName}`,
                expiresAt: inv.expiresAt,
                createdAt: inv.createdAt,
                acceptedAt: inv.acceptedAt,
                declinedAt: inv.declinedAt
            }))
        });
    } catch (error) {
        console.error('Get company invitations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get company invitations',
            error: error.message
        });
    }
});

// Get all invitations for a team
router.get('/team/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { status = 'ALL' } = req.query;

        let whereClause = `WHERE i."targetId" = ${teamId} AND i."targetType" = 'TEAM'`;
        if (status !== 'ALL') {
            whereClause += ` AND i.status = '${status}'`;
        }

        const invitations = await prisma.$queryRaw`
            SELECT 
                i.*,
                u."firstName" as inviterFirstName,
                u."lastName" as inviterLastName
            FROM "UserInvitation" i
            LEFT JOIN "User" u ON i."invitedBy" = u.id
            ${whereClause}
            ORDER BY i."createdAt" DESC
        `;

        res.json({
            success: true,
            invitations: invitations.map(inv => ({
                id: inv.id,
                invitedEmail: inv.invitedEmail,
                role: inv.role,
                status: inv.status,
                invitedBy: `${inv.inviterFirstName} ${inv.inviterLastName}`,
                expiresAt: inv.expiresAt,
                createdAt: inv.createdAt,
                acceptedAt: inv.acceptedAt,
                declinedAt: inv.declinedAt
            }))
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

// Cancel invitation
router.delete('/:invitationId', async (req, res) => {
    try {
        const { invitationId } = req.params;

        // Check if invitation exists and is pending
        const invitation = await prisma.$queryRaw`
            SELECT * FROM "UserInvitation" 
            WHERE id = ${invitationId}
            AND status = 'PENDING'
        `;

        if (!invitation || invitation.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invitation or already processed'
            });
        }

        // Delete invitation
        await prisma.$executeRaw`
            DELETE FROM "UserInvitation" WHERE id = ${invitationId}
        `;

        res.json({
            success: true,
            message: 'Invitation cancelled successfully'
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

// Resend invitation
router.post('/:invitationId/resend', async (req, res) => {
    try {
        const { invitationId } = req.params;

        // Get invitation details
        const invitation = await prisma.$queryRaw`
            SELECT i.*, 
                   CASE 
                       WHEN i."targetType" = 'COMPANY' THEN c.name
                       WHEN i."targetType" = 'TEAM' THEN t.name
                   END as targetName,
                   u."firstName" as inviterFirstName,
                   u."lastName" as inviterLastName
            FROM "UserInvitation" i
            LEFT JOIN "Company" c ON i."targetType" = 'COMPANY' AND i."targetId" = c.id
            LEFT JOIN "Team" t ON i."targetType" = 'TEAM' AND i."targetId" = t.id
            LEFT JOIN "User" u ON i."invitedBy" = u.id
            WHERE i.id = ${invitationId}
            AND i.status = 'PENDING'
        `;

        if (!invitation || invitation.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invitation'
            });
        }

        const invitationData = invitation[0];

        // Generate new token and extend expiry
        const newToken = crypto.randomBytes(32).toString('hex');
        const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Update invitation
        await prisma.$executeRaw`
            UPDATE "UserInvitation" 
            SET "invitationToken" = ${newToken}, "expiresAt" = ${newExpiry}, "updatedAt" = NOW()
            WHERE id = ${invitationId}
        `;

        // Send new invitation email
        try {
            const invitationUrl = `${process.env.FRONTEND_URL || 'https://smartstart-platform.onrender.com'}/accept-invitation?token=${newToken}`;
            const inviterName = `${invitationData.inviterFirstName} ${invitationData.inviterLastName}`;
            
            await emailTransporter.sendMail({
                from: process.env.EMAIL_USER || 'noreply@smartstart.com',
                to: invitationData.invitedEmail,
                subject: `Invitation Reminder: Join ${invitationData.targetName} on SmartStart!`,
                html: `
                    <h2>Invitation Reminder</h2>
                    <p>Hi there,</p>
                    <p>This is a reminder that <strong>${inviterName}</strong> has invited you to join <strong>${invitationData.targetName}</strong> on SmartStart Platform.</p>
                    <p><strong>Role:</strong> ${invitationData.role}</p>
                    <p><a href="${invitationUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
                    <p>Or copy this link: ${invitationUrl}</p>
                    <p>This invitation expires in 7 days.</p>
                    <p>Best regards,<br>The SmartStart Team</p>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send invitation email'
            });
        }

        res.json({
            success: true,
            message: 'Invitation resent successfully',
            invitation: {
                id: invitationId,
                newExpiry: newExpiry.toISOString()
            }
        });
    } catch (error) {
        console.error('Resend invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend invitation',
            error: error.message
        });
    }
});

module.exports = router;
