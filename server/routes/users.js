import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { skillsOffered, skillsLearning } = req.body;
    
    // Validate skills format
    const validateSkills = (skills) => {
      if (!Array.isArray(skills)) return [];
      return skills.filter(skill => 
        skill && 
        typeof skill === 'object' && 
        skill.name && 
        typeof skill.name === 'string' &&
        skill.name.trim() !== ''
      ).map(skill => ({
        name: skill.name.trim(),
        description: (skill.description || '').trim(),
        sessionsCompleted: Number.isInteger(skill.sessionsCompleted) ? skill.sessionsCompleted : 0
      }));
    };
    
    // Update user skills
    req.user.skillsOffered = validateSkills(skillsOffered);
    req.user.skillsLearning = validateSkills(skillsLearning);
    
    await req.user.save();
    
    // Get updated user data without sensitive information
    const userData = await User.findById(req.user._id)
      .select('name email skillsOffered skillsLearning rating reviewsCount');
    
    res.json({ 
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add skill to user profile
router.post('/skills', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    req.user.skillsOffered.push({ name, description });
    await req.user.save();
    
    res.json({ message: 'Skill added successfully', skills: req.user.skillsOffered });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (renamed from 'Get all users with skills')
router.get('/providers', auth, async (req, res) => {
  try {
    const { skill } = req.query;
    
    // Build query to find all users excluding current user
    let query = { 
      _id: { $ne: req.user._id } // Only exclude current user
    };
    
    // Add skill filter if provided (only filter by skill if user is searching)
    if (skill && skill.trim() !== '') {
      query['skillsOffered.name'] = { $regex: skill.trim(), $options: 'i' };
    }
    
    console.log('Providers query:', JSON.stringify(query, null, 2));
    
    // Find all users and return necessary fields
    const users = await User.find(query)
      .select('name email skillsOffered skillsLearning rating reviewsCount')
      .sort({ createdAt: -1 });
      
    res.set('Cache-Control', 'no-store');
      
    console.log(`Found ${users.length} users`);
    console.log('Backend version: SHOW_ALL_USERS_V3');
      
    res.json(users);
  } catch (error) {
    console.error('Error in /providers endpoint:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all users (unlimited) - normalized under /api/users/admin/all
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'jatinbargujjar123@gmail.com') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({})
      .select('name email skillsOffered skillsLearning rating reviewsCount createdAt')
      .sort({ createdAt: -1 });
    
    res.set('Cache-Control', 'no-store');
    res.json(users);
  } catch (error) {
    console.error('Error in /admin/all endpoint:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Debug endpoint to check admin access (remove in production)
router.get('/debug/admin-check', auth, async (req, res) => {
  try {
    const isAdmin = req.user.email === 'jatinbargujjar123@gmail.com';
    
    res.json({
      currentUser: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      isAdmin,
      adminEmail: 'jatinbargujjar123@gmail.com',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Debug error', error: error.message });
  }
});

// Debug endpoint to check all users with skills (remove in production)
router.get('/debug/users-with-skills', auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersWithOfferedSkills = await User.countDocuments({
      skillsOffered: { $exists: true, $not: { $size: 0 } }
    });
    const usersWithLearningSkills = await User.countDocuments({
      skillsLearning: { $exists: true, $not: { $size: 0 } }
    });
    
    const sampleUsers = await User.find({}, 'name skillsOffered skillsLearning').limit(5);
    
    res.json({
      totalUsers,
      usersWithOfferedSkills,
      usersWithLearningSkills,
      sampleUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Debug error', error: error.message });
  }
});

// Admin: Get comprehensive statistics - normalized under /api/users/admin/stats
router.get('/admin/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'jatinbargujjar123@gmail.com') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get real statistics from database
    const totalUsers = await User.countDocuments();
    const usersWithSkills = await User.countDocuments({
      skillsOffered: { $exists: true, $not: { $size: 0 } }
    });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });
    
    // TODO: Add session stats when session routes are connected
    const totalSessions = 0; // Will be implemented when sessions endpoint is ready
    const activeSessions = 0;
    const completedSessions = 0;
    
    const stats = {
      totalUsers,
      totalSessions,
      activeUsers: usersWithSkills, // Users with skills are considered active
      completedSessions,
      pendingSessions: activeSessions,
      recentRegistrations: recentUsers
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Delete user
router.delete('/users/admin/:userId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'jatinbargujjar123@gmail.com') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId } = req.params;
    
    // Don't allow admin to delete themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', deletedUser: { name: deletedUser.name, email: deletedUser.email } });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update user
router.put('/users/admin/:userId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'jatinbargujjar123@gmail.com') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId } = req.params;
    const updates = req.body;

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates._id;
    delete updates.__v;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('name email skillsOffered skillsLearning rating reviewsCount createdAt');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all users (for admin panel)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'jatinbargujjar123@gmail.com') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find()
      .select('name email skillsOffered skillsLearning rating reviewsCount createdAt authProvider')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
