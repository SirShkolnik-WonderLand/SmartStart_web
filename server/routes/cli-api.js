const express = require('express');
const { z } = require('zod');
const { commandMap } = require('../commands');
const { getAuthCtx } = require('../middleware/rbac');
const { audit } = require('../middleware/audit');
const { requireCsrf } = require('../middleware/security');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Root CLI endpoint
router.get('/', (req, res) => {
    res.json({
        ok: true,
        system: 'SmartStart Platform CLI',
        version: '2.0.0',
        status: 'OPERATIONAL',
        endpoints: {
            commands: '/api/cli/commands',
            status: '/api/cli/status',
            health: '/api/cli/health',
            exec: '/api/cli/exec',
            help: '/api/cli/help/:command'
        },
        totalCommands: commandMap.size,
        documentation: 'Use /api/cli/commands to see all available commands'
    });
});

// Command execution schema
const ExecSchema = z.object({
    command: z.string().min(1).max(128),
    args: z.record(z.any()).default({}),
    csrf: z.string().min(24)
});

// CLI command execution endpoint
router.post('/exec', requireCsrf, async(req, res) => {
    try {
        const { command, args } = ExecSchema.parse(req.body);

        // Get authentication context
        const ctx = await getAuthCtx(req);

        // Find command specification
        const spec = commandMap.get(command);
        if (!spec) {
            await audit(ctx, command, args, false, 'UNKNOWN_COMMAND');
            return res.status(400).json({
                ok: false,
                out: `Unknown command: ${command}\nType 'help' for available commands.`
            });
        }

        // Permission check (deny by default)
        for (const perm of spec.perms) {
            if (!ctx.permissions.includes(perm)) {
                await audit(ctx, command, args, false, 'FORBIDDEN');
                return res.status(403).json({
                    ok: false,
                    out: `Access denied. Required permission: ${perm}`
                });
            }
        }

        // Execute command
        try {
            const output = await spec.handler(ctx, spec.schema.parse(args));
            await audit(ctx, command, args, true, 'SUCCESS');
            res.json({ ok: true, out: output });
        } catch (error) {
            console.error(`Command execution error for ${command}:`, error);
            await audit(ctx, command, args, false, error && error.message ? error.message : 'EXECUTION_ERROR');
            res.status(500).json({
                ok: false,
                out: `Command execution failed: ${error && error.message ? error.message : 'Unknown error'}`
            });
        }

    } catch (error) {
        console.error('CLI API error:', error);
        res.status(400).json({
            ok: false,
            out: `Invalid request: ${error && error.message ? error.message : 'Unknown error'}`
        });
    }
});

// Get available commands (for help system)
router.get('/commands', async(req, res) => {
    try {
        const commands = Array.from(commandMap.values()).map(cmd => ({
            name: cmd.name,
            permissions: cmd.perms,
            description: cmd.name.includes(':') ?
                `${cmd.name.split(':')[0]} management` : 'System command'
        }));

        res.json({
            ok: true,
            commands,
            total: commands.length
        });
    } catch (error) {
        console.error('Commands list error:', error);
        res.status(500).json({
            ok: false,
            out: 'Failed to retrieve commands list'
        });
    }
});

// Get command help
router.get('/help/:command', async(req, res) => {
            try {
                const { command } = req.params;
                const spec = commandMap.get(command);

                if (!spec) {
                    return res.status(404).json({
                        ok: false,
                        out: `Command '${command}' not found`
                    });
                }

                // Generate help text based on command schema
                const schemaHelp = Object.entries(spec.schema.shape || {})
                    .map(([key, schema]) => {
                        const required = schema._def.typeName === 'ZodOptional' ? 'optional' : 'required';
                        return `  --${key} <value>  (${required})`;
                    })
                    .join('\n');

                const helpText = [
                        `📖 HELP: ${command}`,
                        '='.repeat(20 + command.length),
                        `Description: ${spec.name.includes(':') ? 
        `${spec.name.split(':')[0]} management command` : 
        'System command'}`,
      '',
      'Usage:',
      `  ${command}${schemaHelp ? '\n' + schemaHelp : ''}`,
      '',
      `Required permissions: ${spec.perms.length > 0 ? spec.perms.join(', ') : 'None'}`,
      '',
      'Examples:',
      getCommandExamples(command)
    ].join('\n');
    
    res.json({ ok: true, out: helpText });
  } catch (error) {
    console.error('Command help error:', error);
    res.status(500).json({ 
      ok: false, 
      out: 'Failed to retrieve command help' 
    });
  }
});

// Simple health check (no database required)
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0'
  });
});

// Get system status
router.get('/status', async (req, res) => {
  try {
    let stats = {
      user_count: 0,
      company_count: 0,
      team_count: 0,
      project_count: 0,
      contract_count: 0
    };
    
    try {
      // Try to get stats, but don't fail if tables don't exist
      const dbStats = await prisma.$queryRaw`
        SELECT 
          (SELECT COUNT(*) FROM "User" LIMIT 1) as user_count,
          (SELECT COUNT(*) FROM "Company" LIMIT 1) as company_count,
          (SELECT COUNT(*) FROM "Team" LIMIT 1) as team_count,
          (SELECT COUNT(*) FROM "Project" LIMIT 1) as project_count,
          (SELECT COUNT(*) FROM "Contract" LIMIT 1) as contract_count
      `;
      
      if (dbStats && dbStats[0]) {
        stats = dbStats[0];
      }
    } catch (dbError) {
      console.log('Database stats query failed, using defaults:', dbError.message);
      // Continue with default values
    }
    
    const status = {
      ok: true,
      system: 'SmartStart Platform',
      version: '2.0.0',
      status: 'OPERATIONAL',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      stats: {
        users: parseInt(stats.user_count) || 0,
        companies: parseInt(stats.company_count) || 0,
        teams: parseInt(stats.team_count) || 0,
        projects: parseInt(stats.project_count) || 0,
        contracts: parseInt(stats.contract_count) || 0
      },
      commands: {
        total: commandMap.size,
        categories: ['system', 'company', 'team', 'project', 'user', 'gamification', 'analytics', 'audit']
      }
    };
    
    res.json(status);
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ 
      ok: false, 
      out: 'Failed to retrieve system status' 
    });
  }
});

// Helper function to generate command examples
function getCommandExamples(command) {
  const examples = {
    'help': 'help',
    'status': 'status',
    'version': 'version',
    'whoami': 'whoami',
    'companies:list': 'companies:list\ncompanies:list --q "tech"',
    'company:show': 'company:show --id 123e4567-e89b-12d3-a456-426614174000',
    'teams:list': 'teams:list\nteams:list --q "development"',
    'projects:list': 'projects:list\nprojects:list --q "mobile"',
    'users:list': 'users:list\nusers:list --q "john"',
    'badges:list': 'badges:list',
    'badge:grant': 'badge:grant --user 123e4567-e89b-12d3-a456-426614174000 --badge SEC_NINJA',
    'stats:system': 'stats:system',
    'audit:logs': 'audit:logs\naudit:logs --limit 50',
    'audit:stats': 'audit:stats'
  };
  
  return examples[command] || 'No examples available';
}

module.exports = router;