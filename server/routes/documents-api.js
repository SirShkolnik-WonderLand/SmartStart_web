const express = require('express')
const router = express.Router()
const fs = require('fs').promises
const path = require('path')

// Document templates from Contracts folder
const CONTRACTS_DIR = path.join(__dirname, '../Contracts')

// Document categories
const DOCUMENT_CATEGORIES = {
  'platform-agreements': {
    name: 'Platform Agreements',
    description: 'Core platform terms and conditions',
    icon: '📋'
  },
  'confidentiality': {
    name: 'Confidentiality & NDA',
    description: 'Non-disclosure and confidentiality agreements',
    icon: '🔒'
  },
  'intellectual-property': {
    name: 'Intellectual Property',
    description: 'IP ownership and assignment agreements',
    icon: '💡'
  },
  'project-specific': {
    name: 'Project-Specific',
    description: 'Project-level agreements and addenda',
    icon: '📄'
  },
  'collaboration': {
    name: 'Collaboration',
    description: 'Joint development and collaboration agreements',
    icon: '🤝'
  }
}

// Get all available document templates
router.get('/templates', async (req, res) => {
  try {
    const templates = []
    
    // Read all contract files
    const files = await fs.readdir(CONTRACTS_DIR)
    
    for (const file of files) {
      if (file.endsWith('.txt')) {
        const filePath = path.join(CONTRACTS_DIR, file)
        const content = await fs.readFile(filePath, 'utf8')
        const stats = await fs.stat(filePath)
        
        // Determine category based on filename
        let category = 'platform-agreements'
        if (file.toLowerCase().includes('nda') || file.toLowerCase().includes('confidentiality')) {
          category = 'confidentiality'
        } else if (file.toLowerCase().includes('ip') || file.toLowerCase().includes('intellectual')) {
          category = 'intellectual-property'
        } else if (file.toLowerCase().includes('project') || file.toLowerCase().includes('addendum')) {
          category = 'project-specific'
        } else if (file.toLowerCase().includes('collaboration') || file.toLowerCase().includes('joint')) {
          category = 'collaboration'
        }
        
        templates.push({
          id: file.replace('.txt', '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          title: file.replace('.txt', ''),
          filename: file,
          category: category,
          categoryInfo: DOCUMENT_CATEGORIES[category],
          content: content,
          size: stats.size,
          lastModified: stats.mtime,
          wordCount: content.split(/\s+/).length,
          lineCount: content.split('\n').length
        })
      }
    }
    
    res.json({
      success: true,
      data: {
        templates,
        categories: DOCUMENT_CATEGORIES,
        totalTemplates: templates.length
      }
    })
  } catch (error) {
    console.error('Error fetching document templates:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document templates',
      error: error.message
    })
  }
})

// Get specific document template
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Find the template by ID
    const files = await fs.readdir(CONTRACTS_DIR)
    const file = files.find(f => f.replace('.txt', '').toLowerCase().replace(/[^a-z0-9]/g, '-') === id)
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Document template not found'
      })
    }
    
    const filePath = path.join(CONTRACTS_DIR, file)
    const content = await fs.readFile(filePath, 'utf8')
    const stats = await fs.stat(filePath)
    
    // Determine category
    let category = 'platform-agreements'
    if (file.toLowerCase().includes('nda') || file.toLowerCase().includes('confidentiality')) {
      category = 'confidentiality'
    } else if (file.toLowerCase().includes('ip') || file.toLowerCase().includes('intellectual')) {
      category = 'intellectual-property'
    } else if (file.toLowerCase().includes('project') || file.toLowerCase().includes('addendum')) {
      category = 'project-specific'
    } else if (file.toLowerCase().includes('collaboration') || file.toLowerCase().includes('joint')) {
      category = 'collaboration'
    }
    
    const template = {
      id: id,
      title: file.replace('.txt', ''),
      filename: file,
      category: category,
      categoryInfo: DOCUMENT_CATEGORIES[category],
      content: content,
      size: stats.size,
      lastModified: stats.mtime,
      wordCount: content.split(/\s+/).length,
      lineCount: content.split('\n').length
    }
    
    res.json({
      success: true,
      data: template
    })
  } catch (error) {
    console.error('Error fetching document template:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document template',
      error: error.message
    })
  }
})

