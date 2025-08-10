import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  TrendingUp, 
  Users, 
  Star, 
  Calendar,
  Award,
  BookOpen,
  Zap,
  Target,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Bell,
  Settings,
  MoreHorizontal,
  Activity,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Sample data
const timeData = [
  { month: 'Jan', earned: 12, spent: 8 },
  { month: 'Feb', earned: 19, spent: 12 },
  { month: 'Mar', earned: 15, spent: 10 },
  { month: 'Apr', earned: 22, spent: 18 },
  { month: 'May', earned: 28, spent: 20 },
  { month: 'Jun', earned: 35, spent: 25 }
];

const skillsData = [
  { name: 'Programming', value: 35, color: '#8B5CF6' },
  { name: 'Design', value: 28, color: '#06B6D4' },
  { name: 'Writing', value: 20, color: '#10B981' },
  { name: 'Music', value: 17, color: '#F59E0B' }
];

const recentActivities = [
  {
    id: 1,
    type: 'session_completed',
    title: 'Taught React Basics',
    description: 'Helped Sarah learn React components',
    time: '2 hours ago',
    points: '+2 hours',
    avatar: 'SL',
    color: 'green'
  },
  {
    id: 2,
    type: 'session_booked',
    title: 'Learning Session Booked',
    description: 'Photography fundamentals with Mike',
    time: '4 hours ago',
    points: '-1.5 hours',
    avatar: 'MJ',
    color: 'blue'
  },
  {
    id: 3,
    type: 'review_received',
    title: 'New Review',
    description: '5-star review for Python tutoring',
    time: '1 day ago',
    points: '+0.5 bonus',
    avatar: 'ER',
    color: 'yellow'
  }
];

const upcomingSessions = [
  {
    id: 1,
    title: 'JavaScript Advanced Concepts',
    student: 'Alex Chen',
    time: '2:00 PM Today',
    duration: '2 hours',
    type: 'teaching',
    avatar: 'AC'
  },
  {
    id: 2,
    title: 'UI/UX Design Review',
    mentor: 'Jordan Smith',
    time: '4:00 PM Tomorrow',
    duration: '1.5 hours',
    type: 'learning',
    avatar: 'JS'
  }
];

const achievements = [
  { name: 'First Teaching Session', icon: '🎓', unlocked: true },
  { name: '10 Hours Taught', icon: '⭐', unlocked: true },
  { name: 'Community Helper', icon: '🤝', unlocked: true },
  { name: '50 Hours Milestone', icon: '🏆', unlocked: false }
];

export default function EnhancedDashboard() {
  const [timeBalance, setTimeBalance] = useState(24.5);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [notifications, setNotifications] = useState(3);
  const [activeTab, setActiveTab] = useState('overview');

  const StatCard = ({ title, value, change, icon: Icon, color, delay = 0 }: any) => (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center space-x-1`}>
          <TrendingUp className="w-4 h-4" />
          <span>{change > 0 ? '+' : ''}{change}%</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </motion.div>
  );

  const ActivityItem = ({ activity, index }: any) => (
    <motion.div
      className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200 group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ x: 10 }}
    >
      <div className={`w-12 h-12 bg-gradient-to-r ${
        activity.color === 'green' ? 'from-green-500 to-emerald-500' :
        activity.color === 'blue' ? 'from-blue-500 to-cyan-500' :
        'from-yellow-500 to-orange-500'
      } rounded-full flex items-center justify-center text-white font-bold text-sm`}>
        {activity.avatar}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
          {activity.title}
        </h4>
        <p className="text-gray-600 text-sm">{activity.description}</p>
        <p className="text-gray-500 text-xs">{activity.time}</p>
      </div>
      <div className={`font-bold text-sm ${
        activity.points.includes('+') ? 'text-green-600' : 'text-blue-600'
      }`}>
        {activity.points}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-purple-100"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Clock className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Welcome back, John!</h1>
                  <p className="text-gray-600">Ready to exchange some time?</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
                  {notifications > 0 && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <span className="text-white text-xs font-bold">{notifications}</span>
                    </motion.div>
                  )}
                </motion.div>

                <motion.button
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </motion.button>

                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold">
                  JD
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Time Balance Card */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2 opacity-90">Your Time Balance</h2>
                    <div className="text-5xl font-bold">{timeBalance} hours</div>
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
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-sm opacity-80">Hours Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">131.5</div>
                    <div className="text-sm opacity-80">Hours Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.9</div>
                    <div className="text-sm opacity-80">Rating</div>
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
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Sessions This Week"
              value="8"
              change={12}
              icon={BookOpen}
              color="bg-gradient-to-r from-blue-500 to-cyan-500"
              delay={0.1}
            />
            <StatCard
              title="Active Students"
              value="23"
              change={8}
              icon={Users}
              color="bg-gradient-to-r from-green-500 to-emerald-500"
              delay={0.2}
            />
            <StatCard
              title="Average Rating"
              value="4.9"
              change={3}
              icon={Star}
              color="bg-gradient-to-r from-yellow-500 to-orange-500"
              delay={0.3}
            />
            <StatCard
              title="Completion Rate"
              value="96%"
              change={5}
              icon={Target}
              color="bg-gradient-to-r from-purple-500 to-pink-500"
              delay={0.4}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Charts Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Time Activity Chart */}
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Time Activity</h3>
                  <div className="flex space-x-2">
                    {['week', 'month', 'year'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedPeriod === period
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeData}>
                    <defs>
                      <linearGradient id="earnedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="earned"
                      stroke="#8B5CF6"
                      fillOpacity={1}
                      fill="url(#earnedGradient)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="spent"
                      stroke="#06B6D4"
                      fillOpacity={1}
                      fill="url(#spentGradient)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Skills Distribution */}
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-6">Skills You Teach</h3>
                <div className="flex items-center space-x-8">
                  <ResponsiveContainer width={300} height={200}>
                    <PieChart>
                      <Pie
                        data={skillsData}
                        cx={150}
                        cy={100}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {skillsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-4">
                    {skillsData.map((skill, index) => (
                      <motion.div
                        key={skill.name}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skill.color }}></div>
                          <span className="font-medium text-gray-700">{skill.name}</span>
                        </div>
                        <span className="text-gray-600">{skill.value}%</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              {/* Upcoming Sessions */}
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-lg"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Upcoming</h3>
                  <motion.button
                    className="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-4 h-4 text-purple-600" />
                  </motion.button>
                </div>
                
                <div className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {session.avatar}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-sm">{session.title}</h4>
                          <p className="text-gray-600 text-xs">
                            {session.type === 'teaching' ? `Teaching ${session.student}` : `Learning from ${session.mentor}`}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-purple-600 font-medium text-xs">{session.time}</span>
                            <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                              {session.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-lg"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
                <div className="space-y-2">
                  {recentActivities.map((activity, index) => (
                    <ActivityItem key={activity.id} activity={activity} index={index} />
                  ))}
                </div>
              </motion.div>

              {/* Achievements */}
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-lg"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-6">Achievements</h3>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.name}
                      className={`p-4 rounded-2xl text-center transition-all ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                    >
                      <div className="text-2xl mb-2">{achievement.icon}</div>
                      <div className="text-xs font-medium">{achievement.name}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
