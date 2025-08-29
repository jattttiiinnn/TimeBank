/**
 * Security Tests
 * Basic security validation tests for the TimeBank application
 */

import { SECURITY_CONFIG } from '../server/config/security.js';
import { validatePassword, isValidEmail } from '../server/middleware/validation.js';

// Test security configuration
export const testSecurityConfig = () => {
  const tests = [];
  
  // Test password requirements
  tests.push({
    name: 'Password validation - too short',
    test: () => {
      const result = validatePassword('123');
      return !result.isValid && result.errors.length > 0;
    }
  });
  
  tests.push({
    name: 'Password validation - valid password',
    test: () => {
      const result = validatePassword('StrongPassword123');
      return result.isValid;
    }
  });
  
  // Test email validation
  tests.push({
    name: 'Email validation - invalid email',
    test: () => !isValidEmail('invalid-email')
  });
  
  tests.push({
    name: 'Email validation - valid email',
    test: () => isValidEmail('test@example.com')
  });
  
  // Test security headers are configured
  tests.push({
    name: 'Security headers configured',
    test: () => SECURITY_CONFIG.SECURITY_HEADERS['X-Content-Type-Options'] === 'nosniff'
  });
  
  // Test rate limiting is configured
  tests.push({
    name: 'Rate limiting configured',
    test: () => SECURITY_CONFIG.AUTH_RATE_LIMIT.max === 5
  });
  
  return tests;
};

// Run security tests
export const runSecurityTests = () => {
  const tests = testSecurityConfig();
  const results = [];
  
  console.log('🔒 Running Security Tests...\n');
  
  tests.forEach(test => {
    try {
      const passed = test.test();
      results.push({ name: test.name, passed });
      console.log(`${passed ? '✅' : '❌'} ${test.name}`);
    } catch (error) {
      results.push({ name: test.name, passed: false, error: error.message });
      console.log(`❌ ${test.name} - Error: ${error.message}`);
    }
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`\n📊 Results: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All security tests passed!');
  } else {
    console.log('⚠️  Some security tests failed. Please review the implementation.');
  }
  
  return {
    passed: passedCount === totalCount,
    results
  };
};

// Environment security check
export const checkEnvironmentSecurity = () => {
  const checks = [];
  
  // Check for required environment variables
  const requiredVars = ['JWT_SECRET', 'MONGODB_URI'];
  requiredVars.forEach(varName => {
    checks.push({
      name: `Environment variable ${varName} is set`,
      passed: !!process.env[varName]
    });
  });
  
  // Check JWT secret strength
  if (process.env.JWT_SECRET) {
    checks.push({
      name: 'JWT_SECRET is strong enough (min 32 chars)',
      passed: process.env.JWT_SECRET.length >= 32
    });
  }
  
  // Check NODE_ENV
  checks.push({
    name: 'NODE_ENV is set',
    passed: !!process.env.NODE_ENV
  });
  
  console.log('\n🌍 Environment Security Checks...\n');
  
  checks.forEach(check => {
    console.log(`${check.passed ? '✅' : '❌'} ${check.name}`);
  });
  
  const passedCount = checks.filter(c => c.passed).length;
  console.log(`\n📊 Environment: ${passedCount}/${checks.length} checks passed`);
  
  return {
    passed: passedCount === checks.length,
    checks
  };
};

// Main security test runner
export const runAllSecurityTests = () => {
  console.log('🛡️  TimeBank Security Validation\n');
  console.log('================================\n');
  
  const securityTests = runSecurityTests();
  const environmentTests = checkEnvironmentSecurity();
  
  const allPassed = securityTests.passed && environmentTests.passed;
  
  console.log('\n🏁 Final Security Status');
  console.log('========================');
  
  if (allPassed) {
    console.log('✅ All security checks passed! The application is ready for production.');
  } else {
    console.log('❌ Some security checks failed. Please address the issues before deployment.');
  }
  
  return {
    allPassed,
    securityTests,
    environmentTests
  };
};

export default {
  testSecurityConfig,
  runSecurityTests,
  checkEnvironmentSecurity,
  runAllSecurityTests
};