# Security Documentation

This document outlines the security measures implemented in the TimeBank application and provides guidelines for maintaining security in production.

## 🔒 Security Features Implemented

### 1. Authentication & Authorization
- **JWT Token-based Authentication**: Secure token-based authentication with configurable expiry
- **Email Verification**: OTP-based email verification for user registration
- **Role-based Access Control**: Admin roles configured via environment variables
- **Rate Limiting**: Protects against brute force attacks and API abuse

### 2. Input Validation & Sanitization
- **Comprehensive Input Validation**: All user inputs are validated and sanitized
- **XSS Protection**: HTML tags and JavaScript code stripped from inputs
- **SQL Injection Prevention**: MongoDB with Mongoose provides built-in protection
- **Parameter Validation**: ObjectId and other parameter validation

### 3. Security Headers
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Enables XSS filtering
- **Strict-Transport-Security**: Enforces HTTPS connections
- **Referrer-Policy**: Controls referrer information

### 4. CORS Configuration
- **Environment-specific Origins**: Restrictive CORS in production
- **Credentials Support**: Secure credential handling
- **Method Restrictions**: Limited to necessary HTTP methods

### 5. Data Protection
- **Password Hashing**: bcryptjs with salt rounds for secure password storage
- **Sensitive Data Exclusion**: Password and OTP fields excluded from queries
- **Environment Variable Validation**: Ensures required secrets are present

## 🚨 Critical Security Configurations

### Environment Variables (Required)
```env
# JWT Configuration - Use a strong, unique secret (min 32 characters)
JWT_SECRET=your-strong-unique-jwt-secret-min-32-characters
JWT_EXPIRE=7d

# Admin Configuration - Comma-separated list of admin emails
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Database
MONGODB_URI=mongodb://your-mongodb-connection-string

# Email Service (for OTP)
EMAIL_USER=your-smtp-email@example.com
EMAIL_PASS=your-smtp-password

# Node Environment
NODE_ENV=production
```

### Rate Limiting Configuration
- **Authentication endpoints**: 5 attempts per 15 minutes per IP
- **General API endpoints**: 100 requests per 15 minutes per IP
- **OTP operations**: Strict rate limiting to prevent abuse

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (configurable)
- At least one lowercase letter (configurable)
- At least one number (configurable)
- Special characters (optional, configurable)

## 🛡️ Production Security Checklist

### Before Deployment
- [ ] Change all default secrets and passwords
- [ ] Set strong JWT_SECRET (minimum 32 characters)
- [ ] Configure ADMIN_EMAILS environment variable
- [ ] Enable HTTPS/SSL certificates
- [ ] Set NODE_ENV=production
- [ ] Review and configure CORS origins
- [ ] Set up proper database access controls
- [ ] Enable database encryption at rest
- [ ] Configure proper backup strategies

### Security Monitoring
- [ ] Set up logging for failed authentication attempts
- [ ] Monitor rate limiting violations
- [ ] Track admin access and operations
- [ ] Set up alerts for suspicious activities
- [ ] Regular security audits and updates

### Database Security
- [ ] Use strong MongoDB authentication
- [ ] Enable MongoDB encryption
- [ ] Restrict database network access
- [ ] Regular database backups
- [ ] Monitor database performance and access

### Infrastructure Security
- [ ] Use HTTPS everywhere
- [ ] Set up proper firewall rules
- [ ] Regular security patches
- [ ] Secure server access (SSH keys)
- [ ] Use container security best practices

## 🔧 Security Configuration Details

### JWT Token Security
```javascript
// Tokens include:
// - User ID for identification
// - Configurable expiry time
// - Signed with strong secret
// - Verified on each request
```

### OTP System
```javascript
// OTP Features:
// - 6-digit random numbers
// - 10-minute expiry
// - Rate limited generation
// - Secure email delivery
// - Automatic cleanup on verification
```

### Rate Limiting Implementation
```javascript
// Rate Limiting Stores:
// - In-memory store (development)
// - Redis recommended for production
// - Automatic cleanup of old entries
// - Configurable limits per endpoint
```

## 🚫 Security Anti-patterns Removed

### What Was Fixed
1. **Exposed Firebase Credentials**: Removed from version control
2. **Hardcoded Admin Emails**: Moved to environment configuration
3. **Disabled Email Verification**: Re-enabled OTP verification
4. **Debug Endpoints**: Secured or removed in production
5. **Permissive CORS**: Restricted to configured origins
6. **No Rate Limiting**: Added comprehensive rate limiting
7. **Weak Input Validation**: Enhanced validation and sanitization

### Debug Endpoints
Debug endpoints are now:
- Only available in development mode
- Protected with authentication
- Include security warnings
- Automatically disabled in production

## 📝 Security Best Practices

### For Developers
1. **Never commit secrets** to version control
2. **Use environment variables** for all configuration
3. **Validate all inputs** before processing
4. **Use parameterized queries** (automatic with Mongoose)
5. **Keep dependencies updated** regularly
6. **Follow principle of least privilege**

### For Administrators
1. **Use strong, unique passwords** for all accounts
2. **Enable two-factor authentication** where possible
3. **Regularly review access logs**
4. **Keep systems updated** with security patches
5. **Monitor for suspicious activities**
6. **Have incident response plan** ready

### For Operations
1. **Use HTTPS everywhere**
2. **Implement proper logging**
3. **Set up monitoring and alerts**
4. **Regular security assessments**
5. **Backup and disaster recovery plans**
6. **Network segmentation** where appropriate

## 🔍 Security Audit Schedule

### Regular Tasks
- **Weekly**: Review access logs and failed authentication attempts
- **Monthly**: Update dependencies and check for vulnerabilities
- **Quarterly**: Full security audit and penetration testing
- **Annually**: Review and update security policies

### Automated Monitoring
- Failed authentication attempts
- Rate limiting violations
- Admin access and operations
- Database connection anomalies
- API endpoint abuse

## 🆘 Incident Response

### In Case of Security Incident
1. **Immediate Response**: Isolate affected systems
2. **Assessment**: Determine scope and impact
3. **Containment**: Prevent further damage
4. **Recovery**: Restore secure operations
5. **Documentation**: Record incident details
6. **Review**: Improve security measures

### Emergency Contacts
- System Administrator
- Database Administrator  
- Security Team
- Legal/Compliance Team

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated**: Current security implementation
**Next Review**: Schedule regular security reviews
**Version**: 1.0 - Initial security hardening