// Get documents by category
router.get('/templates/category/:category', async (req, res) => {
  try {
    const { category } = req.params
    
    if (!DOCUMENT_CATEGORIES[category]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      })
    }
    
    const templates = []
    const files = await fs.readdir(CONTRACTS_DIR)
    
    for (const file of files) {
      if (file.endsWith('.txt')) {
        // Determine category based on filename
        let fileCategory = 'platform-agreements'
        if (file.toLowerCase().includes('nda') || file.toLowerCase().includes('confidentiality')) {
          fileCategory = 'confidentiality'
        } else if (file.toLowerCase().includes('ip') || file.toLowerCase().includes('intellectual')) {
          fileCategory = 'intellectual-property'
        } else if (file.toLowerCase().includes('project') || file.toLowerCase().includes('addendum')) {
          fileCategory = 'project-specific'
        } else if (file.toLowerCase().includes('collaboration') || file.toLowerCase().includes('joint')) {
          fileCategory = 'collaboration'
        }
        
        if (fileCategory === category) {
          const filePath = path.join(CONTRACTS_DIR, file)
          const content = await fs.readFile(filePath, 'utf8')
          const stats = await fs.stat(filePath)
          
          templates.push({
            id: file.replace('.txt', '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
            title: file.replace('.txt', ''),
            filename: file,
            category: fileCategory,
            categoryInfo: DOCUMENT_CATEGORIES[fileCategory],
            content: content,
            size: stats.size,
            lastModified: stats.mtime,
            wordCount: content.split(/\s+/).length,
            lineCount: content.split('\n').length
          })
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        templates,
        category: DOCUMENT_CATEGORIES[category],
        totalTemplates: templates.length
      }
    })
  } catch (error) {
    console.error('Error fetching documents by category:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents by category',
      error: error.message
    })
  }
})

// Search documents
router.get('/search', async (req, res) => {
  try {
    const { q: query, category } = req.query
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }
    
    const templates = []
    const files = await fs.readdir(CONTRACTS_DIR)
    const searchTerm = query.toLowerCase()
    
    for (const file of files) {
      if (file.endsWith('.txt')) {
        const filePath = path.join(CONTRACTS_DIR, file)
        const content = await fs.readFile(filePath, 'utf8')
        
        // Search in filename and content
        if (file.toLowerCase().includes(searchTerm) || content.toLowerCase().includes(searchTerm)) {
          const stats = await fs.stat(filePath)
          
          // Determine category
          let fileCategory = 'platform-agreements'
          if (file.toLowerCase().includes('nda') || file.toLowerCase().includes('confidentiality')) {
            fileCategory = 'confidentiality'
          } else if (file.toLowerCase().includes('ip') || file.toLowerCase().includes('intellectual')) {
            fileCategory = 'intellectual-property'
          } else if (file.toLowerCase().includes('project') || file.toLowerCase().includes('addendum')) {
            fileCategory = 'project-specific'
          } else if (file.toLowerCase().includes('collaboration') || file.toLowerCase().includes('joint')) {
            fileCategory = 'collaboration'
          }
          
          // Filter by category if specified
          if (category && fileCategory !== category) {
            continue
          }
          
          templates.push({
            id: file.replace('.txt', '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
            title: file.replace('.txt', ''),
            filename: file,
            category: fileCategory,
            categoryInfo: DOCUMENT_CATEGORIES[fileCategory],
            content: content,
            size: stats.size,
            lastModified: stats.mtime,
            wordCount: content.split(/\s+/).length,
            lineCount: content.split('\n').length
          })
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        templates,
        query,
        category: category || 'all',
        totalResults: templates.length
      }
    })
  } catch (error) {
    console.error('Error searching documents:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search documents',
      error: error.message
    })
  }
})

// Get document statistics
router.get('/stats', async (req, res) => {
  try {
    const files = await fs.readdir(CONTRACTS_DIR)
    const stats = {
      totalDocuments: 0,
      totalSize: 0,
      totalWords: 0,
      totalLines: 0,
      categories: {},
      lastModified: null
    }
    
    for (const file of files) {
      if (file.endsWith('.txt')) {
        const filePath = path.join(CONTRACTS_DIR, file)
        const content = await fs.readFile(filePath, 'utf8')
        const fileStats = await fs.stat(filePath)
        
        // Determine category
        let category = 'platform-agreements'
        if (file.toLowerCase().includes('nda') || file.toLowerCase().includes('confidentiality')) {
          category = 'confidentiality'
        } else if (file.toLowerCase().includes('ip') || file.toLowerCase().includes('intellectual')) {
          category = 'intellectual-property'
        } else if (file.toLowerCase().includes('project') || file.toLowerCase().includes('addendum')) {
          category = 'project-specific'
        } else if (file.toLowerCase().includes('collaboration') || file.toLowerCase().includes('joint')) {
          category = 'collaboration'
        }
        
        stats.totalDocuments++
        stats.totalSize += fileStats.size
        stats.totalWords += content.split(/\s+/).length
        stats.totalLines += content.split('\n').length
        
        if (!stats.categories[category]) {
          stats.categories[category] = 0
        }
        stats.categories[category]++
        
        if (!stats.lastModified || fileStats.mtime > stats.lastModified) {
          stats.lastModified = fileStats.mtime
        }
      }
    }
    
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching document statistics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document statistics',
      error: error.message
    })
  }
})

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Documents API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

module.exports = router
