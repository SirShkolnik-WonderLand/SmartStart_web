import express from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { StartupCoopService } from '../services/startupCoopService.js';

const router = express.Router();

// ============================================================================
// LEGAL ENTITY MANAGEMENT
// ============================================================================

// Create new legal entity
router.post('/legal-entities', authenticateToken, requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    const entityData = req.body;
    const entity = await StartupCoopService.createLegalEntity(entityData, req.user!.id);
    
    res.status(201).json({
      message: 'Legal entity created successfully',
      entity
    });
  } catch (error: any) {
    console.error('Create legal entity error:', error);
    res.status(500).json({ error: 'Failed to create legal entity', details: error.message });
  }
});

// Get all legal entities for user
router.get('/legal-entities', authenticateToken, async (req, res) => {
  try {
    const entities = await prisma.legalEntity.findMany({
      where: {
        members: {
          some: { userId: req.user!.id }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            summary: true
          }
        }
      }
    });

    res.json(entities);
  } catch (error: any) {
    console.error('Get legal entities error:', error);
    res.status(500).json({ error: 'Failed to get legal entities' });
  }
});

// Get legal entity by ID
router.get('/legal-entities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const entity = await prisma.legalEntity.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        projects: true,
        documents: {
          include: {
            signatures: true
          }
        }
      }
    });

    if (!entity) {
      return res.status(404).json({ error: 'Legal entity not found' });
    }

    // Check if user has access
    const hasAccess = entity.members.some(m => m.userId === req.user!.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(entity);
  } catch (error: any) {
    console.error('Get legal entity error:', error);
    res.status(500).json({ error: 'Failed to get legal entity' });
  }
});

// Get legal entity compliance status
router.get('/legal-entities/:id/compliance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const compliance = await StartupCoopService.getLegalEntityCompliance(id);
    
    res.json(compliance);
  } catch (error: any) {
    console.error('Get compliance error:', error);
    res.status(500).json({ error: 'Failed to get compliance status' });
  }
});

// ============================================================================
// STARTUP COOPERATIVE MANAGEMENT
// ============================================================================

// Create new startup cooperative
router.post('/coops', authenticateToken, requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    const coopData = req.body;
    const { legalEntityId } = req.body;
    
    const coop = await StartupCoopService.createStartupCoop(coopData, req.user!.id, legalEntityId);
    
    res.status(201).json({
      message: 'Startup cooperative created successfully',
      coop
    });
  } catch (error: any) {
    console.error('Create cooperative error:', error);
    res.status(500).json({ error: 'Failed to create cooperative', details: error.message });
  }
});

// Get all cooperatives for user
router.get('/coops', authenticateToken, async (req, res) => {
  try {
    const coops = await prisma.startupCoop.findMany({
      where: {
        members: {
          some: { userId: req.user!.id }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            summary: true
          }
        },
        legalEntity: true
      }
    });

    res.json(coops);
  } catch (error: any) {
    console.error('Get cooperatives error:', error);
    res.status(500).json({ error: 'Failed to get cooperatives' });
  }
});

// Get cooperative by ID
router.get('/coops/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const coop = await prisma.startupCoop.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        projects: true,
        governance: {
          include: {
            votes: true
          }
        },
        legalEntity: true
      }
    });

    if (!coop) {
      return res.status(404).json({ error: 'Cooperative not found' });
    }

    // Check if user has access
    const hasAccess = coop.members.some(m => m.userId === req.user!.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(coop);
  } catch (error: any) {
    console.error('Get cooperative error:', error);
    res.status(500).json({ error: 'Failed to get cooperative' });
  }
});

// Add member to cooperative
router.post('/coops/:id/members', authenticateToken, requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    const { id } = req.params;
    const memberData = req.body;
    
    // Check if user is member of cooperative
    const coop = await prisma.startupCoop.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!coop) {
      return res.status(404).json({ error: 'Cooperative not found' });
    }

    const isMember = coop.members.some(m => m.userId === req.user!.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const member = await StartupCoopService.addCoopMember(id, memberData);
    
    res.status(201).json({
      message: 'Member added successfully',
      member
    });
  } catch (error: any) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member', details: error.message });
  }
});

// Get cooperative analytics
router.get('/coops/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await StartupCoopService.getCoopAnalytics(id);
    
    res.json(analytics);
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// ============================================================================
// GOVERNANCE MANAGEMENT
// ============================================================================

// Create governance decision
router.post('/coops/:id/governance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const decisionData = req.body;
    
    // Check if user is member of cooperative
    const coop = await prisma.startupCoop.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!coop) {
      return res.status(404).json({ error: 'Cooperative not found' });
    }

    const isMember = coop.members.some(m => m.userId === req.user!.id);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const decision = await StartupCoopService.createGovernanceDecision(id, decisionData, req.user!.id);
    
    res.status(201).json({
      message: 'Governance decision created successfully',
      decision
    });
  } catch (error: any) {
    console.error('Create governance decision error:', error);
    res.status(500).json({ error: 'Failed to create governance decision', details: error.message });
  }
});

