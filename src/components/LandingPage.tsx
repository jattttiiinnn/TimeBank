import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  Zap,
  Heart,
  Award,
  TrendingUp,
  Globe,
  Shield
} from 'lucide-react';
import { FaGoogle, FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { BsStars } from 'react-icons/bs';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "UX Designer",
      content: "TimeBank helped me learn coding while teaching design. The community is amazing!",
      avatar: "SC"
    },
    {
      name: "Mike Johnson",
      role: "Developer",
      content: "I've gained 50+ hours helping others with programming. Best investment of my time!",
      avatar: "MJ"
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Expert",
      content: "The skill exchange here is incredible. I've learned photography and taught marketing.",
      avatar: "ER"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      {/* Header */}
      <motion.header 
        className={`${isScrolled ? 'bg-white/90 shadow-lg' : 'bg-white/80'} backdrop-blur-md sticky top-0 z-50 border-b border-purple-100 transition-all duration-300`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Clock className="h-8 w-8 text-purple-600" />
                <motion.div
                  className="absolute inset-0 h-8 w-8 bg-purple-600 rounded-full opacity-20"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                TimeBank
              </span>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <HiSparkles className="h-5 w-5 text-yellow-400" />
              </motion.div>
            </motion.div>
            
            <nav className="hidden md:flex items-center space-x-8">
              {['Home', 'How It Works', 'Skills', 'About Us', 'Support'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-700 hover:text-purple-600 transition-colors relative"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
                  whileHover={{ scale: 1.1, color: '#9333ea' }}
                >
                  {item}
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
              <Link 
                to="/auth" 
                className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-200"
              >
                <span className="relative z-10">Get Started</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 opacity-0 hover:opacity-100 transition-opacity duration-300"
                />
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="home" className="relative pt-20 pb-32 overflow-hidden">
        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 text-purple-300"
            animate={{ 
              y: [0, -20, 0], 
              rotate: [0, 5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="h-8 w-8" />
          </motion.div>
          <motion.div
            className="absolute top-1/3 right-1/4 text-blue-300"
            animate={{ 
              y: [0, 15, 0], 
              rotate: [0, -10, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Star className="h-10 w-10" />
          </motion.div>
          <motion.div
            className="absolute bottom-1/4 left-1/6 text-pink-300"
            animate={{ 
              y: [0, -25, 0], 
              rotate: [0, 15, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            <Zap className="h-6 w-6" />
          </motion.div>
          <motion.div
            className="absolute top-1/5 right-1/6 text-yellow-400"
            animate={{ 
              y: [0, 10, 0], 
              x: [0, 5, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <BsStars className="h-7 w-7" />
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div className="flex items-center justify-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="mr-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </motion.div>
                <div className="text-sm text-purple-600 font-medium bg-purple-100 px-4 py-2 rounded-full flex items-center space-x-2">
                  <HiSparkles className="h-4 w-4" />
                  <span>Join 10,000+ Time Traders</span>
                  <HiSparkles className="h-4 w-4" />
                </div>
              </motion.div>

              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.span 
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Trade Time,
                </motion.span>
                <br />
                <motion.span 
                  className="text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Not Money
                </motion.span>
              </motion.h1>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Share your skills. Earn time credits. Redeem them for help from others. 
              <span className="text-purple-600 font-semibold">Empower your community</span> through meaningful time exchange.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link 
                  to="/auth"
                  className="relative overflow-hidden group inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">Get Started Free</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              </motion.div>
              
              <motion.button
                className="text-gray-600 hover:text-purple-600 font-medium flex items-center space-x-2 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-0 h-0 border-l-[6px] border-l-purple-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                </div>
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[
                { number: '10K+', label: 'Active Users' },
                { number: '50K+', label: 'Hours Exchanged' },
                { number: '200+', label: 'Skills Shared' },
                { number: '98%', label: 'Satisfaction' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-gray-800">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Loved by Our Community
            </h2>
            <p className="text-xl text-gray-600">See what time traders are saying</p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-xl relative"
              >
                <motion.div
                  className="absolute -top-4 left-8"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="bg-yellow-400 rounded-full p-3">
                    <Star className="h-6 w-6 text-white fill-current" />
                  </div>
                </motion.div>
                
                <div className="text-center">
                  <div className="mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="inline h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-xl md:text-2xl text-gray-700 font-medium mb-8 italic">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">{testimonials[currentTestimonial].name}</div>
                      <div className="text-gray-600">{testimonials[currentTestimonial].role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Testimonial indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-purple-600 scale-125' 
                      : 'bg-purple-200 hover:bg-purple-300'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Simple steps to start exchanging time</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Offer Your Skill</h3>
              <p className="text-gray-600">Teach Python, help with design, or share any skill you have</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Earn Time Credits</h3>
              <p className="text-gray-600">Get credits based on hours you contribute to help others</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Learn From Others</h3>
              <p className="text-gray-600">Spend credits to learn new skills or receive help</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-purple-600 font-semibold">
              <Star className="inline h-5 w-5 mr-2" />
              Everyone's time is equally valuable
            </p>
          </div>
        </div>
      </section>

      {/* Why TimeBank Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why TimeBank?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4 p-6">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Inclusive</h3>
                <p className="text-gray-600">No money involved, only time. Everyone can participate regardless of financial status.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Flexible</h3>
                <p className="text-gray-600">Learn and share at your own pace. Schedule sessions that work for you.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Trustworthy</h3>
                <p className="text-gray-600">Verified users and comprehensive feedback system ensure quality exchanges.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills Section */}
      <section id="skills" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Featured Skills
            </h2>
            <p className="text-xl text-gray-600">Popular skills being exchanged on TimeBank</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {['Coding', 'Design', 'Fitness', 'Music', 'Resume Review', 'Languages', 'Public Speaking'].map((skill) => (
              <span 
                key={skill}
                className="px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full font-medium hover:from-purple-200 hover:to-blue-200 transition-colors cursor-pointer"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to exchange your time?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of learners and teachers building a stronger community together.
            </p>
            <Link 
              to="/auth"
              className="inline-flex items-center space-x-2 bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <span>Join TimeBank Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Clock className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold">TimeBank</span>
          </div>
          
          <div className="text-center text-gray-400">
            <p>&copy; 2025 TimeBank | Built by Students for Students</p>
            <div className="mt-4 space-x-6">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}