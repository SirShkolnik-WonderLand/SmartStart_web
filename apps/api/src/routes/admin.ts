import express from 'express'
import { UserManagementService } from '../services/userManagement.js'
import { SystemSettingsService } from '../services/systemSettings.js'
import { authenticateToken } from '../middleware/auth.js'
import { checkRole } from '../middleware/rbac.js'

const router = express.Router()
const userService = new UserManagementService()
const settingsService = new SystemSettingsService()

// ===== SETTINGS ROUTES =====

// Get all settings (admin only)
router.get('/settings', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const settings = await settingsService.getAllSettings()
    res.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// ===== USER MANAGEMENT ROUTES =====

// Get all users (admin only)
router.get('/users', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { role, status, level, search, limit, offset } = req.query
    
    const filters = {
      role: role as any,
      status: status as any,
      level: level as any,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    }
    
    const users = await userService.getUsers(filters)
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Get user by ID (admin only)
router.get('/users/:userId', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params
    const user = await userService.getUserById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Update user (admin only)
router.put('/users/:userId', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params
    const updateData = req.body
    
    const user = await userService.updateUser(userId, updateData)
    res.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Update user role (admin only)
router.put('/users/:userId/role', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body
    
    const account = await userService.updateUserRole(userId, role)
    res.json(account)
  } catch (error) {
    console.error('Error updating user role:', error)
    res.status(500).json({ error: 'Failed to update user role' })
  }
})

// Update user status (admin only)
router.put('/users/:userId/status', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params
    const { status } = req.body
    
    const user = await userService.updateUserStatus(userId, status)
    res.json(user)
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({ error: 'Failed to update user status' })
  }
})

// Add XP to user (admin only)
router.post('/users/:userId/xp', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params
    const { xpAmount } = req.body
    
    const user = await userService.addXP(userId, xpAmount)
    res.json(user)
  } catch (error) {
    console.error('Error adding XP:', error)
    res.status(500).json({ error: 'Failed to add XP' })
  }
})

// Add reputation to user (admin only)
router.post('/users/:userId/reputation', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params
    const { reputationAmount } = req.body
    
    const user = await userService.addReputation(userId, reputationAmount)
    res.json(user)
  } catch (error) {
    console.error('Error adding reputation:', error)
    res.status(500).json({ error: 'Failed to add reputation' })
  }
})

// Get user statistics (admin only)
router.get('/users/stats', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const stats = await userService.getUserStats()
    res.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({ error: 'Failed to fetch user stats' })
  }
})

// Search users (admin only)
router.get('/users/search', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { q, limit } = req.query
    const users = await userService.searchUsers(q as string, limit ? parseInt(limit as string) : 10)
    res.json(users)
  } catch (error) {
    console.error('Error searching users:', error)
    res.status(500).json({ error: 'Failed to search users' })
  }
})

// Get users by role (admin only)
router.get('/users/role/:role', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { role } = req.params
    const users = await userService.getUsersByRole(role as any)
    res.json(users)
  } catch (error) {
    console.error('Error fetching users by role:', error)
    res.status(500).json({ error: 'Failed to fetch users by role' })
  }
})

// Get recently active users (admin only)
router.get('/users/recently-active', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { limit } = req.query
    const users = await userService.getRecentlyActiveUsers(limit ? parseInt(limit as string) : 10)
    res.json(users)
  } catch (error) {
    console.error('Error fetching recently active users:', error)
    res.status(500).json({ error: 'Failed to fetch recently active users' })
  }
})

// ===== SYSTEM SETTINGS ROUTES =====

// Get all settings (admin only)
router.get('/settings', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const settings = await settingsService.getAllSettings()
    res.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// Get settings by category (admin only)
router.get('/settings/:category', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { category } = req.params
    const settings = await settingsService.getSettingsByCategory(category)
    res.json(settings)
  } catch (error) {
    console.error('Error fetching settings by category:', error)
    res.status(500).json({ error: 'Failed to fetch settings by category' })
  }
})

// Update setting (admin only)
router.put('/settings/:category/:key', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { category, key } = req.params
    const { value, description } = req.body
    
    const setting = await settingsService.updateSetting(category, key, value, description)
    res.json(setting)
  } catch (error) {
    console.error('Error updating setting:', error)
    res.status(500).json({ error: 'Failed to update setting' })
  }
})

// Update multiple settings (admin only)
router.put('/settings', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const settings = req.body
    const results = await settingsService.updateSettingsFromObject(settings)
    res.json(results)
  } catch (error) {
    console.error('Error updating settings:', error)
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

// Delete setting (admin only)
router.delete('/settings/:category/:key', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { category, key } = req.params
    await settingsService.deleteSetting(category, key)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting setting:', error)
    res.status(500).json({ error: 'Failed to delete setting' })
  }
})

// Reset settings to defaults (admin only)
router.post('/settings/reset', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const result = await settingsService.resetToDefaults()
    res.json(result)
  } catch (error) {
    console.error('Error resetting settings:', error)
    res.status(500).json({ error: 'Failed to reset settings' })
  }
})

// Get security settings (admin only)
router.get('/settings/security', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const settings = await settingsService.getSecuritySettings()
    res.json(settings)
  } catch (error) {
    console.error('Error fetching security settings:', error)
    res.status(500).json({ error: 'Failed to fetch security settings' })
  }
})

// Get community settings (admin only)
router.get('/settings/community', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const settings = await settingsService.getCommunitySettings()
    res.json(settings)
  } catch (error) {
    console.error('Error fetching community settings:', error)
    res.status(500).json({ error: 'Failed to fetch community settings' })
  }
})

// Check if feature is enabled (admin only)
router.get('/settings/feature/:feature', authenticateToken, checkRole(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { feature } = req.params
    const enabled = await settingsService.isFeatureEnabled(feature)
    res.json({ feature, enabled })
  } catch (error) {
    console.error('Error checking feature:', error)
    res.status(500).json({ error: 'Failed to check feature' })
  }
})

export default router
