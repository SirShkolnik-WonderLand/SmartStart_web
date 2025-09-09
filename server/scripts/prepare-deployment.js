#!/usr/bin/env node

/**
 * SmartStart Private Umbrella System - Deployment Preparation Script
 * Comprehensive deployment preparation and validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentPreparer {
  constructor() {
    this.deploymentChecklist = {
      database: { passed: 0, failed: 0, checks: [] },
      api: { passed: 0, failed: 0, checks: [] },
      frontend: { passed: 0, failed: 0, checks: [] },
      security: { passed: 0, failed: 0, checks: [] },
      integration: { passed: 0, failed: 0, checks: [] }
    };
  }

  // ===== DATABASE DEPLOYMENT CHECKS =====

  async checkDatabaseDeployment() {
    console.log('🗄️ Checking database deployment readiness...');

    try {
      // Check Prisma schema
      const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
      if (fs.existsSync(schemaPath)) {
        this.addCheck('database', 'Prisma schema exists', true);
      } else {
        this.addCheck('database', 'Prisma schema missing', false);
      }

      // Check for umbrella models in schema
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const umbrellaModels = [
        'model UmbrellaRelationship',
        'model RevenueShare',
        'model UmbrellaDocument',
        'model UmbrellaDocumentSignature',
        'model UmbrellaAnalytics'
      ];

      umbrellaModels.forEach(model => {
        if (schemaContent.includes(model)) {
          this.addCheck('database', `Schema contains ${model}`, true);
        } else {
          this.addCheck('database', `Schema missing ${model}`, false);
        }
      });

      // Check for umbrella enums
      const umbrellaEnums = [
        'enum UmbrellaType',
        'enum UmbrellaStatus',
        'enum UmbrellaDocumentType'
      ];

      umbrellaEnums.forEach(enumType => {
        if (schemaContent.includes(enumType)) {
          this.addCheck('database', `Schema contains ${enumType}`, true);
        } else {
          this.addCheck('database', `Schema missing ${enumType}`, false);
        }
      });

      // Check migration files
      const migrationsDir = path.join(process.cwd(), 'prisma/migrations');
      if (fs.existsSync(migrationsDir)) {
        const migrations = fs.readdirSync(migrationsDir);
        const umbrellaMigration = migrations.find(m => m.includes('umbrella'));
        
        if (umbrellaMigration) {
          this.addCheck('database', 'Umbrella migration exists', true);
        } else {
          this.addCheck('database', 'Umbrella migration missing', false);
        }
      }

    } catch (error) {
      this.addCheck('database', `Database check error: ${error.message}`, false);
    }
  }

  // ===== API DEPLOYMENT CHECKS =====

  async checkApiDeployment() {
    console.log('🔌 Checking API deployment readiness...');

    try {
      // Check API files
      const apiFiles = [
        'server/services/umbrella-service.js',
        'server/routes/umbrella-api.js',
        'server/routes/umbrella-state-machine-api.js',
        'server/routes/umbrella-security-api.js',
        'server/state-machines/umbrella/UmbrellaStateMachine.js',
        'server/middleware/umbrella-security.js'
      ];

      apiFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          this.addCheck('api', `API file exists: ${file}`, true);
        } else {
          this.addCheck('api', `API file missing: ${file}`, false);
        }
      });

      // Check server integration
      const serverFile = path.join(process.cwd(), 'server/consolidated-server.js');
      if (fs.existsSync(serverFile)) {
        const serverContent = fs.readFileSync(serverFile, 'utf8');
        
        if (serverContent.includes('/api/umbrella')) {
          this.addCheck('api', 'Umbrella API integrated into server', true);
        } else {
          this.addCheck('api', 'Umbrella API not integrated into server', false);
        }

        if (serverContent.includes('/api/umbrella/state-machine')) {
          this.addCheck('api', 'State machine API integrated into server', true);
        } else {
          this.addCheck('api', 'State machine API not integrated into server', false);
        }

        if (serverContent.includes('/api/umbrella/security')) {
          this.addCheck('api', 'Security API integrated into server', true);
        } else {
          this.addCheck('api', 'Security API not integrated into server', false);
        }
      }

      // Check package.json dependencies
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const requiredDeps = ['@prisma/client', 'express', 'jsonwebtoken'];
        
        requiredDeps.forEach(dep => {
          if (packageJson.dependencies && packageJson.dependencies[dep]) {
            this.addCheck('api', `Required dependency available: ${dep}`, true);
          } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
            this.addCheck('api', `Required dev dependency available: ${dep}`, true);
          } else {
            this.addCheck('api', `Missing required dependency: ${dep}`, false);
          }
        });
      }

    } catch (error) {
      this.addCheck('api', `API check error: ${error.message}`, false);
    }
  }

  // ===== FRONTEND DEPLOYMENT CHECKS =====

  async checkFrontendDeployment() {
    console.log('🎨 Checking frontend deployment readiness...');

    try {
      // Check frontend files
      const frontendFiles = [
        'frontend/src/components/umbrella/UmbrellaDashboard.tsx',
        'frontend/src/app/umbrella/page.tsx'
      ];

      frontendFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          this.addCheck('frontend', `Frontend file exists: ${file}`, true);
        } else {
          this.addCheck('frontend', `Frontend file missing: ${file}`, false);
        }
      });

      // Check navigation integration
      const sidebarFile = path.join(process.cwd(), 'frontend/src/components/layout/sidebar.tsx');
      if (fs.existsSync(sidebarFile)) {
        const sidebarContent = fs.readFileSync(sidebarFile, 'utf8');
        if (sidebarContent.includes('Umbrella') && sidebarContent.includes('/umbrella')) {
          this.addCheck('frontend', 'Umbrella navigation added to sidebar', true);
        } else {
          this.addCheck('frontend', 'Umbrella navigation not found in sidebar', false);
        }
      }

      const persistentLayoutFile = path.join(process.cwd(), 'frontend/src/components/layout/persistent-layout.tsx');
      if (fs.existsSync(persistentLayoutFile)) {
        const layoutContent = fs.readFileSync(persistentLayoutFile, 'utf8');
        if (layoutContent.includes('Umbrella') && layoutContent.includes('/umbrella')) {
          this.addCheck('frontend', 'Umbrella navigation added to persistent layout', true);
        } else {
          this.addCheck('frontend', 'Umbrella navigation not found in persistent layout', false);
        }
      }

      // Check frontend dependencies
      const frontendPackageJsonPath = path.join(process.cwd(), 'frontend/package.json');
      if (fs.existsSync(frontendPackageJsonPath)) {
        const frontendPackageJson = JSON.parse(fs.readFileSync(frontendPackageJsonPath, 'utf8'));
        const requiredDeps = ['react', 'next', 'lucide-react'];
        
        requiredDeps.forEach(dep => {
          if (frontendPackageJson.dependencies && frontendPackageJson.dependencies[dep]) {
            this.addCheck('frontend', `Frontend dependency available: ${dep}`, true);
          } else {
            this.addCheck('frontend', `Missing frontend dependency: ${dep}`, false);
          }
        });
      }

    } catch (error) {
      this.addCheck('frontend', `Frontend check error: ${error.message}`, false);
    }
  }

  // ===== SECURITY DEPLOYMENT CHECKS =====

  async checkSecurityDeployment() {
    console.log('🔒 Checking security deployment readiness...');

    try {
      // Check security middleware
      const securityFile = path.join(process.cwd(), 'server/middleware/umbrella-security.js');
      if (fs.existsSync(securityFile)) {
        const securityContent = fs.readFileSync(securityFile, 'utf8');
        
        if (securityContent.includes('verifyUmbrellaAccess')) {
          this.addCheck('security', 'Access verification implemented', true);
        } else {
          this.addCheck('security', 'Access verification missing', false);
        }

        if (securityContent.includes('rateLimit')) {
          this.addCheck('security', 'Rate limiting implemented', true);
        } else {
          this.addCheck('security', 'Rate limiting missing', false);
        }

        if (securityContent.includes('auditLog')) {
          this.addCheck('security', 'Audit logging implemented', true);
        } else {
          this.addCheck('security', 'Audit logging missing', false);
        }

        if (securityContent.includes('GDPR')) {
          this.addCheck('security', 'GDPR compliance implemented', true);
        } else {
          this.addCheck('security', 'GDPR compliance missing', false);
        }
      }

      // Check security API
      const securityApiFile = path.join(process.cwd(), 'server/routes/umbrella-security-api.js');
      if (fs.existsSync(securityApiFile)) {
        this.addCheck('security', 'Security API exists', true);
      } else {
        this.addCheck('security', 'Security API missing', false);
      }

    } catch (error) {
      this.addCheck('security', `Security check error: ${error.message}`, false);
    }
  }

  // ===== INTEGRATION DEPLOYMENT CHECKS =====

  async checkIntegrationDeployment() {
    console.log('🔗 Checking integration deployment readiness...');

    try {
      // Check documentation
      const docFiles = [
        'docs/12-umbrella/PRIVATE_UMBRELLA_SYSTEM.md',
        'docs/12-umbrella/UMBRELLA_IMPLEMENTATION_GUIDE.md',
        'docs/12-umbrella/UMBRELLA_LEGAL_DOCUMENTS.md',
        'docs/12-umbrella/UMBRELLA_SYSTEM_OVERVIEW.md'
      ];

      docFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          this.addCheck('integration', `Documentation exists: ${file}`, true);
        } else {
          this.addCheck('integration', `Documentation missing: ${file}`, false);
        }
      });

      // Check test files
      const testFiles = [
        'server/tests/umbrella-system.test.js',
        'server/tests/umbrella-integration.test.js',
        'server/tests/run-umbrella-tests.js',
        'server/scripts/validate-umbrella-system.js'
      ];

      testFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          this.addCheck('integration', `Test file exists: ${file}`, true);
        } else {
          this.addCheck('integration', `Test file missing: ${file}`, false);
        }
      });

      // Check environment configuration
      const envExampleFile = path.join(process.cwd(), '.env.example');
      if (fs.existsSync(envExampleFile)) {
        const envContent = fs.readFileSync(envExampleFile, 'utf8');
        if (envContent.includes('DATABASE_URL')) {
          this.addCheck('integration', 'Environment configuration exists', true);
        } else {
          this.addCheck('integration', 'Environment configuration incomplete', false);
        }
      }

    } catch (error) {
      this.addCheck('integration', `Integration check error: ${error.message}`, false);
    }
  }

  // ===== DEPLOYMENT COMMANDS =====

  async generateDeploymentCommands() {
    console.log('🚀 Generating deployment commands...');

    const commands = {
      database: [
        'npx prisma generate',
        'npx prisma db push',
        'npx prisma migrate deploy'
      ],
      api: [
        'npm install --production',
        'npm run build',
        'npm start'
      ],
      frontend: [
        'cd frontend && npm install',
        'cd frontend && npm run build',
        'cd frontend && npm start'
      ],
      security: [
        'npm audit',
        'npm audit fix'
      ]
    };

    return commands;
  }

  // ===== HELPER METHODS =====

  addCheck(category, check, passed) {
    this.deploymentChecklist[category].checks.push({ check, passed });
    if (passed) {
      this.deploymentChecklist[category].passed++;
    } else {
      this.deploymentChecklist[category].failed++;
    }
  }

  printDeploymentReport() {
    console.log('\n📊 Deployment Readiness Report:');
    console.log('================================\n');

    let totalPassed = 0;
    let totalFailed = 0;

    Object.entries(this.deploymentChecklist).forEach(([category, results]) => {
      console.log(`📋 ${category.toUpperCase()}:`);
      console.log(`   ✅ Passed: ${results.passed}`);
      console.log(`   ❌ Failed: ${results.failed}`);
      
      results.checks.forEach(({ check, passed }) => {
        const icon = passed ? '✅' : '❌';
        console.log(`   ${icon} ${check}`);
      });
      
      console.log('');
      totalPassed += results.passed;
      totalFailed += results.failed;
    });

    console.log('📈 SUMMARY:');
    console.log(`   Total Checks: ${totalPassed + totalFailed}`);
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    console.log(`   Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);

    if (totalFailed === 0) {
      console.log('\n🎉 All deployment checks passed! System is ready for production!');
      return true;
    } else {
      console.log('\n⚠️ Some deployment checks failed. Please review and fix the issues above.');
      return false;
    }
  }

  async run() {
    console.log('🌂 SmartStart Private Umbrella System - Deployment Preparation');
    console.log('=============================================================\n');

    try {
      await this.checkDatabaseDeployment();
      await this.checkApiDeployment();
      await this.checkFrontendDeployment();
      await this.checkSecurityDeployment();
      await this.checkIntegrationDeployment();
      
      const isReady = this.printDeploymentReport();
      
      if (isReady) {
        console.log('\n🚀 Deployment Commands:');
        console.log('=======================');
        const commands = await this.generateDeploymentCommands();
        
        Object.entries(commands).forEach(([category, cmds]) => {
          console.log(`\n${category.toUpperCase()}:`);
          cmds.forEach(cmd => console.log(`   ${cmd}`));
        });
      }
      
    } catch (error) {
      console.error('💥 Deployment preparation failed:', error);
    }
  }
}

// Run deployment preparation if called directly
if (require.main === module) {
  const preparer = new DeploymentPreparer();
  preparer.run().catch(console.error);
}

module.exports = DeploymentPreparer;