// Submit vote on governance decision
router.post('/governance/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { vote, comments } = req.body;
    
    const voteRecord = await StartupCoopService.submitVote(id, req.user!.id, vote, comments);
    
    res.json({
      message: 'Vote submitted successfully',
      vote: voteRecord
    });
  } catch (error: any) {
    console.error('Submit vote error:', error);
    res.status(500).json({ error: 'Failed to submit vote', details: error.message });
  }
});

// Process governance results
router.post('/governance/:id/process', authenticateToken, requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await StartupCoopService.processGovernanceResults(id, req.user!.id);
    
    res.json({
      message: 'Governance results processed successfully',
      result
    });
  } catch (error: any) {
    console.error('Process governance results error:', error);
    res.status(500).json({ error: 'Failed to process governance results', details: error.message });
  }
});

// ============================================================================
// COMPLIANCE MANAGEMENT
// ============================================================================

// Create compliance records
router.post('/compliance', authenticateToken, requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    const { entityId, entityType, regulations } = req.body;
    
    const records = await StartupCoopService.createComplianceRecords(entityId, entityType, regulations);
    
    res.status(201).json({
      message: 'Compliance records created successfully',
      records
    });
  } catch (error: any) {
    console.error('Create compliance records error:', error);
    res.status(500).json({ error: 'Failed to create compliance records', details: error.message });
  }
});

// Update compliance status
router.put('/compliance/:id', authenticateToken, requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, evidence, notes } = req.body;
    
    const record = await StartupCoopService.updateComplianceStatus(id, status, evidence, notes);
    
    res.json({
      message: 'Compliance status updated successfully',
      record
    });
  } catch (error: any) {
    console.error('Update compliance status error:', error);
    res.status(500).json({ error: 'Failed to update compliance status', details: error.message });
  }
});

// Generate compliance report
router.get('/compliance/report', authenticateToken, async (req, res) => {
  try {
    const { entityId, entityType } = req.query;
    
    if (!entityId || !entityType) {
      return res.status(400).json({ error: 'entityId and entityType are required' });
    }
    
    const report = await StartupCoopService.generateComplianceReport(entityId as string, entityType as string);
    
    res.json(report);
  } catch (error: any) {
    console.error('Generate compliance report error:', error);
    res.status(500).json({ error: 'Failed to generate compliance report', details: error.message });
  }
});

// ============================================================================
// LEGAL DOCUMENT MANAGEMENT
// ============================================================================

// Create legal document
router.post('/documents', authenticateToken, requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    const documentData = req.body;
    
    const document = await prisma.legalDocument.create({
      data: {
        ...documentData,
        createdBy: req.user!.id
      },
      include: {
        entity: true,
        project: true
      }
    });
    
    res.status(201).json({
      message: 'Legal document created successfully',
      document
    });
  } catch (error: any) {
    console.error('Create legal document error:', error);
    res.status(500).json({ error: 'Failed to create legal document', details: error.message });
  }
});

// Get legal documents for entity
router.get('/documents', authenticateToken, async (req, res) => {
  try {
    const { entityId, projectId } = req.query;
    
    const where: any = {};
    if (entityId) where.entityId = entityId;
    if (projectId) where.projectId = projectId;
    
    const documents = await prisma.legalDocument.findMany({
      where,
      include: {
        entity: true,
        project: true,
        signatures: {
          include: {
            signer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(documents);
  } catch (error: any) {
    console.error('Get legal documents error:', error);
    res.status(500).json({ error: 'Failed to get legal documents' });
  }
});

// Sign legal document
router.post('/documents/:id/sign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { termsAccepted, privacyAccepted } = req.body;
    
    // Check if already signed
    const existingSignature = await prisma.legalDocumentSignature.findFirst({
      where: {
        documentId: id,
        signerId: req.user!.id
      }
    });
    
    if (existingSignature) {
      return res.status(400).json({ error: 'Document already signed by this user' });
    }
    
    const signature = await prisma.legalDocumentSignature.create({
      data: {
        documentId: id,
        signerId: req.user!.id,
        signatureHash: `signature_${Date.now()}_${req.user!.id}`,
        termsAccepted,
        privacyAccepted,
        identityVerified: true,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      include: {
        document: true,
        signer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json({
      message: 'Document signed successfully',
      signature
    });
  } catch (error: any) {
    console.error('Sign document error:', error);
    res.status(500).json({ error: 'Failed to sign document', details: error.message });
  }
});

export default router;
