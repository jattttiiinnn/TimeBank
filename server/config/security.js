/**
 * Security Configuration
 * Centralized security settings and admin management
 */

// Environment-based admin configuration
const getAdminEmails = () => {
  const adminEmailsStr = process.env.ADMIN_EMAILS;
  if (!adminEmailsStr) {
    console.warn('⚠️  No ADMIN_EMAILS configured. Admin features will be disabled.');
    return [];
  }
  
  return adminEmailsStr.split(',').map(email => email.trim().toLowerCase());
};

// Admin verification
export const isAdmin = (email) => {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
};

// Security constants
export const SECURITY_CONFIG = {
  // JWT settings
  JWT_EXPIRY: process.env.JWT_EXPIRE || '7d',
  
  // Rate limiting
  AUTH_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    skipSuccessfulRequests: true
  },
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL: false,
  
  // OTP settings
  OTP_EXPIRY_MINUTES: 10,
  OTP_LENGTH: 6,
  
  // Session security
  SESSION_SECURE: process.env.NODE_ENV === 'production',
  SESSION_HTTP_ONLY: true,
  SESSION_SAME_SITE: 'strict',
  
  // CORS settings
  ALLOWED_ORIGINS: process.env.NODE_ENV === 'production' 
    ? [
        'https://timebank-e67e2.web.app',
        'https://www.timebank-e67e2.web.app'
      ]
    : ['http://localhost:5173', 'http://localhost:3000'],
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
};

// Environment validation
export const validateEnvironment = () => {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters for security');
  }
  
  // Check for default/weak secrets
  const weakSecrets = ['your-super-secret-jwt-key-here-change-this-in-production', 'secret', 'password'];
  if (weakSecrets.includes(process.env.JWT_SECRET)) {
    throw new Error('🚨 SECURITY RISK: Default or weak JWT_SECRET detected. Please use a strong, unique secret.');
  }
};

export default {
  isAdmin,
  SECURITY_CONFIG,
  validateEnvironment
};