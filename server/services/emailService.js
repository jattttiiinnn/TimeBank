import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // Create transporter using Gmail SMTP
    // For production, consider using dedicated email services like SendGrid, Mailgun, etc.
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Use Gmail service for better compatibility
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail App Password (not regular password)
      }
    });
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP email for verification
  async sendOTPEmail(email, name, otp) {
    const mailOptions = {
      from: `"TimeBank" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - TimeBank',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 30px; }
            .otp-box { background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { background: #e9ecef; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
            .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏦 TimeBank</h1>
              <h2>Email Verification</h2>
            </div>
            
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Welcome to TimeBank! Please verify your email address to complete your registration.</p>
              
              <div class="otp-box">
                <p>Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p><small>This code will expire in 10 minutes</small></p>
              </div>
              
              <p>Enter this code in the verification form to activate your account.</p>
              
              <p>If you didn't create an account with TimeBank, please ignore this email.</p>
              
              <div style="margin-top: 30px;">
                <p><strong>Why TimeBank?</strong></p>
                <ul style="text-align: left;">
                  <li>🎓 Learn any skill from experts</li>
                  <li>💰 Earn time credits by teaching</li>
                  <li>🌍 Connect with a global community</li>
                  <li>🔒 Safe and verified platform</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2024 TimeBank. All rights reserved.</p>
              <p>This email was sent to ${email}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('OTP email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, name, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"TimeBank" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - TimeBank',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 30px; }
            .reset-box { background: white; border: 2px solid #dc3545; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .footer { background: #e9ecef; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
            .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
            .warning { color: #dc3545; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏦 TimeBank</h1>
              <h2>Password Reset Request</h2>
            </div>
            
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>We received a request to reset your password for your TimeBank account.</p>
              
              <div class="reset-box">
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" class="btn">Reset Password</a>
                <p><small>This link will expire in 1 hour</small></p>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <p>⚠️ Security Notice:</p>
                <ul style="text-align: left;">
                  <li>If you didn't request this password reset, please ignore this email</li>
                  <li>Your password will remain unchanged</li>
                  <li>Consider changing your password if you suspect unauthorized access</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2024 TimeBank. All rights reserved.</p>
              <p>This email was sent to ${email}</p>
              <p>For security reasons, this email was automatically generated.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Send welcome email after successful verification
  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: `"TimeBank" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to TimeBank! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 30px; }
            .welcome-box { background: white; border: 2px solid #28a745; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .footer { background: #e9ecef; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
            .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
            .feature-box { background: white; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏦 TimeBank</h1>
              <h2>Welcome to the Community!</h2>
            </div>
            
            <div class="content">
              <div class="welcome-box">
                <h2>🎉 Congratulations ${name}!</h2>
                <p>Your email has been verified successfully!</p>
                <p>You're now part of the TimeBank community where knowledge meets opportunity.</p>
              </div>
              
              <h3>🚀 Ready to get started?</h3>
              
              <div class="feature-box">
                <h4>📚 Learn Something New</h4>
                <p>Browse thousands of skills and connect with expert teachers in your area of interest.</p>
              </div>
              
              <div class="feature-box">
                <h4>🎓 Share Your Expertise</h4>
                <p>Teach what you know best and earn time credits while helping others grow.</p>
              </div>
              
              <div class="feature-box">
                <h4>⏰ Manage Your Time</h4>
                <p>Track your time balance, schedule sessions, and build meaningful connections.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="btn">
                  Start Your Journey
                </a>
              </div>
              
              <h3>💡 Quick Tips:</h3>
              <ul style="text-align: left;">
                <li>Complete your profile to get better skill matches</li>
                <li>Add your skills and set your teaching preferences</li>
                <li>Join community discussions and events</li>
                <li>Rate and review your sessions to build trust</li>
              </ul>
              
              <p>Need help? Check out our <a href="#" style="color: #667eea;">Help Center</a> or contact our support team.</p>
            </div>
            
            <div class="footer">
              <p>© 2024 TimeBank. All rights reserved.</p>
              <p>Happy learning and teaching! 🌟</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email as it's not critical
      return false;
    }
  }
}

export default new EmailService();
