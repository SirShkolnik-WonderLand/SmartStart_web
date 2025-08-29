import express from 'express'
import { MeshService } from '../services/mesh.js'
import { authenticateToken } from '../middleware/auth.js'
import { checkRole } from '../middleware/rbac.js'

const router = express.Router()
const meshService = new MeshService()

// Get mesh items (all authenticated users)
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const { type, projectId, authorId, priority, limit, offset } = req.query
    
    const filters = {
      type: type as any,
      projectId: projectId as string,
      authorId: authorId as string,
      priority: priority as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    }
    
    const items = await meshService.getMeshItems(filters)
    res.json(items)
  } catch (error) {
    console.error('Error fetching mesh items:', error)
    res.status(500).json({ error: 'Failed to fetch mesh items' })
  }
})

// Create mesh item (all authenticated users)
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const { type, title, description, projectId, priority, metadata } = req.body
    const authorId = req.user?.id
    
    if (!authorId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const meshItem = await meshService.createMeshItem({
      type,
      title,
      description,
      authorId,
      projectId,
      priority,
      metadata: metadata || undefined
    })
    
    res.status(201).json(meshItem)
  } catch (error) {
    console.error('Error creating mesh item:', error)
    res.status(500).json({ error: 'Failed to create mesh item' })
  }
})

// Add reaction to mesh item (all authenticated users)
router.post('/items/:itemId/reactions', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params
    const { emoji } = req.body
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const reaction = await meshService.addReaction(itemId, userId, emoji)
    res.json(reaction)
  } catch (error) {
    console.error('Error adding reaction:', error)
    res.status(500).json({ error: 'Failed to add reaction' })
  }
})

// Remove reaction from mesh item (all authenticated users)
router.delete('/items/:itemId/reactions', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params
    const { emoji } = req.body
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    await meshService.removeReaction(itemId, userId, emoji)
    res.status(204).send()
  } catch (error) {
    console.error('Error removing reaction:', error)
    res.status(500).json({ error: 'Failed to remove reaction' })
  }
})

// Get community insights (all authenticated users)
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const { type, priority, limit } = req.query
    
    const filters = {
      type: type as any,
      priority: priority ? parseInt(priority as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    }
    
    const insights = await meshService.getInsights(filters)
    res.json(insights)
  } catch (error) {
    console.error('Error fetching insights:', error)
    res.status(500).json({ error: 'Failed to fetch insights' })
  }
})

// Get mesh statistics (all authenticated users)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await meshService.getMeshStats()
    res.json(stats)
  } catch (error) {
    console.error('Error fetching mesh stats:', error)
    res.status(500).json({ error: 'Failed to fetch mesh stats' })
  }
})

// Generate AI insights (admin only)
router.post('/insights/generate', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const insights = await meshService.generateInsights()
    res.json(insights)
  } catch (error) {
    console.error('Error generating insights:', error)
    res.status(500).json({ error: 'Failed to generate insights' })
  }
})

export default router
