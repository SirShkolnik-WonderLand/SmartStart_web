const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Meetings API Routes
 * Handles meeting scheduling, management, and organization
 */

// Health check endpoint
router.get('/health', async(req, res) => {
    try {
        const meetingCount = await prisma.meeting.count();
        res.json({
            success: true,
            message: 'Meetings API is healthy',
            timestamp: new Date().toISOString(),
            totalMeetings: meetingCount
        });
    } catch (error) {
        console.error('Meetings API health check failed:', error);
        res.status(500).json({
            success: false,
            message: 'Meetings API health check failed',
            error: error.message
        });
    }
});

// Create a new meeting
router.post('/create', async(req, res) => {
    try {
        const meetingData = req.body;

        // Validate required fields
        if (!meetingData.title || !meetingData.ventureId || !meetingData.organizerId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, ventureId, organizerId'
            });
        }

        // Create the meeting
        const meeting = await prisma.meeting.create({
            data: {
                title: meetingData.title,
                description: meetingData.description || '',
                ventureId: meetingData.ventureId,
                organizerId: meetingData.organizerId,
                scheduledFor: new Date(meetingData.scheduledFor),
                duration: meetingData.duration || 60, // Default 60 minutes
                location: meetingData.location || 'Virtual',
                meetingType: meetingData.meetingType || 'GENERAL',
                status: 'SCHEDULED',
                agenda: meetingData.agenda || '',
                meetingLink: meetingData.meetingLink || '',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            include: {
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                venture: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                attendees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        // Add attendees if provided
        if (meetingData.attendees && meetingData.attendees.length > 0) {
            const attendeeData = meetingData.attendees.map(attendeeId => ({
                meetingId: meeting.id,
                userId: attendeeId,
                status: 'INVITED',
                invitedAt: new Date()
            }));

            await prisma.meetingAttendee.createMany({
                data: attendeeData
            });
        }

        res.json({
            success: true,
            message: 'Meeting created successfully',
            meeting: {
                id: meeting.id,
                title: meeting.title,
                description: meeting.description,
                ventureId: meeting.ventureId,
                organizerId: meeting.organizerId,
                scheduledFor: meeting.scheduledFor,
                duration: meeting.duration,
                location: meeting.location,
                meetingType: meeting.meetingType,
                status: meeting.status,
                agenda: meeting.agenda,
                meetingLink: meeting.meetingLink,
                createdAt: meeting.createdAt,
                updatedAt: meeting.updatedAt
            }
        });

    } catch (error) {
        console.error('Failed to create meeting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create meeting',
            error: error.message
        });
    }
});

// Get meetings for a venture
router.get('/venture/:ventureId', async(req, res) => {
    try {
        const { ventureId } = req.params;
        const { status, upcoming } = req.query;

        let whereClause = { ventureId };
        
        if (status) {
            whereClause.status = status;
        }
        
        if (upcoming === 'true') {
            whereClause.scheduledFor = {
                gte: new Date()
            };
        }

        const meetings = await prisma.meeting.findMany({
            where: whereClause,
            include: {
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                venture: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                attendees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { scheduledFor: 'asc' }
        });

        res.json({
            success: true,
            message: 'Meetings retrieved successfully',
            meetings,
            count: meetings.length
        });

    } catch (error) {
        console.error('Failed to get meetings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get meetings',
            error: error.message
        });
    }
});

// Get meetings for a user
router.get('/user/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        const { status, upcoming } = req.query;

        let whereClause = {
            OR: [
                { organizerId: userId },
                { attendees: { some: { userId } } }
            ]
        };
        
        if (status) {
            whereClause.status = status;
        }
        
        if (upcoming === 'true') {
            whereClause.scheduledFor = {
                gte: new Date()
            };
        }

        const meetings = await prisma.meeting.findMany({
            where: whereClause,
            include: {
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                venture: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                attendees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { scheduledFor: 'asc' }
        });

        res.json({
            success: true,
            message: 'User meetings retrieved successfully',
            meetings,
            count: meetings.length
        });

    } catch (error) {
        console.error('Failed to get user meetings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user meetings',
            error: error.message
        });
    }
});

