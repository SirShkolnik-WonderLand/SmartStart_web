const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Migration API is healthy' });
});

// Run database migrations
router.post('/migrate', async (req, res) => {
  try {
    console.log('🔄 Starting database migration...');
    
    // Run Prisma migrate deploy
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    console.log('Migration output:', stdout);
    if (stderr) {
      console.log('Migration stderr:', stderr);
    }
    
    res.json({ 
      success: true, 
      message: 'Database migration completed successfully',
      output: stdout,
      stderr: stderr || null
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database migration failed',
      error: error.message,
      output: error.stdout || null,
      stderr: error.stderr || null
    });
  }
});

// Check migration status
router.get('/status', async (req, res) => {
  try {
    console.log('🔍 Checking migration status...');
    
    const { stdout, stderr } = await execAsync('npx prisma migrate status');
    
    console.log('Migration status:', stdout);
    if (stderr) {
      console.log('Migration status stderr:', stderr);
    }
    
    res.json({ 
      success: true, 
      message: 'Migration status retrieved',
      status: stdout,
      stderr: stderr || null
    });
    
  } catch (error) {
    console.error('Migration status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get migration status',
      error: error.message,
      output: error.stdout || null,
      stderr: error.stderr || null
    });
  }
});

module.exports = router;
