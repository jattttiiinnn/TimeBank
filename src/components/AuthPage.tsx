import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// COMMENTED OUT: import OTPVerification from './OTPVerification';
import ForgotPassword from './ForgotPassword';
import { API_URL } from '../config/api';

export default function AuthPage() {
  // COMMENTED OUT OTP: const [currentView, setCurrentView] = useState<'auth' | 'otp' | 'forgot'>('auth');
  const [currentView, setCurrentView] = useState<'auth' | 'forgot'>('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // COMMENTED OUT OTP: const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        // Register without OTP verification (direct login)
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // COMMENTED OUT OTP: setPendingVerificationEmail(formData.email);
          // COMMENTED OUT OTP: setCurrentView('otp');
          // Direct login after successful registration
          localStorage.setItem('token', data.token);
          window.location.href = '/dashboard';
        } else {
          setError(data.message);
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setError('');
    setLoading(true);
    try {
      console.log('🚀 Google sign-in button clicked');
      await loginWithGoogle();
      console.log('🎉 Google sign-in completed successfully');
    } catch (error: any) {
      console.error('🔴 Google sign-in failed:', error);
      let errorMessage = 'Google sign-in failed';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in was cancelled. Please try again.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Popup was blocked. Please allow popups for this site.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = `Authentication error: ${error.code}`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }

  // COMMENTED OUT OTP: const handleOTPVerificationSuccess = () => {
  //   // Redirect will be handled by the AuthContext
  //   window.location.href = '/dashboard';
  // };

  // COMMENTED OUT OTP: const handleBackToAuth = () => {
  //   setCurrentView('auth');
  //   setError('');
  //   setPendingVerificationEmail('');
  // };

  const handleForgotPassword = () => {
    setCurrentView('forgot');
    setError('');
  };

  // Render different views
  // COMMENTED OUT OTP: if (currentView === 'otp') {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
  //       <OTPVerification
  //         email={pendingVerificationEmail}
  //         onVerificationSuccess={handleOTPVerificationSuccess}
  //         onBack={handleBackToAuth}
  //       />
  //     </div>
  //   );
  // }

  if (currentView === 'forgot') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <ForgotPassword onBack={() => setCurrentView('auth')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Decorative */}
        <motion.div 
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 relative overflow-hidden"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-center p-12 text-white">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex items-center space-x-3 mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="h-12 w-12" />
                </motion.div>
                <span className="text-4xl font-bold">TimeBank</span>
              </div>
              
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Trade Your Time,
                <br />
                <span className="text-yellow-300">Build Your Future</span>
              </h1>
              
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                Join thousands of learners and teachers in the world's most inclusive skill exchange platform.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { number: '10K+', label: 'Active Users' },
                  { number: '50K+', label: 'Hours Traded' },
                  { number: '200+', label: 'Skills' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  >
                    <div className="text-2xl font-bold text-yellow-300">{stat.number}</div>
                    <div className="text-sm text-purple-200">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Features */}
              <div className="space-y-4">
                {[
                  'Free to join and use',
                  'Secure & verified community',
                  'Learn any skill you want'
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    className="flex items-center space-x-3"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  >
                    <div className="h-5 w-5 text-green-300">✓</div>
                    <span className="text-purple-100">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Floating Elements */}
            <motion.div
              className="absolute top-20 right-20 text-white/20 text-2xl"
              animate={{ 
                y: [0, -20, 0], 
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              ✨
            </motion.div>
            
            <motion.div
              className="absolute bottom-32 right-32 text-white/20 text-3xl"
              animate={{ 
                y: [0, 15, 0], 
                rotate: [0, -10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              ✨
            </motion.div>
          </div>
        </motion.div>
      </div> {/* End right-side auth form */}

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-md w-full"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              >
                <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
                  <div className="relative">
                    <Clock className="h-10 w-10 text-purple-600 group-hover:text-purple-700 transition-colors" />
                    <motion.div
                      className="absolute inset-0 h-10 w-10 bg-purple-600 rounded-full opacity-20"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    TimeBank
                  </span>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-gray-900">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isLogin ? 'login' : 'signup'}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isLogin ? 'Welcome back!' : 'Join TimeBank'}
                    </motion.span>
                  </AnimatePresence>
                </h2>
                <p className="mt-2 text-gray-600">
                  {isLogin 
                    ? 'Sign in to continue your time trading journey' 
                    : 'Start exchanging skills with our community'
                  }
                </p>
              </motion.div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link for Login */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ name: '', email: '', password: '' });
                }}
                className="ml-2 text-purple-600 hover:text-purple-700 font-semibold"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
      </div> 
    </div> 
  );
}
}
