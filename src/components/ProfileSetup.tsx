import { useState, useEffect } from 'react';
import { User, Plus, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';

export default function ProfileSetup() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [skillsOffered, setSkillsOffered] = useState(user?.skillsOffered || []);
  const [skillsLearning, setSkillsLearning] = useState(user?.skillsLearning || []);
  const [newSkillOffered, setNewSkillOffered] = useState({ name: '', description: '' });
  const [newSkillLearning, setNewSkillLearning] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    // Show welcome modal for new users
    const params = new URLSearchParams(window.location.search);
    if (params.get('newUser') === 'true') {
      setShowWelcome(true);
      setSuccess('Welcome to TimeBank! Add skills you can teach to get started.');
    }
    
    // Update skills when user data changes
    if (user?.skillsOffered) {
      setSkillsOffered(user.skillsOffered);
    }
    if (user?.skillsLearning) {
      setSkillsLearning(user.skillsLearning);
    }
  }, [user]);

  const addSkillOffered = () => {
    if (newSkillOffered.name.trim()) {
      setSkillsOffered([...skillsOffered, { ...newSkillOffered, sessionsCompleted: 0 }]);
      setNewSkillOffered({ name: '', description: '' });
    }
  };

  const addSkillLearning = () => {
    if (newSkillLearning.name.trim()) {
      setSkillsLearning([...skillsLearning, { ...newSkillLearning, sessionsCompleted: 0 }]);
      setNewSkillLearning({ name: '', description: '' });
    }
  };

  const removeSkillOffered = (index: number) => {
    setSkillsOffered(skillsOffered.filter((_, i) => i !== index));
  };

  const removeSkillLearning = (index: number) => {
    setSkillsLearning(skillsLearning.filter((_, i) => i !== index));
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/users/profile`, {
        skillsOffered,
        skillsLearning
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      updateUser({
        ...user,
        skillsOffered,
        skillsLearning
      });
      
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      setSuccess('Error updating profile. Please try again.');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (skillsOffered.length > 0) {
      const success = await saveProfile();
      if (success) {
        navigate('/dashboard');
      }
    } else {
      setSuccess('Please add at least one skill you can teach to continue.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome to TimeBank! 👋</h3>
            <p className="text-gray-600 mb-6">
              To help you get started, please add at least one skill you can teach. 
              This will help other members find you in search results.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowWelcome(false)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center"
              >
                Let's get started <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <User className="h-6 w-6 mr-2" />
        {showWelcome ? 'Complete Your Profile' : 'Profile Setup'}
      </h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Skills I Offer */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills I Offer</h3>
        
        <div className="space-y-4 mb-4">
          {skillsOffered.map((skill, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <div>
                <div className="font-semibold text-purple-700">{skill.name}</div>
                <div className="text-sm text-gray-600">{skill.description}</div>
              </div>
              <button
                onClick={() => removeSkillOffered(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Skill name (e.g., JavaScript, Guitar)"
            value={newSkillOffered.name}
            onChange={(e) => setNewSkillOffered({ ...newSkillOffered, name: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Description"
            value={newSkillOffered.description}
            onChange={(e) => setNewSkillOffered({ ...newSkillOffered, description: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={addSkillOffered}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Skill I Offer</span>
        </button>
      </div>

      {/* Skills I Want to Learn */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills I Want to Learn</h3>
        
        <div className="space-y-4 mb-4">
          {skillsLearning.map((skill, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div>
                <div className="font-semibold text-green-700">{skill.name}</div>
                <div className="text-sm text-gray-600">{skill.description}</div>
              </div>
              <button
                onClick={() => removeSkillLearning(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Skill name (e.g., Cooking, Photography)"
            value={newSkillLearning.name}
            onChange={(e) => setNewSkillLearning({ ...newSkillLearning, name: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Why do you want to learn this?"
            value={newSkillLearning.description}
            onChange={(e) => setNewSkillLearning({ ...newSkillLearning, description: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={addSkillLearning}
          className="mt-4 flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Skill I Want to Learn</span>
        </button>
      </div>

      {/* Save Profile Button */}
      <div className="flex justify-center space-x-4">
        {showWelcome ? (
          <button
            onClick={handleContinue}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {loading ? 'Saving...' : 'Continue to Dashboard'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>
        ) : (
          <button
            onClick={saveProfile}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {loading ? 'Saving...' : 'Save Profile'}
            {!loading && <User className="ml-2 h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}