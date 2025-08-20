import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import admin from '../config/firebase.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// Register without OTP (OTP code commented out)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, skillsOffered = [] } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // COMMENTED OUT: Generate OTP
    // const otp = emailService.generateOTP();
    // const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with email already verified (skip OTP verification)
    const user = new User({ 
      name, 
      email, 
      password,
      skillsOffered: skillsOffered.length ? skillsOffered : [
        { name: 'General Help', description: 'I can help with general questions', sessionsCompleted: 0 }
      ],
      verification: {
        isEmailVerified: true, // Set to true to skip OTP verification
        isPhoneVerified: false
        // COMMENTED OUT: emailOTP: otp,
        // COMMENTED OUT: emailOTPExpires: otpExpires
      }
    });
    await user.save();

    // COMMENTED OUT: Send OTP email
    // try {
    //   await emailService.sendOTPEmail(email, name, otp);
    // } catch (emailError) {
    //   console.error('Failed to send OTP email:', emailError);
    //   // Delete the user if email fails
    //   await User.findByIdAndDelete(user._id);
    //   return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    // }

    // Generate JWT token immediately (no OTP verification needed)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      message: 'Registration successful! Welcome to TimeBank!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timeBalance: user.timeBalance,
        isEmailVerified: true
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// COMMENTED OUT: Verify OTP and complete registration
// router.post('/verify-otp', async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     // Find user by email
//     const user = await User.findOne({ email }).select('+verification');
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid verification request' });
//     }

//     // Check if already verified
//     if (user.verification.isEmailVerified) {
//       return res.status(400).json({ message: 'Email already verified' });
//     }

//     // Check OTP validity
//     if (!user.verification.emailOTP || user.verification.emailOTP !== otp) {
//       return res.status(400).json({ message: 'Invalid verification code' });
//     }

//     // Check OTP expiration
//     if (user.verification.emailOTPExpires < new Date()) {
//       return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
//     }

//     // Mark email as verified
//     user.verification.isEmailVerified = true;
//     user.verification.emailOTP = undefined;
//     user.verification.emailOTPExpires = undefined;
//     await user.save();

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     // Send welcome email
//     try {
//       await emailService.sendWelcomeEmail(user.email, user.name);
//     } catch (emailError) {
//       console.error('Failed to send welcome email:', emailError);
//       // Don't fail the verification if welcome email fails
//     }

//     res.json({
//       token,
//       message: 'Email verified successfully! Welcome to TimeBank!',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         timeBalance: user.timeBalance,
//         isEmailVerified: true
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// COMMENTED OUT: Resend OTP
// router.post('/resend-otp', async (req, res) => {
//   try {
//     const { email } = req.body;

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     // Check if already verified
//     if (user.verification.isEmailVerified) {
//       return res.status(400).json({ message: 'Email already verified' });
//     }

//     // Generate new OTP
//     const otp = emailService.generateOTP();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     // Update user with new OTP
//     user.verification.emailOTP = otp;
//     user.verification.emailOTPExpires = otpExpires;
//     await user.save();

//     // Send OTP email
//     await emailService.sendOTPEmail(email, user.name, otp);

//     res.json({ message: 'New verification code sent to your email' });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to send verification code', error: error.message });
//   }
// });

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timeBalance: user.timeBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Google Auth
router.post('/google', async (req, res) => {
  try {
    const { idToken, name, email, photoURL } = req.body;

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const googleEmail = decodedToken.email;
    
    // Check if user exists
    let user = await User.findOne({ email: googleEmail });
    
    if (!user) {
      // Create new user
      user = new User({
        name: name || decodedToken.name || 'Unknown User',
        email: googleEmail,
        password: 'google-auth', // Placeholder password for Google users
        skillsOffered: [
          { name: 'General Help', description: 'I can help with general questions', sessionsCompleted: 0 }
        ],
        authProvider: 'google',
        profilePicture: photoURL || decodedToken.picture
      });
      await user.save();
    } else {
      // Update existing user's profile picture if provided
      if (photoURL && user.profilePicture !== photoURL) {
        user.profilePicture = photoURL;
        await user.save();
      }
    }

    // Generate JWT token for your app
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timeBalance: user.timeBalance,
        totalEarned: user.totalEarned,
        totalSpent: user.totalSpent,
        skillsOffered: user.skillsOffered,
        skillsLearning: user.skillsLearning,
        rating: user.rating,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error during Google authentication', error: error.message });
  }
});

// Forgot Password (simplified without email service)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to user
    user.passwordReset = {
      token: resetToken,
      expires: resetExpires
    };
    await user.save();

    // Build reset link and send email
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    try {
      await emailService.sendPasswordResetEmail(email, user.name || 'User', resetToken);
      // For development, also log reset link
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n🔑 Password Reset Link for ${email}:`);
        console.log(`${resetLink}`);
        console.log('Email dispatched via nodemailer.\n');
      }
      res.json({
        message: 'Password reset instructions have been sent to your email.',
        ...(process.env.NODE_ENV === 'development' && { resetLink })
      });
    } catch (err) {
      console.error('Failed to send password reset email:', err);
      res.status(500).json({ message: 'Failed to send password reset email' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Find user by reset token
    const user = await User.findOne({
      'passwordReset.token': token,
      'passwordReset.expires': { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    user.passwordReset = undefined; // Clear reset token
    await user.save();

    // Generate new JWT token
    const authToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: authToken,
      message: 'Password reset successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        timeBalance: user.timeBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify Reset Token (to check if token is valid before showing reset form)
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      'passwordReset.token': token,
      'passwordReset.expires': { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.json({ message: 'Valid reset token', email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      timeBalance: req.user.timeBalance,
      totalEarned: req.user.totalEarned,
      totalSpent: req.user.totalSpent,
      skillsOffered: req.user.skillsOffered,
      skillsLearning: req.user.skillsLearning,
      rating: req.user.rating
    }
  });
});

export { router };