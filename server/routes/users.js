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
      .limit(50) 
      .sort({ createdAt: -1 });
      
    res.set('Cache-Control', 'no-store');
      
    console.log(`Found ${users.length} users`);
    console.log('Backend version: SHOW_ALL_USERS_V2');
      
    res.json(users);
  } catch (error) {
    console.error('Error in /providers endpoint:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

export { router };
