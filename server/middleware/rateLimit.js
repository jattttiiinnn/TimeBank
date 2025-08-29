/**
 * Rate Limiting Middleware
 * Implements rate limiting for various endpoints to prevent abuse
 */

import { SECURITY_CONFIG } from '../config/security.js';

// Simple in-memory rate limiting store
// Note: In production, use Redis or similar persistent store
class RateLimitStore {
  constructor() {
    this.requests = new Map();
    
    // Clean up old entries every 15 minutes
    setInterval(() => {
      this.cleanup();
    }, 15 * 60 * 1000);
  }

  increment(key, windowMs) {
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const storeKey = `${key}:${window}`;
    
    const current = this.requests.get(storeKey) || 0;
    this.requests.set(storeKey, current + 1);
    
    return current + 1;
  }

  cleanup() {
    const now = Date.now();
    const cutoff = now - (30 * 60 * 1000); // Keep 30 minutes of data
    
    for (const [key] of this.requests.entries()) {
      const timestamp = parseInt(key.split(':')[1]) * SECURITY_CONFIG.AUTH_RATE_LIMIT.windowMs;
      if (timestamp < cutoff) {
        this.requests.delete(key);
      }
    }
  }

  reset(key) {
    // Remove all entries for this key
    for (const [storeKey] of this.requests.entries()) {
      if (storeKey.startsWith(key + ':')) {
        this.requests.delete(storeKey);
      }
    }
  }
}

const store = new RateLimitStore();

// Create rate limiting middleware
export const createRateLimit = (options = {}) => {
  const config = {
    windowMs: options.windowMs || SECURITY_CONFIG.AUTH_RATE_LIMIT.windowMs,
    max: options.max || SECURITY_CONFIG.AUTH_RATE_LIMIT.max,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    message: options.message || 'Too many requests, please try again later.',
    onLimitReached: options.onLimitReached || null
  };

  return (req, res, next) => {
    const key = config.keyGenerator(req);
    const current = store.increment(key, config.windowMs);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': config.max,
      'X-RateLimit-Remaining': Math.max(0, config.max - current),
      'X-RateLimit-Reset': new Date(Date.now() + config.windowMs).toISOString()
    });

    if (current > config.max) {
      if (config.onLimitReached) {
        config.onLimitReached(req, res);
      }
      
      console.warn(`Rate limit exceeded for ${key}: ${current}/${config.max}`);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000)
      });
    }

    // Store the current count in res.locals for potential cleanup on success
    res.locals.rateLimitKey = key;
    res.locals.rateLimitCount = current;
    res.locals.rateLimitConfig = config;

    next();
  };
};

// Middleware to reset rate limit on successful requests (if configured)
export const resetOnSuccess = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    const config = res.locals.rateLimitConfig;
    const key = res.locals.rateLimitKey;
    
    // If configured to skip successful requests and this is a success (2xx status)
    if (config && config.skipSuccessfulRequests && res.statusCode >= 200 && res.statusCode < 300) {
      store.reset(key);
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

// Predefined rate limiters for common use cases
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  keyGenerator: (req) => `auth:${req.ip}:${req.body.email || 'unknown'}`
});

export const generalApiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  skipSuccessfulRequests: false,
  message: 'Too many API requests. Please try again later.',
  keyGenerator: (req) => `api:${req.ip}`
});

export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute
  skipSuccessfulRequests: false,
  message: 'This action is rate limited. Please try again in a minute.',
  keyGenerator: (req) => `strict:${req.ip}:${req.user?.id || 'anonymous'}`
});

export default {
  createRateLimit,
  resetOnSuccess,
  authRateLimit,
  generalApiRateLimit,
  strictRateLimit
};