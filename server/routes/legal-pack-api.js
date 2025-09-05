const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/health', async(req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'healthy',
            service: 'legal-pack-api',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            service: 'legal-pack-api',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get user's legal pack status
router.get('/status/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const [legalPack, nda, consents] = await Promise.all([
            prisma.platformLegalPack.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.platformNDA.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.eSignatureConsent.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        res.json({
            success: true,
            data: {
                legalPack: legalPack || null,
                nda: nda || null,
                consents: consents || [],
                                isComplete: legalPack?.status === 'SIGNED' && 
                   nda?.status === 'SIGNED' && 
                   consents.length > 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch legal pack status',
            details: error.message
        });
    }
});

// Sign platform legal pack
router.post('/sign', async(req, res) => {
    try {
        const { userId, ipAddress, userAgent } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: userId'
            });
        }

        // Check if user already has a signed legal pack
        const existingLegalPack = await prisma.platformLegalPack.findFirst({
            where: {
                userId,
                status: 'SIGNED'
            }
        });

        if (existingLegalPack) {
            return res.status(400).json({
                success: false,
                error: 'User already has a signed legal pack'
            });
        }

        // Create new legal pack
        const legalPack = await prisma.platformLegalPack.create({
            data: {
                userId,
                status: 'SIGNED',
                signedAt: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            }
        });

        res.status(201).json({
            success: true,
            data: legalPack,
            message: 'Platform legal pack signed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to sign legal pack',
            details: error.message
        });
    }
});

// Sign platform NDA
router.post('/nda/sign', async(req, res) => {
    try {
        const { userId, ipAddress, userAgent } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: userId'
            });
        }

        // Check if user already has a signed NDA
        const existingNDA = await prisma.platformNDA.findFirst({
            where: {
                userId,
                status: 'SIGNED'
            }
        });

        if (existingNDA) {
            return res.status(400).json({
                success: false,
                error: 'User already has a signed NDA'
            });
        }

        // Create new NDA
        const nda = await prisma.platformNDA.create({
            data: {
                userId,
                status: 'SIGNED',
                signedAt: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            }
        });

        res.status(201).json({
            success: true,
            data: nda,
            message: 'Platform NDA signed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to sign NDA',
            details: error.message
        });
    }
});

// Grant e-signature consent
router.post('/consent', async(req, res) => {
    try {
        const { userId, consentType, ipAddress, userAgent } = req.body;

        if (!userId || !consentType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, consentType'
            });
        }

        // Check if user already has this consent type
        const existingConsent = await prisma.eSignatureConsent.findFirst({
            where: {
                userId,
                consentType,
                status: 'GRANTED'
            }
        });

        if (existingConsent) {
            return res.status(400).json({
                success: false,
                error: 'User already has this consent type'
            });
        }

        // Create new consent
        const consent = await prisma.eSignatureConsent.create({
            data: {
                userId,
                consentType,
                status: 'GRANTED',
                signedAt: new Date(),
                ipAddress,
                userAgent
            }
        });

        res.status(201).json({
            success: true,
            data: consent,
            message: 'E-signature consent granted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to grant consent',
            details: error.message
        });
    }
});

// Get user's consents
router.get('/consents/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const consents = await prisma.eSignatureConsent.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: consents,
            count: consents.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch consents',
            details: error.message
        });
    }
});

// Revoke consent
router.patch('/consent/:consentId/revoke', async(req, res) => {
    try {
        const { consentId } = req.params;

        const consent = await prisma.eSignatureConsent.update({
            where: { id: consentId },
            data: { status: 'REVOKED' }
        });

        res.json({
            success: true,
            data: consent,
            message: 'Consent revoked successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to revoke consent',
            details: error.message
        });
    }
});

// Get all legal packs (public endpoint)
router.get('/packs', async(req, res) => {
    try {
        const legalPacks = await prisma.platformLegalPack.findMany({
            select: {
                id: true,
                userId: true,
                status: true,
                signedAt: true,
                expiresAt: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            packs: legalPacks,
            count: legalPacks.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching legal packs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch legal packs',
            message: error.message
        });
    }
});

// Get all legal packs (admin)
router.get('/legal-packs', async(req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = status ? { status } : {};

        const [legalPacks, total] = await Promise.all([
            prisma.platformLegalPack.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.platformLegalPack.count({ where })
        ]);

        res.json({
            success: true,
            data: legalPacks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch legal packs',
            details: error.message
        });
    }
});

