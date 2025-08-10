import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function testEmail() {
  console.log('🧪 Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    // Generate test OTP
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('📧 Sending test OTP:', testOTP);

    // Send test email
    const mailOptions = {
      from: `"TimeBank Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'TimeBank OTP Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🏦 TimeBank - Test OTP</h2>
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center;">
            <h3>Your test OTP code is:</h3>
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px;">
              ${testOTP}
            </div>
            <p style="color: #666;">This is a test email from your TimeBank application.</p>
          </div>
          <p>If you received this email, your email configuration is working correctly! 🎉</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('📬 Check your inbox for the test OTP email');

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication failed. Please check:');
      console.log('1. Make sure 2-Factor Authentication is enabled on your Google account');
      console.log('2. Use App Password, not your regular Gmail password');
      console.log('3. Generate a new App Password if needed');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🌐 Network connection issue. Check your internet connection.');
    }
  }
}

testEmail();
