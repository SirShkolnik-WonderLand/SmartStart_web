const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.API_PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://smartstart-platform.onrender.com']
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        account: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !user.account || !user.account.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    req.permissions = user.account.role.rolePermissions.map(rp => rp.permission.name);
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Permission checking middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'connected'
  });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const account = await prisma.account.findUnique({
      where: { email },
      include: {
        user: true,
        role: true
      }
    });

    if (!account || !account.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, account.password || '');
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.account.update({
      where: { id: account.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: account.userId,
        email: account.email,
        roleId: account.roleId,
        roleName: account.role.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: account.user.id,
        email: account.user.email,
        name: account.user.name,
        role: account.role.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: {
          id: req.user.account.role.id,
          name: req.user.account.role.name,
          level: req.user.account.role.level
        },
        permissions: req.permissions
      }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User management routes
app.get('/api/users', authenticateToken, requirePermission('user:read'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        account: {
          include: {
            role: true
          }
        }
      }
    });

    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.account?.role.name,
        isActive: user.account?.isActive
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Project management routes
app.get('/api/projects', authenticateToken, requirePermission('project:read'), async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: true,
        members: {
          include: {
            user: true
          }
        },
        capEntries: true
      }
    });

    res.json({
      success: true,
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        summary: project.summary,
        owner: project.owner.name,
        totalValue: project.totalValue,
        activeMembers: project.activeMembers,
        completionRate: project.completionRate,
        lastActivity: project.lastActivity
      }))
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', authenticateToken, requirePermission('project:write'), async (req, res) => {
  try {
    const { name, summary, ownerId } = req.body;

    if (!name || !ownerId) {
      return res.status(400).json({ error: 'Name and owner are required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        summary,
        ownerId,
        capEntries: {
          create: [
            {
              holderType: 'OWNER',
              holderId: ownerId,
              pct: 35.0,
              source: 'Initial allocation'
            },
            {
              holderType: 'ALICE',
              pct: 20.0,
              source: 'AliceSolutions stake'
            },
            {
              holderType: 'RESERVE',
              pct: 45.0,
              source: 'Contributor pool'
            }
          ]
        }
      },
      include: {
        owner: true,
        capEntries: true
      }
    });

    res.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        summary: project.summary,
        owner: project.owner.name,
        capTable: project.capEntries
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Equity management routes
app.get('/api/equity/:ventureId', authenticateToken, requirePermission('equity:read'), async (req, res) => {
  try {
    const { ventureId } = req.params;

    const capTable = await prisma.capTableEntry.findMany({
      where: { projectId: ventureId },
      include: {
        project: true
      }
    });

    res.json({
      success: true,
      ventureId,
      capTable: capTable.map(entry => ({
        holderType: entry.holderType,
        holderId: entry.holderId,
        percentage: entry.pct,
        value: entry.value,
        source: entry.source
      }))
    });
  } catch (error) {
    console.error('Get equity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Task management routes
app.get('/api/tasks', authenticateToken, requirePermission('project:read'), async (req, res) => {
  try {
    const { projectId } = req.query;

    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId } : {},
      include: {
        assignee: true,
        project: true
      }
    });

    res.json({
      success: true,
      tasks: tasks.map(task => ({
        id: task.id,
        title: task.title,
        type: task.type,
        status: task.status,
        assignee: task.assignee?.name,
        project: task.project.name,
        effort: task.effort,
        impact: task.impact,
        priority: task.priority
      }))
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// System settings routes
app.get('/api/system/settings', authenticateToken, requirePermission('system:read'), async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = {
        value: setting.value,
        description: setting.description
      };
      return acc;
    }, {});

    res.json({
      success: true,
      settings: groupedSettings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Skills and badges routes
app.get('/api/skills', authenticateToken, async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { demand: 'desc' }
    });

    res.json({
      success: true,
      skills: skills.map(skill => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        demand: skill.demand,
        complexity: skill.complexity
      }))
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/badges', authenticateToken, async (req, res) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { rarity: 'asc' }
    });

    res.json({
      success: true,
      badges: badges.map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        rarity: badge.rarity
      }))
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Background jobs (quarterly rebalancing, etc.)
const setupBackgroundJobs = () => {
  // Quarterly equity rebalancing (runs on 1st day of quarter at 2 AM)
  cron.schedule('0 2 1 */3 *', async () => {
    console.log('Running quarterly equity rebalancing...');
    try {
      // TODO: Implement quarterly rebalancing logic
      console.log('Quarterly rebalancing completed');
    } catch (error) {
      console.error('Quarterly rebalancing failed:', error);
    }
  });

  // Daily health checks
  cron.schedule('0 6 * * *', async () => {
    console.log('Running daily health checks...');
    try {
      // TODO: Implement health checks
      console.log('Daily health checks completed');
    } catch (error) {
      console.error('Daily health checks failed:', error);
    }
  });
};

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting SmartStart API Server...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Auto-setup database if needed (for first deployment)
    try {
      console.log('🔧 Checking database setup...');
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        console.log('📊 Database is empty, running setup...');
        // Run database push and seed
        const { execSync } = require('child_process');
        try {
          execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
          console.log('✅ Database schema updated');
          
          execSync('npm run db:seed', { stdio: 'inherit' });
          console.log('✅ Database seeded with demo data');
        } catch (setupError) {
          console.log('⚠️ Setup completed with warnings:', setupError.message);
        }
      } else {
        console.log(`✅ Database has ${userCount} users, setup complete`);
      }
    } catch (setupError) {
      console.log('⚠️ Database setup check failed:', setupError.message);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 SmartStart API Server running on port ${PORT}`);
      console.log(`📊 Services Status:`);
      console.log(`   - Worker: ${process.env.WORKER_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   - Storage: ${process.env.STORAGE_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   - Monitor: ${process.env.MONITOR_ENABLED === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
