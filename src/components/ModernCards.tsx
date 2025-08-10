import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  BookOpen, 
  Clock, 
  Star,
  User,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Play,
  Volume2,
  MoreVertical,
  ChevronRight,
  Eye,
  ThumbsUp,
  Download,
  ExternalLink,
  Bookmark,
  Users,
  Activity,
  Zap,
  Target,
  Coffee
} from 'lucide-react';

// Social Media Card Component
export const SocialCard = ({ post, delay = 0 }: any) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-500"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {post.author.initials}
            </motion.div>
            <div>
              <h4 className="font-semibold text-gray-800">{post.author.name}</h4>
              <p className="text-gray-500 text-sm">{post.timeAgo}</p>
            </div>
          </div>
          <motion.button
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MoreVertical className="w-5 h-5" />
          </motion.button>
        </div>
        <p className="mt-4 text-gray-700 leading-relaxed">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <motion.div 
          className="mt-4 relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-64 object-cover group-hover:brightness-110 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
      )}

      {/* Actions */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.button
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLiked(!liked)}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current text-red-500' : ''}`} />
              <span className="text-sm font-medium">{post.likes + (liked ? 1 : 0)}</span>
            </motion.button>

            <motion.button
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments}</span>
            </motion.button>

            <motion.button
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.button
            className={`p-2 rounded-full transition-colors ${
              saved ? 'text-yellow-500 bg-yellow-50' : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSaved(!saved)}
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Course Card Component
export const CourseCard = ({ course, delay = 0 }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-lg overflow-hidden group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Play Button */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            scale: isHovered ? 1 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Play className="w-6 h-6 text-gray-800 ml-1" />
          </motion.button>
        </motion.div>

        {/* Duration */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
          {course.duration}
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.category.color} text-white`}>
            {course.category.name}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

        {/* Instructor */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {course.instructor.initials}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{course.instructor.name}</p>
            <p className="text-xs text-gray-500">{course.instructor.title}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{course.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{course.students}</span>
            </div>
          </div>
          <div className="text-lg font-bold text-purple-600">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </div>
        </div>

        {/* Progress Bar */}
        {course.progress && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-purple-600">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 1, delay: delay + 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <motion.button
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center justify-center space-x-2">
            <span>{course.progress ? 'Continue Learning' : 'Start Course'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// Analytics Card Component
export const AnalyticsCard = ({ data, delay = 0 }: any) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const increment = data.value / 50;
      const interval = setInterval(() => {
        setCount(prev => {
          if (prev + increment >= data.value) {
            clearInterval(interval);
            return data.value;
          }
          return prev + increment;
        });
      }, 50);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [data.value, delay]);

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className={`w-12 h-12 ${data.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <data.icon className="w-6 h-6 text-white" />
          </motion.div>
          
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            data.change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4" />
            <span>{data.change > 0 ? '+' : ''}{data.change}%</span>
          </div>
        </div>

        <h3 className="text-3xl font-bold text-gray-800 mb-1">
          {Math.round(count)}{data.suffix}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{data.title}</p>

        {/* Mini Chart */}
        <div className="flex items-end space-x-1 h-8">
          {data.chartData.map((value: number, index: number) => (
            <motion.div
              key={index}
              className={`bg-gradient-to-t ${data.color.replace('bg-', 'from-')} to-transparent rounded-t-sm flex-1`}
              initial={{ height: 0 }}
              animate={{ height: `${value}%` }}
              transition={{ delay: delay + index * 0.1, duration: 0.5 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Notification Card Component
export const NotificationCard = ({ notification, delay = 0 }: any) => {
  const [isRead, setIsRead] = useState(notification.read);

  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return MessageCircle;
      case 'like':
        return Heart;
      case 'achievement':
        return Award;
      case 'session':
        return Calendar;
      default:
        return Bell;
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      className={`p-4 rounded-2xl border-l-4 transition-all duration-300 hover:shadow-md ${
        isRead 
          ? 'bg-gray-50 border-gray-300' 
          : 'bg-blue-50 border-blue-500 shadow-sm'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ x: 5 }}
      onClick={() => setIsRead(true)}
    >
      <div className="flex items-start space-x-3">
        <motion.div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isRead ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'
          }`}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        <div className="flex-1">
          <h4 className={`font-medium text-sm ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
            {notification.title}
          </h4>
          <p className={`text-sm mt-1 ${isRead ? 'text-gray-500' : 'text-gray-600'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-2">{notification.timeAgo}</p>
        </div>

        {!isRead && (
          <motion.div
            className="w-3 h-3 bg-blue-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.3 }}
          />
        )}
      </div>
    </motion.div>
  );
};

// Product Card Component
export const ProductCard = ({ product, delay = 0 }: any) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-500"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Image Section */}
      <div className="relative">
        <motion.img
          src={product.images[currentImage]}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
          whileHover={{ scale: 1.05 }}
        />

        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {product.images.map((_: any, index: number) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImage ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentImage(index)}
              />
            ))}
          </div>
        )}

        {/* Favorite Button */}
        <motion.button
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFavorited(!isFavorited)}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
        </motion.button>

        {/* Sale Badge */}
        {product.sale && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            SALE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-800">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          {product.stock < 10 && (
            <span className="text-xs text-red-500 font-medium">
              Only {product.stock} left!
            </span>
          )}
        </div>

        {/* Action Button */}
        <motion.button
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
};

// Main component showcasing all cards
export default function ModernCards() {
  const sampleData = {
    socialPost: {
      author: { name: 'Sarah Johnson', initials: 'SJ' },
      content: 'Just finished an amazing TimeBank session teaching React hooks! The community here is incredible 🚀',
      timeAgo: '2 hours ago',
      likes: 24,
      comments: 8,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop'
    },
    course: {
      title: 'Advanced React Development',
      description: 'Master React with hooks, context, and performance optimization techniques.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
      duration: '8h 24m',
      category: { name: 'Programming', color: 'bg-blue-500' },
      instructor: { name: 'John Doe', initials: 'JD', title: 'Senior Developer' },
      rating: 4.8,
      students: '2.1k',
      price: 89,
      progress: 65
    },
    analytics: {
      title: 'Active Users',
      value: 2847,
      suffix: '',
      change: 12,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      icon: Users,
      chartData: [20, 45, 67, 89, 56, 78, 92, 65]
    },
    notification: {
      type: 'message',
      title: 'New message from Alex',
      message: 'Thanks for the great Python session! Really helped me understand decorators.',
      timeAgo: '5 minutes ago',
      read: false
    },
    product: {
      name: 'Premium Course Bundle',
      description: 'Complete collection of programming courses with lifetime access.',
      images: [
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=400&h=300&fit=crop'
      ],
      price: 199,
      originalPrice: 299,
      rating: 4.9,
      reviews: 156,
      stock: 5,
      sale: true
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Modern UI Components
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Beautiful, interactive components with smooth animations and modern design
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Social Cards</h2>
            <SocialCard post={sampleData.socialPost} delay={0.1} />
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Course Cards</h2>
            <CourseCard course={sampleData.course} delay={0.2} />
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Analytics Cards</h2>
            <AnalyticsCard data={sampleData.analytics} delay={0.3} />
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
            <NotificationCard notification={sampleData.notification} delay={0.4} />
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Product Cards</h2>
            <ProductCard product={sampleData.product} delay={0.5} />
          </div>
        </div>
      </div>
    </div>
  );
}
