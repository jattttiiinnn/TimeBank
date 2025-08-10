import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Users, 
  Target, 
  Heart, 
  Award, 
  Zap, 
  Globe,
  Shield,
  TrendingUp,
  Star,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Code,
  Palette,
  Music,
  Camera,
  BookOpen,
  Mic
} from 'lucide-react';

const teamMembers = [
  {
    name: "Sarah Chen",
    role: "Founder & CEO",
    bio: "Former Google engineer passionate about democratizing education",
    avatar: "SC",
    gradient: "from-purple-500 to-pink-500",
    skills: ["Leadership", "Product Strategy", "Engineering"],
    socialLinks: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    name: "Marcus Johnson",
    role: "CTO",
    bio: "Full-stack developer with 10+ years building scalable platforms",
    avatar: "MJ",
    gradient: "from-blue-500 to-cyan-500",
    skills: ["Full Stack", "System Design", "DevOps"],
    socialLinks: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Community",
    bio: "Community builder who grew multiple online communities to 100K+ members",
    avatar: "ER",
    gradient: "from-green-500 to-emerald-500",
    skills: ["Community", "Marketing", "Content"],
    socialLinks: { twitter: "#", linkedin: "#", github: "#" }
  }
];

const values = [
  {
    icon: Heart,
    title: "Community First",
    description: "We believe in the power of human connections and collaborative learning",
    color: "text-red-500"
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "Creating a secure environment where everyone feels safe to learn and teach",
    color: "text-blue-500"
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "Connecting learners and teachers across borders and cultures",
    color: "text-green-500"
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Constantly evolving to better serve our community's needs",
    color: "text-yellow-500"
  }
];

const skills = [
  { icon: Code, name: "Programming", color: "bg-blue-500" },
  { icon: Palette, name: "Design", color: "bg-purple-500" },
  { icon: Music, name: "Music", color: "bg-pink-500" },
  { icon: Camera, name: "Photography", color: "bg-green-500" },
  { icon: BookOpen, name: "Writing", color: "bg-indigo-500" },
  { icon: Mic, name: "Public Speaking", color: "bg-red-500" }
];

export default function EnhancedAbout() {
  const [activeSection, setActiveSection] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Cursor follower */}
      <div 
        className="fixed w-4 h-4 bg-purple-400 rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-150 ease-out"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          transform: `scale(${activeSection + 1})`
        }}
      />

      {/* Animated Background */}
      <motion.div 
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />
        
        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-96 h-96 rounded-full opacity-10 ${
              i % 3 === 0 ? 'bg-purple-400' : 
              i % 3 === 1 ? 'bg-blue-400' : 'bg-pink-400'
            } filter blur-3xl`}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${10 + i * 10}%`,
            }}
          />
        ))}
      </motion.div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div 
              className="flex justify-center mb-8"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                <Clock className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8">
              <motion.span
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ backgroundSize: '200% 200%' }}
              >
                About Us
              </motion.span>
            </h1>

            <motion.p 
              className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              We're building the future of skill exchange, where time is the only currency that matters.
            </motion.p>

            {/* Animated stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {[
                { number: '25K+', label: 'Happy Users' },
                { number: '100K+', label: 'Hours Traded' },
                { number: '500+', label: 'Skills Available' },
                { number: '99%', label: 'Satisfaction Rate' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-8">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Our Mission
                </span>
              </h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                TimeBank exists to democratize education and skill sharing. We believe everyone has something valuable to teach and something important to learn.
              </p>
              <div className="space-y-4">
                {[
                  "Break down barriers to education",
                  "Foster inclusive learning communities",
                  "Value every person's time equally",
                  "Create meaningful connections"
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                {/* Main card */}
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl p-8 shadow-xl">
                  <div className="grid grid-cols-3 gap-4">
                    {skills.map((skill, index) => (
                      <motion.div
                        key={skill.name}
                        className={`${skill.color} rounded-2xl p-4 flex flex-col items-center text-white`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <skill.icon className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium text-center">{skill.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-4 shadow-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-gradient-to-r from-purple-50 to-blue-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Our Values
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                onHoverStart={() => setActiveSection(index)}
                onHoverEnd={() => setActiveSection(0)}
              >
                <motion.div
                  className={`w-16 h-16 ${value.color} bg-opacity-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <value.icon className={`w-8 h-8 ${value.color}`} />
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Meet Our Team
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals building the future of skill exchange
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                  {/* Avatar */}
                  <motion.div
                    className={`w-24 h-24 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    {member.avatar}
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-2 text-center text-gray-800">{member.name}</h3>
                  <p className="text-purple-600 font-semibold text-center mb-4">{member.role}</p>
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">{member.bio}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-4">
                    {Object.entries(member.socialLinks).map(([platform, link]) => (
                      <motion.a
                        key={platform}
                        href={link}
                        className="w-10 h-10 bg-gray-100 hover:bg-purple-600 rounded-full flex items-center justify-center transition-all duration-300 group"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-gray-600 group-hover:text-white capitalize text-sm font-medium">
                          {platform[0].toUpperCase()}
                        </span>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              Ready to Join Our Mission?
            </h2>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Become part of a community that values learning, teaching, and growing together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <motion.button
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * -100],
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
      </section>
    </div>
  );
}
