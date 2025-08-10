# 📧 Email Setup Guide for OTP & Password Reset

This guide will help you set up email functionality for OTP verification and password reset features in your TimeBank application.

## ✅ What's Been Added

### New Features:
1. **OTP Email Verification** - Users receive a 6-digit code to verify their email during registration
2. **Forgot Password** - Users can request a password reset link via email
3. **Welcome Emails** - Automatic welcome email after successful verification
4. **Email Templates** - Beautiful, responsive HTML email templates

### New Components:
- `OTPVerification.tsx` - OTP input and verification UI
- `ForgotPassword.tsx` - Forgot password form and success states
- `ResetPasswordPage.tsx` - Password reset form with validation
- `emailService.js` - Email service for sending all types of emails

### Backend Changes:
- Updated User model with OTP and password reset fields
- New auth routes: `/verify-otp`, `/resend-otp`, `/forgot-password`, `/reset-password`
- Email service integration with registration and password reset flows

## 🔧 Setup Instructions

### 1. Install Dependencies
The required packages have already been installed:
- `nodemailer` - For sending emails
- `crypto` - For generating secure tokens (built-in Node.js module)

### 2. Gmail Setup (Free Option)

#### Step 1: Enable 2-Factor Authentication
1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", enable "2-Step Verification"

#### Step 2: Generate App Password
1. Still in Security settings, click "App passwords"
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter "TimeBank App" as the name
5. Click "Generate"
6. Copy the 16-character password (save it securely!)

#### Step 3: Configure Environment Variables
Create a `.env` file in your project root and add:

```bash
# Email Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:5173

# Other existing variables...
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb://localhost:27017/timebank
```

### 3. Alternative Email Services

If you prefer not to use Gmail, here are other free options:

#### Outlook/Hotmail
```javascript
// In emailService.js, replace the transporter config with:
this.transporter = nodemailer.createTransporter({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

#### Yahoo Mail
```javascript
// In emailService.js, replace the transporter config with:
this.transporter = nodemailer.createTransporter({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use app password
  },
});
```

## 🚀 How It Works

### Registration Flow:
1. User enters name, email, password
2. Account created (not verified)
3. 6-digit OTP sent to email
4. User enters OTP to verify
5. Account activated + welcome email sent

### Forgot Password Flow:
1. User clicks "Forgot Password"
2. Enters email address
3. Password reset link sent to email
4. User clicks link, enters new password
5. Password updated, user can login

### Password Reset Link Format:
```
http://localhost:5173/reset-password?token=abc123...
```

## 📱 Email Templates

The system includes three beautiful email templates:

### 1. OTP Verification Email
- Clean design with branded header
- Large, easy-to-read OTP code
- 10-minute expiration notice
- Helpful tips for finding the email

### 2. Password Reset Email
- Secure reset button
- 1-hour expiration notice
- Security warnings
- Fallback link if button doesn't work

### 3. Welcome Email
- Celebration design
- Feature highlights
- Quick start guide
- Call-to-action button

## 🔒 Security Features

- **OTP Expiration**: 10 minutes for email verification
- **Reset Token Expiration**: 1 hour for password reset
- **Secure Token Generation**: Cryptographically secure random tokens
- **Rate Limiting**: Built-in cooldown for resending OTP
- **Email Validation**: Server-side email format validation
- **Password Requirements**: Enforced strong password policy

## 🧪 Testing

### Test OTP Verification:
1. Register a new account
2. Check email for OTP
3. Enter OTP in verification form
4. Verify welcome email is received

### Test Password Reset:
1. Go to login page
2. Click "Forgot Password"
3. Enter email and submit
4. Check email for reset link
5. Click link and set new password

### Test Different Email Providers:
- Try with Gmail, Outlook, Yahoo
- Test with different email clients
- Verify emails don't go to spam

## 🐛 Troubleshooting

### Common Issues:

#### "Failed to send email"
- Check EMAIL_USER and EMAIL_PASS in .env file
- Ensure you're using App Password, not regular password
- Verify 2FA is enabled on your Google account

#### Emails going to spam
- Add your domain to SPF records (production)
- Use a dedicated email service like SendGrid for production
- Ask users to check spam folder

#### OTP not working
- Check server console for errors
- Verify OTP hasn't expired (10 minutes)
- Try resending OTP

#### Reset link not working
- Check if token is in URL parameters
- Verify token hasn't expired (1 hour)
- Check server logs for token validation errors

### Production Recommendations:

1. **Use Professional Email Service**:
   - SendGrid (free tier: 100 emails/day)
   - Mailgun (free tier: 5,000 emails/month)
   - Amazon SES (very cheap)

2. **Domain Configuration**:
   - Set up SPF, DKIM, DMARC records
   - Use dedicated domain for emails
   - Configure reverse DNS

3. **Monitoring**:
   - Track email delivery rates
   - Monitor spam complaints
   - Log email sending errors

## 📈 Usage Analytics

The system tracks:
- OTP generation and verification rates
- Password reset requests
- Email delivery success/failure
- User verification completion times

## 🔄 Future Enhancements

Potential improvements:
1. SMS OTP as backup
2. Magic link login
3. Email templates customization
4. Multi-language support
5. Email analytics dashboard
6. Advanced spam protection

## 🎉 You're All Set!

Your TimeBank application now has:
- ✅ Secure email verification
- ✅ Password reset functionality  
- ✅ Beautiful email templates
- ✅ Production-ready security
- ✅ Great user experience

Start testing and enjoy your enhanced authentication system! 🚀
