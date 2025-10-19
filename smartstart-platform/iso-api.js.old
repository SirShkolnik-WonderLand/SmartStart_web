// ISO Readiness Studio API
// Integrated with smartstart-platform

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to calculate scores
function calculateScores(answers) {
  const statusWeights = {
    NA: 0,
    NOT_IMPLEMENTED: 0,
    PARTIAL: 0.5,
    IMPLEMENTED: 1.0,
    OPERATING: 1.0
  };

  let totalScore = 0;
  let totalWeight = 0;

  answers.forEach(answer => {
    const statusWeight = statusWeights[answer.status] || 0;
    const controlWeight = answer.Control?.weight || 1;
    
    if (answer.status !== 'NA') {
      totalScore += statusWeight * controlWeight;
      totalWeight += controlWeight;
    }
  });

  return {
    score: totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0,
    totalScore,
    totalWeight
  };
}

// Get all frameworks
router.get('/frameworks', async (req, res) => {
  try {
    const frameworks = await prisma.framework.findMany({
      include: {
        domains: {
          include: {
            controls: true
          }
        }
      }
    });

    res.json({ frameworks });
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    res.status(500).json({ error: 'Failed to fetch frameworks' });
  }
});

// Get all controls for a framework
router.get('/frameworks/:frameworkId/controls', async (req, res) => {
  try {
    const { frameworkId } = req.params;
    
    const controls = await prisma.control.findMany({
      where: { frameworkId },
      include: {
        Domain: true,
        mappings: true
      },
      orderBy: { code: 'asc' }
    });

    res.json({ controls });
  } catch (error) {
    console.error('Error fetching controls:', error);
    res.status(500).json({ error: 'Failed to fetch controls' });
  }
});

// Get project with answers
router.get('/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        Organization: true,
        answers: {
          include: {
            Control: {
              include: {
                Domain: true
              }
            },
            OwnerUser: true,
            OwnerTeam: true
          }
        },
        activity: {
          include: {
            User: true
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Calculate scores
    const scores = calculateScores(project.answers);

    res.json({
      project: {
        ...project,
        scores
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Update answer
router.patch('/projects/:projectId/answers/:answerId', async (req, res) => {
  try {
    const { projectId, answerId } = req.params;
    const { status, ownerUserId, ownerTeamId, dueDate, riskImpact, riskLikely, effort, notes, references, evidenceUrl, updatedBy } = req.body;

    // Update answer
    const answer = await prisma.answer.update({
      where: { id: answerId },
      data: {
        status,
        ownerUserId,
        ownerTeamId,
        dueDate: dueDate ? new Date(dueDate) : null,
        riskImpact,
        riskLikely,
        effort,
        notes,
        references,
        evidenceUrl,
        updatedBy
      },
      include: {
        Control: true,
        OwnerUser: true,
        OwnerTeam: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId: answer.Project.organizationId,
        projectId,
        userId: updatedBy,
        action: 'UPDATE_ANSWER',
        meta: {
          answerId,
          changes: req.body
        }
      }
    });

    // Recalculate scores
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        answers: {
          include: {
            Control: true
          }
        }
      }
    });

    const scores = calculateScores(project.answers);

    res.json({
      answer,
      scores
    });
  } catch (error) {
    console.error('Error updating answer:', error);
    res.status(500).json({ error: 'Failed to update answer' });
  }
});

// Create new project
router.post('/projects', async (req, res) => {
  try {
    const { organizationId, name, frameworks, mode } = req.body;

    const project = await prisma.project.create({
      data: {
        organizationId,
        name,
        frameworks,
        mode: mode || 'list'
      }
    });

    res.json({ project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get POA&M (Plan of Action & Milestones)
router.get('/projects/:projectId/poam', async (req, res) => {
  try {
    const { projectId } = req.params;

    const answers = await prisma.answer.findMany({
      where: {
        projectId,
        status: {
          in: ['NOT_IMPLEMENTED', 'PARTIAL']
        }
      },
      include: {
        Control: {
          include: {
            Domain: true
          }
        },
        OwnerUser: true,
        OwnerTeam: true
      }
    });

    // Calculate priority for each answer
    const poam = answers.map(answer => {
      const statusWeights = {
        NOT_IMPLEMENTED: 0,
        PARTIAL: 0.5
      };

      const priority = (answer.riskImpact * answer.riskLikely) * (2 - statusWeights[answer.status]) * (answer.Control?.weight || 1) / answer.effort;

      return {
        ...answer,
        priority
      };
    }).sort((a, b) => b.priority - a.priority);

    res.json({ poam });
  } catch (error) {
    console.error('Error fetching POA&M:', error);
    res.status(500).json({ error: 'Failed to fetch POA&M' });
  }
});

// Get dashboard stats
router.get('/projects/:projectId/dashboard', async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        answers: {
          include: {
            Control: {
              include: {
                Domain: true
              }
            }
          }
        }
      }
    });

    // Calculate domain scores
    const domainScores = {};
    project.answers.forEach(answer => {
      const domainCode = answer.Control.Domain.code;
      if (!domainScores[domainCode]) {
        domainScores[domainCode] = {
          domain: answer.Control.Domain,
          answers: [],
          score: 0
        };
      }
      domainScores[domainCode].answers.push(answer);
    });

    // Calculate score per domain
    Object.keys(domainScores).forEach(domainCode => {
      const scores = calculateScores(domainScores[domainCode].answers);
      domainScores[domainCode].score = scores.score;
    });

    // Overall score
    const overallScores = calculateScores(project.answers);

    // Stats
    const stats = {
      totalControls: project.answers.length,
      notImplemented: project.answers.filter(a => a.status === 'NOT_IMPLEMENTED').length,
      partial: project.answers.filter(a => a.status === 'PARTIAL').length,
      implemented: project.answers.filter(a => a.status === 'IMPLEMENTED').length,
      operating: project.answers.filter(a => a.status === 'OPERATING').length,
      na: project.answers.filter(a => a.status === 'NA').length
    };

    res.json({
      project,
      domainScores,
      overallScores,
      stats
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

module.exports = router;

