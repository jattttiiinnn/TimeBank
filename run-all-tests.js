#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: false, duration: 0, coverage: null },
      integration: { passed: false, duration: 0 },
      e2e: { passed: false, duration: 0 },
      performance: { passed: false, duration: 0 }
    };
    this.startTime = Date.now();
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        ...options
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        if (code === 0) {
          resolve({ success: true, duration });
        } else {
          resolve({ success: false, duration, code });
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async checkPrerequisites() {
    this.log('\n🔍 Checking prerequisites...', colors.cyan);
    
    try {
      // Check if node_modules exists
      await fs.access('node_modules');
      this.log('✅ Dependencies installed', colors.green);
    } catch {
      this.log('❌ Dependencies not installed. Run: npm install', colors.red);
      return false;
    }

    // Check if test files exist
    const testDirs = ['tests/unit', 'tests/integration', 'tests/e2e'];
    for (const dir of testDirs) {
      try {
        await fs.access(dir);
        this.log(`✅ ${dir} directory exists`, colors.green);
      } catch {
        this.log(`⚠️  ${dir} directory not found`, colors.yellow);
      }
    }

    return true;
  }

  async runUnitTests() {
    this.log('\n🧪 Running Unit Tests...', colors.blue);
    this.log('=' .repeat(50), colors.blue);
    
    const result = await this.runCommand('npm', ['run', 'test:coverage']);
    this.results.unit.passed = result.success;
    this.results.unit.duration = result.duration;

    if (result.success) {
      this.log('✅ Unit tests passed', colors.green);
      
      // Try to read coverage report
      try {
        const coverageFile = await fs.readFile('coverage/coverage-summary.json', 'utf8');
        const coverage = JSON.parse(coverageFile);
        this.results.unit.coverage = coverage.total;
        this.log(`📊 Coverage: ${coverage.total.lines.pct}% lines, ${coverage.total.functions.pct}% functions`, colors.cyan);
      } catch {
        this.log('📊 Coverage report not available', colors.yellow);
      }
    } else {
      this.log('❌ Unit tests failed', colors.red);
    }

    return result.success;
  }

  async runIntegrationTests() {
    this.log('\n🔗 Running Integration Tests...', colors.blue);
    this.log('=' .repeat(50), colors.blue);
    
    const result = await this.runCommand('npm', ['run', 'test:integration']);
    this.results.integration.passed = result.success;
    this.results.integration.duration = result.duration;

    if (result.success) {
      this.log('✅ Integration tests passed', colors.green);
    } else {
      this.log('❌ Integration tests failed', colors.red);
    }

    return result.success;
  }

  async runE2ETests() {
    this.log('\n🌐 Running End-to-End Tests...', colors.blue);
    this.log('=' .repeat(50), colors.blue);
    
    const result = await this.runCommand('npm', ['run', 'test:e2e']);
    this.results.e2e.passed = result.success;
    this.results.e2e.duration = result.duration;

    if (result.success) {
      this.log('✅ E2E tests passed', colors.green);
    } else {
      this.log('❌ E2E tests failed', colors.red);
    }

    return result.success;
  }

  async runPerformanceTests() {
    this.log('\n⚡ Running Performance Tests...', colors.blue);
    this.log('=' .repeat(50), colors.blue);
    
    const result = await this.runCommand('npm', ['run', 'test:performance']);
    this.results.performance.passed = result.success;
    this.results.performance.duration = result.duration;

    if (result.success) {
      this.log('✅ Performance tests passed', colors.green);
    } else {
      this.log('❌ Performance tests failed', colors.red);
    }

    return result.success;
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passedTests = Object.values(this.results).filter(r => r.passed).length;
    const totalTests = Object.keys(this.results).length;

    this.log('\n📊 TEST SUMMARY REPORT', colors.bright);
    this.log('=' .repeat(60), colors.bright);

    // Individual test results
    Object.entries(this.results).forEach(([type, result]) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const color = result.passed ? colors.green : colors.red;
      const duration = this.formatDuration(result.duration);
      
      this.log(`${status} ${type.toUpperCase().padEnd(12)} ${duration}`, color);
      
      if (type === 'unit' && result.coverage) {
        this.log(`     Coverage: ${result.coverage.lines.pct}% lines, ${result.coverage.statements.pct}% statements`, colors.cyan);
      }
    });

    this.log('\n' + '=' .repeat(60), colors.bright);
    
    // Overall summary
    const overallStatus = passedTests === totalTests ? 'PASSED' : 'FAILED';
    const overallColor = passedTests === totalTests ? colors.green : colors.red;
    
    this.log(`Overall: ${overallStatus} (${passedTests}/${totalTests})`, overallColor);
    this.log(`Total Duration: ${this.formatDuration(totalDuration)}`, colors.cyan);

    // Recommendations
    if (passedTests < totalTests) {
      this.log('\n💡 RECOMMENDATIONS:', colors.yellow);
      
      Object.entries(this.results).forEach(([type, result]) => {
        if (!result.passed) {
          switch (type) {
            case 'unit':
              this.log(`• Fix unit test failures - check component logic and mocks`, colors.yellow);
              break;
            case 'integration':
              this.log(`• Fix integration test failures - check API endpoints and database`, colors.yellow);
              break;
            case 'e2e':
              this.log(`• Fix E2E test failures - check UI interactions and workflows`, colors.yellow);
              break;
            case 'performance':
              this.log(`• Fix performance issues - optimize loading times and responsiveness`, colors.yellow);
              break;
          }
        }
      });
    } else {
      this.log('\n🎉 All tests passed! Your application is ready for deployment.', colors.green);
    }

    return passedTests === totalTests;
  }

  async generateHTMLReport() {
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>TimeBank Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .test-section { margin: 20px 0; padding: 15px; border-left: 4px solid #ddd; }
        .pass { border-left-color: #4CAF50; background: #f1f8e9; }
        .fail { border-left-color: #f44336; background: #ffebee; }
        .summary { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .coverage { background: #fff3e0; padding: 10px; margin: 10px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TimeBank Application Test Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Tests:</strong> ${Object.keys(this.results).length}</p>
        <p><strong>Passed:</strong> ${Object.values(this.results).filter(r => r.passed).length}</p>
        <p><strong>Failed:</strong> ${Object.values(this.results).filter(r => !r.passed).length}</p>
        <p><strong>Total Duration:</strong> ${this.formatDuration(Date.now() - this.startTime)}</p>
    </div>
    
    ${Object.entries(this.results).map(([type, result]) => `
        <div class="test-section ${result.passed ? 'pass' : 'fail'}">
            <h3>${type.toUpperCase()} Tests</h3>
            <p><strong>Status:</strong> ${result.passed ? 'PASSED' : 'FAILED'}</p>
            <p><strong>Duration:</strong> ${this.formatDuration(result.duration)}</p>
            ${type === 'unit' && result.coverage ? `
                <div class="coverage">
                    <strong>Coverage:</strong><br>
                    Lines: ${result.coverage.lines.pct}%<br>
                    Functions: ${result.coverage.functions.pct}%<br>
                    Statements: ${result.coverage.statements.pct}%<br>
                    Branches: ${result.coverage.branches.pct}%
                </div>
            ` : ''}
        </div>
    `).join('')}
    
</body>
</html>`;

    try {
      await fs.writeFile('test-report.html', htmlReport);
      this.log('\n📄 HTML report generated: test-report.html', colors.cyan);
    } catch (error) {
      this.log(`⚠️  Could not generate HTML report: ${error.message}`, colors.yellow);
    }
  }

  async run() {
    this.log('🚀 TimeBank Application Test Suite', colors.bright);
    this.log('Starting comprehensive testing...', colors.cyan);

    // Check prerequisites
    const prereqsPassed = await this.checkPrerequisites();
    if (!prereqsPassed) {
      process.exit(1);
    }

    // Run all test suites
    const testSuites = [
      { name: 'Unit', fn: () => this.runUnitTests() },
      { name: 'Integration', fn: () => this.runIntegrationTests() },
      { name: 'E2E', fn: () => this.runE2ETests() },
      { name: 'Performance', fn: () => this.runPerformanceTests() }
    ];

    for (const suite of testSuites) {
      try {
        await suite.fn();
      } catch (error) {
        this.log(`❌ ${suite.name} tests encountered an error: ${error.message}`, colors.red);
      }
    }

    // Generate reports
    const allPassed = this.generateReport();
    await this.generateHTMLReport();

    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1);
  }
}

// Run the test suite
const runner = new TestRunner();
runner.run().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});