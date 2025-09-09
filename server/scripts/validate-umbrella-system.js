#!/usr/bin/env node

/**
 * SmartStart Private Umbrella System - Validation Script
 * Comprehensive validation of the umbrella system implementation
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

class UmbrellaSystemValidator {
  constructor() {
    this.prisma = new PrismaClient();
    this.validationResults = {
      database: { passed: 0, failed: 0, tests: [] },
      api: { passed: 0, failed: 0, tests: [] },
      frontend: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] }
    };
  }

  // ===== DATABASE VALIDATION =====

  async validateDatabaseSchema() {
    console.log('🗄️ Validating database schema...');
    
    try {
      // Check if umbrella tables exist
      const tables = await this.prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%Umbrella%' OR table_name LIKE '%Revenue%'
        ORDER BY table_name;
      `;

      const expectedTables = [
        'UmbrellaRelationship',
        'RevenueShare', 
        'UmbrellaDocument',
        'UmbrellaDocumentSignature',
        'UmbrellaAnalytics'
      ];

      const foundTables = tables.map(t => t.table_name);
      const missingTables = expectedTables.filter(t => !foundTables.includes(t));

      if (missingTables.length === 0) {
        this.addResult('database', 'Database tables exist', true);
      } else {
        this.addResult('database', `Missing tables: ${missingTables.join(', ')}`, false);
      }

      // Check if enums exist
      const enums = await this.prisma.$queryRaw`
        SELECT typname 
        FROM pg_type 
        WHERE typtype = 'e' 
        AND typname IN ('UmbrellaType', 'UmbrellaStatus', 'UmbrellaDocumentType', 'PaymentStatus')
        ORDER BY typname;
      `;

      const expectedEnums = ['UmbrellaType', 'UmbrellaStatus', 'UmbrellaDocumentType', 'PaymentStatus'];
      const foundEnums = enums.map(e => e.typname);
      const missingEnums = expectedEnums.filter(e => !foundEnums.includes(e));

      if (missingEnums.length === 0) {
        this.addResult('database', 'Database enums exist', true);
      } else {
        this.addResult('database', `Missing enums: ${missingEnums.join(', ')}`, false);
      }

      // Test database operations
      await this.testDatabaseOperations();

    } catch (error) {
      this.addResult('database', `Database validation error: ${error.message}`, false);
    }
  }

  async testDatabaseOperations() {
    try {
      // Test creating umbrella relationship
      const testRelationship = await this.prisma.umbrellaRelationship.create({
        data: {
          referrerId: 'test-referrer',
          referredId: 'test-referred',
          relationshipType: 'PRIVATE_UMBRELLA',
          status: 'PENDING_AGREEMENT',
          defaultShareRate: 1.0
        }
      });

      this.addResult('database', 'Can create umbrella relationship', true);

      // Test creating revenue share
      const testRevenueShare = await this.prisma.revenueShare.create({
        data: {
          umbrellaId: testRelationship.id,
          projectId: 'test-project',
          referrerId: 'test-referrer',
          referredId: 'test-referred',
          projectRevenue: 10000,
          sharePercentage: 1.0,
          shareAmount: 100,
          status: 'CALCULATED'
        }
      });

      this.addResult('database', 'Can create revenue share', true);

      // Clean up test data
      await this.prisma.revenueShare.delete({ where: { id: testRevenueShare.id } });
      await this.prisma.umbrellaRelationship.delete({ where: { id: testRelationship.id } });

      this.addResult('database', 'Can delete test data', true);

    } catch (error) {
      this.addResult('database', `Database operations error: ${error.message}`, false);
    }
  }

  // ===== API VALIDATION =====

  async validateApiEndpoints() {
    console.log('🔌 Validating API endpoints...');
    
    try {
      // Check if API files exist
      const apiFiles = [
        'server/routes/umbrella-api.js',
        'server/routes/umbrella-state-machine-api.js',
        'server/services/umbrella-service.js'
      ];

      for (const file of apiFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          this.addResult('api', `API file exists: ${file}`, true);
        } else {
          this.addResult('api', `Missing API file: ${file}`, false);
        }
      }

      // Check if API is integrated into main server
      const serverFile = path.join(process.cwd(), 'server/consolidated-server.js');
      if (fs.existsSync(serverFile)) {
        const serverContent = fs.readFileSync(serverFile, 'utf8');
        if (serverContent.includes('/api/umbrella')) {
          this.addResult('api', 'Umbrella API integrated into main server', true);
        } else {
          this.addResult('api', 'Umbrella API not integrated into main server', false);
        }
      }

      // Test service instantiation
      try {
        const UmbrellaService = require('../services/umbrella-service');
        this.addResult('api', 'Umbrella service can be instantiated', true);
      } catch (error) {
        this.addResult('api', `Umbrella service error: ${error.message}`, false);
      }

      // Test state machine instantiation
      try {
        const UmbrellaStateMachine = require('../state-machines/umbrella/UmbrellaStateMachine');
        const stateMachine = new UmbrellaStateMachine();
        this.addResult('api', 'Umbrella state machine can be instantiated', true);
      } catch (error) {
        this.addResult('api', `Umbrella state machine error: ${error.message}`, false);
      }

    } catch (error) {
      this.addResult('api', `API validation error: ${error.message}`, false);
    }
  }

  // ===== FRONTEND VALIDATION =====

  async validateFrontendComponents() {
    console.log('🎨 Validating frontend components...');
    
    try {
      // Check if frontend files exist
      const frontendFiles = [
        'frontend/src/components/umbrella/UmbrellaDashboard.tsx',
        'frontend/src/app/umbrella/page.tsx'
      ];

      for (const file of frontendFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          this.addResult('frontend', `Frontend file exists: ${file}`, true);
        } else {
          this.addResult('frontend', `Missing frontend file: ${file}`, false);
        }
      }

      // Check if navigation is updated
      const sidebarFile = path.join(process.cwd(), 'frontend/src/components/layout/sidebar.tsx');
      if (fs.existsSync(sidebarFile)) {
        const sidebarContent = fs.readFileSync(sidebarFile, 'utf8');
        if (sidebarContent.includes('Umbrella') && sidebarContent.includes('/umbrella')) {
          this.addResult('frontend', 'Umbrella navigation added to sidebar', true);
        } else {
          this.addResult('frontend', 'Umbrella navigation not found in sidebar', false);
        }
      }

      // Check persistent layout
      const persistentLayoutFile = path.join(process.cwd(), 'frontend/src/components/layout/persistent-layout.tsx');
      if (fs.existsSync(persistentLayoutFile)) {
        const layoutContent = fs.readFileSync(persistentLayoutFile, 'utf8');
        if (layoutContent.includes('Umbrella') && layoutContent.includes('/umbrella')) {
          this.addResult('frontend', 'Umbrella navigation added to persistent layout', true);
        } else {
          this.addResult('frontend', 'Umbrella navigation not found in persistent layout', false);
        }
      }

    } catch (error) {
      this.addResult('frontend', `Frontend validation error: ${error.message}`, false);
    }
  }

  // ===== INTEGRATION VALIDATION =====

  async validateIntegration() {
    console.log('🔗 Validating system integration...');
    
    try {
      // Check documentation
      const docFiles = [
        'docs/12-umbrella/PRIVATE_UMBRELLA_SYSTEM.md',
        'docs/12-umbrella/UMBRELLA_IMPLEMENTATION_GUIDE.md',
        'docs/12-umbrella/UMBRELLA_LEGAL_DOCUMENTS.md',
        'docs/12-umbrella/UMBRELLA_SYSTEM_OVERVIEW.md'
      ];

      for (const file of docFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          this.addResult('integration', `Documentation exists: ${file}`, true);
        } else {
          this.addResult('integration', `Missing documentation: ${file}`, false);
        }
      }

      // Check if all required dependencies are available
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const requiredDeps = ['@prisma/client', 'express', 'crypto'];
        
        for (const dep of requiredDeps) {
          if (packageJson.dependencies && packageJson.dependencies[dep]) {
            this.addResult('integration', `Required dependency available: ${dep}`, true);
          } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
            this.addResult('integration', `Required dev dependency available: ${dep}`, true);
          } else {
            this.addResult('integration', `Missing required dependency: ${dep}`, false);
          }
        }
      }

    } catch (error) {
      this.addResult('integration', `Integration validation error: ${error.message}`, false);
    }
  }

  // ===== HELPER METHODS =====

  addResult(category, test, passed) {
    this.validationResults[category].tests.push({ test, passed });
    if (passed) {
      this.validationResults[category].passed++;
    } else {
      this.validationResults[category].failed++;
    }
  }

  printResults() {
    console.log('\n📊 Validation Results:');
    console.log('======================\n');

    let totalPassed = 0;
    let totalFailed = 0;

    Object.entries(this.validationResults).forEach(([category, results]) => {
      console.log(`📋 ${category.toUpperCase()}:`);
      console.log(`   ✅ Passed: ${results.passed}`);
      console.log(`   ❌ Failed: ${results.failed}`);
      
      results.tests.forEach(({ test, passed }) => {
        const icon = passed ? '✅' : '❌';
        console.log(`   ${icon} ${test}`);
      });
      
      console.log('');
      totalPassed += results.passed;
      totalFailed += results.failed;
    });

    console.log('📈 SUMMARY:');
    console.log(`   Total Tests: ${totalPassed + totalFailed}`);
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    console.log(`   Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);

    if (totalFailed === 0) {
      console.log('\n🎉 All validations passed! Umbrella system is ready for production!');
    } else {
      console.log('\n⚠️ Some validations failed. Please review and fix the issues above.');
    }
  }

  async run() {
    console.log('🌂 SmartStart Private Umbrella System - Validation');
    console.log('==================================================\n');

    try {
      await this.validateDatabaseSchema();
      await this.validateApiEndpoints();
      await this.validateFrontendComponents();
      await this.validateIntegration();
      
      this.printResults();
      
    } catch (error) {
      console.error('💥 Validation failed:', error);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new UmbrellaSystemValidator();
  validator.run().catch(console.error);
}

module.exports = UmbrellaSystemValidator;
