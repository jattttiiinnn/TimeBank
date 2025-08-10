import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Plus, 
  Calendar, 
  Users, 
  Star, 
  LogOut, 
  MessageCircle, 
  Search,
  TrendingUp,
  Award,
  Activity,
  BookOpen,
  Bell,
  Settings,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreateSession from './CreateSession';
import SessionsList from './SessionsList';
import SkillMatching from './SkillMatching';
import ChatList from './ChatList';
import ProfileSetup from './ProfileSetup';
import axios from 'axios';
import { API_URL } from '../config/api';

interface Session {
  _id: string;
  skillName: string;
  description: string;
  dateTime: string;
  duration: number;
  requesterId: { _id: string; name: string; email: string };
  providerId: { _id: string; name: string; email: string };
  meetLink: string;
  status: string;
}

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showCreateSession, setShowCreateSession] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API_URL}/sessions/my`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const upcomingSessions = sessions.filter(s => 
    new Date(s.dateTime) > new Date() && s.status !== 'cancelled'
  );

  const recentActivity = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                TimeBank
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              {user?.email === 'jatinbargujjar123@gmail.com' && (
                <a
                  href="/admin"
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <span>Admin Panel</span>
                </a>
              )}
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Calendar },
            { id: 'sessions', label: 'My Sessions', icon: Users },
            { id: 'create', label: 'Create Session', icon: Plus },
            { id: 'matching', label: 'Find Skills', icon: Search },
            { id: 'chat', label: 'Messages', icon: MessageCircle },
            { id: 'profile', label: 'Profile', icon: Star }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Enhanced Header */}
              <motion.div 
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                      <p className="text-xl opacity-90">Your time banking journey continues</p>
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Clock className="w-16 h-16 opacity-30" />
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 mt-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{user?.timeBalance || 0}</div>
                      <div className="text-sm opacity-80">Time Balance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{sessions.length}</div>
                      <div className="text-sm opacity-80">Total Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{user?.skillsOffered?.length || 0}</div>
                      <div className="text-sm opacity-80">Skills Offered</div>
                    </div>
                  </div>
                </div>

                {/* Floating particles */}
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/20 rounded-full"
                    animate={{
                      x: [0, Math.random() * 100 - 50],
                      y: [0, Math.random() * -50],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </motion.div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: 'Hours Earned',
                    value: user?.totalEarned || 0,
                    suffix: 'h',
                    icon: TrendingUp,
                    color: 'from-green-500 to-emerald-500',
                    bgColor: 'from-green-50 to-emerald-50',
                    delay: 0.1
                  },
                  {
                    title: 'Hours Spent',
                    value: user?.totalSpent || 0,
                    suffix: 'h',
                    icon: BookOpen,
                    color: 'from-blue-500 to-cyan-500',
                    bgColor: 'from-blue-50 to-cyan-50',
                    delay: 0.2
                  },
                  {
                    title: 'Active Sessions',
                    value: upcomingSessions.length,
                    suffix: '',
                    icon: Activity,
                    color: 'from-orange-500 to-red-500',
                    bgColor: 'from-orange-50 to-red-50',
                    delay: 0.3
                  },
                  {
                    title: 'Skills Mastered',
                    value: user?.skillsOffered?.length || 0,
                    suffix: '',
                    icon: Award,
                    color: 'from-purple-500 to-pink-500',
                    bgColor: 'from-purple-50 to-pink-50',
                    delay: 0.4
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    className={`bg-gradient-to-br ${stat.bgColor} rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stat.delay, duration: 0.5 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700 opacity-10`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <motion.div
                          className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <stat.icon className="w-6 h-6 text-white" />
                        </motion.div>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800 mb-1">
                        {stat.value}{stat.suffix}
                      </h3>
                      <p className="text-gray-600 text-sm">{stat.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Skills and Sessions Grid */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Skills Section */}
                <div className="lg:col-span-2">
                  <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Zap className="w-6 h-6 mr-2 text-purple-600" />
                        Your Skills
                      </h3>
                      <motion.button
                        className="text-purple-600 hover:text-purple-700 flex items-center space-x-1 text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('create')}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Skill</span>
                      </motion.button>
                    </div>
                    
                    {user?.skillsOffered?.length ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {user.skillsOffered.map((skill, index) => (
                          <motion.div
                            key={index}
                            className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100 hover:border-purple-200 transition-colors group"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-purple-700 group-hover:text-purple-800 transition-colors">
                                  {skill.name}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {skill.sessionsCompleted} sessions completed
                                </div>
                              </div>
                              <motion.div 
                                className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Star className="w-5 h-5 text-purple-600" />
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="text-center py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg mb-4">No skills added yet</p>
                        <motion.button
                          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveTab('create')}
                        >
                          Create Your First Session
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Upcoming Sessions Sidebar */}
                <div className="space-y-6">
                  <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                      Upcoming
                    </h3>
                    
                    {upcomingSessions.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingSessions.slice(0, 3).map((session, index) => (
                          <motion.div
                            key={session._id}
                            className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl hover:from-purple-100 hover:to-blue-100 transition-colors group"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <h4 className="font-semibold text-gray-800 text-sm">{session.skillName}</h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {session.providerId._id === user?.id ? 'Teaching' : 'Learning from'}{' '}
                              {session.providerId._id === user?.id ? session.requesterId.name : session.providerId.name}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-purple-600 font-medium">
                                {new Date(session.dateTime).toLocaleDateString()}
                              </span>
                              <span className="text-xs bg-white px-2 py-1 rounded-full font-medium text-gray-600">
                                {session.duration}h
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No upcoming sessions</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Find Skills', icon: Search, action: () => setActiveTab('matching') },
                        { label: 'Create Session', icon: Plus, action: () => setActiveTab('create') },
                        { label: 'View Messages', icon: MessageCircle, action: () => setActiveTab('chat') }
                      ].map((action, index) => (
                        <motion.button
                          key={action.label}
                          className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all duration-200"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={action.action}
                        >
                          <action.icon className="w-5 h-5" />
                          <span className="font-medium">{action.label}</span>
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'sessions' && (
          <SessionsList sessions={sessions} currentUserId={user?.id} onRefresh={fetchSessions} />
        )}

        {activeTab === 'create' && (
          <CreateSession onSessionCreated={fetchSessions} />
        )}

        {activeTab === 'matching' && (
          <SkillMatching />
        )}

        {activeTab === 'chat' && (
          <ChatList />
        )}

        {activeTab === 'profile' && (
          <ProfileSetup />
        )}
      </div>
    </div>
  );
}