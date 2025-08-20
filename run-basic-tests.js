#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class BasicTestRunner {
  constructor() {
    this.results = {
      unit: { passed: false, duration: 0 },
      integration: { passed: false, duration: 0 },
      e2e: { passed: false, duration: 0 },
      performance: { passed: false, duration: 0 }
    };
    this.startTime = Date.now();
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async runCommand(command, args = []) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      this.log(`Running: ${command} ${args.join(' ')}`, colors.cyan);
      
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        resolve({ success: code === 0, duration, code });
      });

      child.on('error', (error) => {
        const duration = Date.now() - startTime;
        this.log(`Command error: ${error.message}`, colors.red);
        resolve({ success: false, duration, error: error.message });
      });
    });
  }

  async runUnitTests() {
    this.log('\n🧪 Running Unit Tests...', colors.blue);
    this.log('=' .repeat(50), colors.blue);
    
    const result = await this.runCommand('npm', ['test']);
    this.results.unit.passed = result.success;
    this.results.unit.duration = result.duration;

    if (result.success) {
      this.log('✅ Unit tests passed', colors.green);
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

    this.log('\n📊 BASIC TEST SUMMARY', colors.bright);
    this.log('=' .repeat(50), colors.bright);

    Object.entries(this.results).forEach(([type, result]) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const color = result.passed ? colors.green : colors.red;
      const duration = this.formatDuration(result.duration);
      
      this.log(`${status} ${type.toUpperCase().padEnd(12)} ${duration}`, color);
    });

    this.log('\n' + '=' .repeat(50), colors.bright);
    
    const overallStatus = passedTests === totalTests ? 'PASSED' : 'FAILED';
    const overallColor = passedTests === totalTests ? colors.green : colors.red;
    
    this.log(`Overall: ${overallStatus} (${passedTests}/${totalTests})`, overallColor);
    this.log(`Total Duration: ${this.formatDuration(totalDuration)}`, colors.cyan);

    if (passedTests === totalTests) {
      this.log('\n🎉 All basic tests passed! Your test setup is working correctly.', colors.green);
      this.log('💡 You can now run the full test suite with: node run-all-tests.js', colors.cyan);
    } else {
      this.log('\n💡 Some tests failed. Check the output above for details.', colors.yellow);
    }

    return passedTests === totalTests;
  }

  async run() {
    this.log('🚀 TimeBank Basic Test Suite', colors.bright);
    this.log('Running basic tests to verify setup...', colors.cyan);

    // Run all test suites
    await this.runUnitTests();
    await this.runIntegrationTests();
    await this.runE2ETests();
    await this.runPerformanceTests();

    // Generate report
    const allPassed = this.generateReport();

    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1);
  }
}

// Run the basic test suite
const runner = new BasicTestRunner();
runner.run().catch(error => {
  console.error('Basic test runner failed:', error);
  process.exit(1);
});