// Get meeting details
router.get('/:meetingId', async(req, res) => {
    try {
        const { meetingId } = req.params;

        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId },
            include: {
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                venture: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                attendees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        res.json({
            success: true,
            message: 'Meeting details retrieved successfully',
            meeting
        });

    } catch (error) {
        console.error('Failed to get meeting details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get meeting details',
            error: error.message
        });
    }
});

// Update meeting
router.put('/:meetingId', async(req, res) => {
    try {
        const { meetingId } = req.params;
        const updateData = req.body;

        // Validate that the meeting exists
        const existingMeeting = await prisma.meeting.findUnique({
            where: { id: meetingId }
        });

        if (!existingMeeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Update the meeting
        const updatedMeeting = await prisma.meeting.update({
            where: { id: meetingId },
            data: {
                title: updateData.title || existingMeeting.title,
                description: updateData.description || existingMeeting.description,
                scheduledFor: updateData.scheduledFor ? new Date(updateData.scheduledFor) : existingMeeting.scheduledFor,
                duration: updateData.duration || existingMeeting.duration,
                location: updateData.location || existingMeeting.location,
                meetingType: updateData.meetingType || existingMeeting.meetingType,
                status: updateData.status || existingMeeting.status,
                agenda: updateData.agenda || existingMeeting.agenda,
                meetingLink: updateData.meetingLink || existingMeeting.meetingLink,
                updatedAt: new Date()
            },
            include: {
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                venture: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                attendees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Meeting updated successfully',
            meeting: updatedMeeting
        });

    } catch (error) {
        console.error('Failed to update meeting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update meeting',
            error: error.message
        });
    }
});

// Add attendee to meeting
router.post('/:meetingId/attendees', async(req, res) => {
    try {
        const { meetingId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        // Check if attendee already exists
        const existingAttendee = await prisma.meetingAttendee.findFirst({
            where: {
                meetingId,
                userId
            }
        });

        if (existingAttendee) {
            return res.status(400).json({
                success: false,
                message: 'User is already an attendee of this meeting'
            });
        }

        // Add the attendee
        const attendee = await prisma.meetingAttendee.create({
            data: {
                meetingId,
                userId,
                status: 'INVITED',
                invitedAt: new Date()
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

        res.json({
            success: true,
            message: 'Attendee added successfully',
            attendee
        });

    } catch (error) {
        console.error('Failed to add attendee:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add attendee',
            error: error.message
        });
    }
});

// Update attendee status
router.put('/:meetingId/attendees/:userId', async(req, res) => {
    try {
        const { meetingId, userId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'status is required'
            });
        }

        const updatedAttendee = await prisma.meetingAttendee.updateMany({
            where: {
                meetingId,
                userId
            },
            data: {
                status,
                updatedAt: new Date()
            }
        });

        if (updatedAttendee.count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Attendee not found'
            });
        }

        res.json({
            success: true,
            message: 'Attendee status updated successfully'
        });

    } catch (error) {
        console.error('Failed to update attendee status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update attendee status',
            error: error.message
        });
    }
});

// Delete meeting
router.delete('/:meetingId', async(req, res) => {
    try {
        const { meetingId } = req.params;

        // Check if meeting exists
        const existingMeeting = await prisma.meeting.findUnique({
            where: { id: meetingId }
        });

        if (!existingMeeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Delete attendees first
        await prisma.meetingAttendee.deleteMany({
            where: { meetingId }
        });

        // Delete the meeting
        await prisma.meeting.delete({
            where: { id: meetingId }
        });

        res.json({
            success: true,
            message: 'Meeting deleted successfully'
        });

    } catch (error) {
        console.error('Failed to delete meeting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete meeting',
            error: error.message
        });
    }
});

// Get all meetings (admin)
router.get('/list/all', async(req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const [meetings, total] = await Promise.all([
            prisma.meeting.findMany({
                where: whereClause,
                include: {
                    organizer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    venture: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    attendees: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: { scheduledFor: 'desc' },
                skip: offset,
                take: parseInt(limit)
            }),
            prisma.meeting.count({ where: whereClause })
        ]);

        res.json({
            success: true,
            message: 'Meetings retrieved successfully',
            meetings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Failed to list meetings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list meetings',
            error: error.message
        });
    }
});

module.exports = router;
