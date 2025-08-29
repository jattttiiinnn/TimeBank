/**
 * Input Validation Middleware
 * Provides comprehensive input validation and sanitization
 */

import { SECURITY_CONFIG } from '../config/security.js';

// Sanitize string input
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove potential XSS characters and normalize
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate MongoDB ObjectId
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// General input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Sanitize string fields in body
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        req.body[key] = sanitizeString(value);
      }
    }
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        req.query[key] = sanitizeString(value);
      }
    }
  }
  
  next();
};

// Validate registration input
export const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];
  
  // Required fields
  if (!name) errors.push('Name is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  // Name validation
  if (name.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  if (name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }
  
  // Email validation
  if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  
  // Password validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  next();
};

// Validate login input
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  next();
};

// Validate OTP input
export const validateOTP = (req, res, next) => {
  const { email, otp } = req.body;
  const errors = [];
  
  if (!email) errors.push('Email is required');
  if (!otp) errors.push('OTP is required');
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!/^\d{6}$/.test(otp)) {
    errors.push('OTP must be a 6-digit number');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  next();
};

// Validate MongoDB ObjectId in params
export const validateObjectIdParam = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({ message: `${paramName} is required` });
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: `Invalid ${paramName} format` });
    }
    
    next();
  };
};

// Validate user profile update
export const validateProfileUpdate = (req, res, next) => {
  const { skillsOffered, skillsLearning } = req.body;
  const errors = [];
  
  // Validate skills arrays if provided
  const validateSkillsArray = (skills, fieldName) => {
    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        errors.push(`${fieldName} must be an array`);
        return;
      }
      
      if (skills.length > 50) {
        errors.push(`${fieldName} cannot have more than 50 items`);
        return;
      }
      
      skills.forEach((skill, index) => {
        if (!skill || typeof skill !== 'object') {
          errors.push(`${fieldName}[${index}] must be an object`);
          return;
        }
        
        if (!skill.name || typeof skill.name !== 'string') {
          errors.push(`${fieldName}[${index}].name is required and must be a string`);
        } else if (skill.name.length > 100) {
          errors.push(`${fieldName}[${index}].name must be less than 100 characters`);
        }
        
        if (skill.description && typeof skill.description !== 'string') {
          errors.push(`${fieldName}[${index}].description must be a string`);
        } else if (skill.description && skill.description.length > 500) {
          errors.push(`${fieldName}[${index}].description must be less than 500 characters`);
        }
      });
    }
  };
  
  validateSkillsArray(skillsOffered, 'skillsOffered');
  validateSkillsArray(skillsLearning, 'skillsLearning');
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  next();
};

export default {
  sanitizeString,
  isValidEmail,
  validatePassword,
  isValidObjectId,
  sanitizeInput,
  validateRegistration,
  validateLogin,
  validateOTP,
  validateObjectIdParam,
  validateProfileUpdate
};