// Get all NDAs (admin)
router.get('/ndas', async(req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = status ? { status } : {};

        const [ndas, total] = await Promise.all([
            prisma.platformNDA.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.platformNDA.count({ where })
        ]);

        res.json({
            success: true,
            data: ndas,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch NDAs',
            details: error.message
        });
    }
});

// Get all consents (admin)
router.get('/consents', async(req, res) => {
    try {
        const { status, consentType, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (consentType) where.consentType = consentType;

        const [consents, total] = await Promise.all([
            prisma.eSignatureConsent.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.eSignatureConsent.count({ where })
        ]);

        res.json({
            success: true,
            data: consents,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch consents',
            details: error.message
        });
    }
});

// Get legal pack templates
router.get('/templates', async(req, res) => {
    try {
        const templates = [
            {
                id: 'platform-participation',
                title: 'Platform Participation Agreement (PPA)',
                description: 'Core terms for using the AliceSolutions Ventures platform',
                required: true,
                icon: '📋',
                content: `AliceSolutions Ventures — Platform Participation Agreement (PPA)
(Terms of Membership & Contribution for the "Hub")

Effective Date: When the Member accepts electronically in the Hub.
Parties: AliceSolutions Ventures Inc. ("AliceSolutions", "we/us")
The business user or individual acting for a business who accepts these terms ("Member", "you").

1) Purpose & Scope
The Hub provides a secure platform for discovering ventures/projects, subscribing, proposing contributions, 
collaborating under project-specific NDAs/addenda, and tracking rewards. This PPA governs membership, 
payments, acceptable use, contribution/IP, security, liability, and enforcement across the platform.

2) Account, Identity, and Security
- Accurate info: You'll keep account, billing, and contact details current
- MFA required: Multi-factor authentication is mandatory for access to any non-public content
- Access control: Accounts are individual; sharing credentials is prohibited
- Device & posture: For sensitive projects, we may require device encryption, current patches, and other posture checks before access
- Audit: Actions in the Hub may be logged for security, compliance, and dispute resolution

3) Subscriptions, Billing & Taxes
- Plans: You select a plan (e.g., Member / Pro / Founder). Plan features and limits are shown in the Hub
- Fees & renewal: Fees are billed in advance and auto-renew each term unless cancelled per Hub instructions
- Non-payment: If a charge fails, we may suspend or downgrade capabilities after a grace period
- Taxes: Prices exclude applicable taxes; you're responsible for them

4) Acceptable Use & Community Standards
You agree not to:
- breach the Legal Pack, attempt unauthorized access, defeat security, or misuse credentials
- upload malicious code, attempt data scraping/exfiltration, or use automation to harvest content
- disclose or export non-public materials outside Designated Systems
- harass, defame, or discriminate; or violate IP, privacy, or other laws
- use third-party AI/LLM tools with Confidential Information unless they are explicitly approved

5) Contributions, IP & Licensing
- Your Background IP: Pre-existing IP you bring remains yours
- Foreground IP: All new work product created for the project is assigned to the project owner upon acceptance
- No conflict: You represent you can grant the above rights and your contributions won't knowingly infringe third-party IP

By signing this agreement, you acknowledge that you have read, understood, and agree to be bound by these terms.`
            },
            {
                id: 'platform-nda',
                title: 'Mutual Confidentiality & Non-Exfiltration Agreement',
                description: 'Confidentiality obligations for platform access',
                required: true,
                icon: '🔒',
                content: `Mutual Confidentiality & Non-Exfiltration Agreement
(Internal—AliceSolutions Ventures & Participants)

Effective Date: The date the first Participant signs this Agreement electronically or physically.
Parties: AliceSolutions Ventures Inc. ("AliceSolutions"); and
Each individual or entity that executes this Agreement (each a "Participant").

1. Purpose
The Parties wish to explore, evaluate, build, or contribute to ventures and projects within the 
AliceSolutions ecosystem. In doing so, the Parties may disclose or access Confidential Information. 
This Agreement sets the rules for using, protecting, and returning that information and prohibits 
exfiltration or misuse.

2. Key Definitions
2.1 "Confidential Information" means any non-public information disclosed or made accessible, 
directly or indirectly, by one Party ("Discloser") to another Party ("Recipient"), in any form 
(oral, written, visual, electronic, tangible), including without limitation:
- technical data, source code, repositories, designs, product plans, roadmaps, business strategies, 
  pricing, P&L and financials, customer lists, marketing plans, operating procedures, security 
  architecture, access credentials, logs, and any materials labelled or reasonably understood as confidential
- information made available through Designated Systems, even if not expressly marked
- personal information (as defined under applicable privacy laws) contained in or accompanying the above

2.2 "Designated Systems" means the systems, tools, and storage locations explicitly approved by 
AliceSolutions or the Project Lead for hosting, accessing, or processing Confidential Information.

3. Non-Disclosure, Non-Use & Need-to-Know
3.1 Non-Disclosure: Recipient must not disclose any Confidential Information to anyone except its 
own personnel and subcontractors who have a strict need-to-know for the Purpose and are bound by 
written obligations at least as protective as this Agreement.

3.2 Non-Use: Recipient must use Confidential Information solely for the Purpose and not for any 
other purpose (including personal use, competition, or development outside the AliceSolutions ecosystem).

4. Non-Exfiltration (Security & Handling Rules)
4.1 Approved Environments Only: Recipient will access, process, store, transmit, and collaborate 
on Confidential Information only through Designated Systems.

4.2 Technical Controls: Recipient will maintain MFA on all accounts accessing Designated Systems, 
keep operating systems and security patches current, use device encryption on endpoints that cache 
or access Confidential Information, and comply with DLP, watermarking, and access-logging controls.

4.3 AI/LLM & Automation: No uploading of Confidential Information to external AI/LLM or automation 
services unless the service is expressly approved as a Designated System and bound by terms that 
prohibit training on the data and ensure confidentiality and deletion on demand.

5. Term; Survival
5.1 Term: This Agreement begins on the Effective Date for each Participant and continues until 
terminated as to that Participant on 10 days' written notice to AliceSolutions.

5.2 Survival Period: Recipient's duties survive for five (5) years from the Recipient's last access 
to the relevant Confidential Information; trade secrets survive as long as they remain trade secrets.

By signing this agreement, you acknowledge the sensitive nature of the information and agree to maintain its confidentiality.`
            },
            {
                id: 'inventions-ip',
                title: 'Inventions & Intellectual Property',
                description: 'IP ownership and assignment terms',
                required: true,
                icon: '💡',
                content: `INVENTIONS & INTELLECTUAL PROPERTY AGREEMENT

This agreement governs the ownership and assignment of intellectual property created through platform use.

INTELLECTUAL PROPERTY RIGHTS:

1. BACKGROUND IP
- You retain ownership of intellectual property you owned before using the platform
- You may use your Background IP in connection with platform activities
- You represent that you have the right to use your Background IP

2. FOREGROUND IP
- Intellectual property created through platform use is governed by project-specific agreements
- Default ownership depends on the nature of the contribution
- Specific terms are outlined in individual project NDAs

3. PLATFORM IP
- We retain all rights to the platform, including software, algorithms, and processes
- You may not reverse engineer or attempt to extract platform IP
- Any improvements to the platform become our property

4. OPEN SOURCE COMPLIANCE
- You must comply with all applicable open source licenses
- You must disclose any open source components in your contributions
- You may not incorporate GPL-licensed code without proper disclosure

5. ASSIGNMENT
- For work-for-hire projects, IP is assigned to the project owner
- For collaborative projects, IP is shared according to contribution agreements
- You grant necessary licenses for platform operation

6. MORAL RIGHTS
- You waive moral rights to the extent permitted by law
- You consent to modifications of your contributions
- You agree not to assert moral rights against us or other users

By signing this agreement, you understand the IP framework and agree to its terms.`
            }
        ];

        res.json({
            success: true,
            data: templates,
            count: templates.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch legal pack templates',
            details: error.message
        });
    }
});

module.exports = router;