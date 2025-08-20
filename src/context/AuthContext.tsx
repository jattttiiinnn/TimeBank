import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { signInWithGoogle } from '../config/firebase';
// Replace the API_BASE_URL line with:
import { API_URL } from '../config/api';

interface User {
  id: string;
  name: string;
  email: string;
  timeBalance: number;
  totalEarned: number;
  totalSpent: number;
  skillsOffered: Array<{ name: string; description: string; sessionsCompleted: number }>;
  skillsLearning: Array<{ name: string; description: string; sessionsCompleted: number }>;
  rating: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Using the imported API_URL from config
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  const loginWithGoogle = async () => {
    try {
      console.log('🔐 Starting Google authentication flow...');
      const result = await signInWithGoogle();
      
      if (result.error) {
        console.error('🚫 Google sign-in failed:', result.error);
        throw new Error(result.error.message || 'Google sign-in failed');
      }

      if (result.user) {
        console.log('✅ Firebase authentication successful');
        console.log('👤 User info:', {
          email: result.user.email,
          name: result.user.displayName,
          uid: result.user.uid
        });

        // Get the Firebase ID token
        const idToken = await result.user.getIdToken();
        console.log('🎫 Firebase ID token obtained');
        
        // Send the token to your backend for verification and user creation/login
        console.log('📡 Sending token to backend...');
        const response = await axios.post(`${API_URL}/auth/google`, {
          idToken,
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL
        });

        console.log('✅ Backend authentication successful');
        
        const { token, user } = response.data;
        if (token && user) {
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(user);
          console.log('🎉 User logged in successfully');
        } else {
          throw new Error('Invalid response from backend');
        }
      } else {
        throw new Error('No user data received from Google');
      }
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      
      // Enhanced error handling
      if (error.response) {
        // Backend error
        const backendError = error.response.data?.message || 'Backend authentication failed';
        console.error('🔴 Backend error:', backendError);
        throw new Error(backendError);
      } else if (error.message) {
        // Firebase or network error
        throw new Error(error.message);
      } else {
        throw new Error('Google authentication failed');
      }
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { 
        name, 
        email, 
        password,
        skillsOffered: [] // Start with empty skills, will prompt to add them
      });
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user context
      setUser(userData);
      
      // Note: Profile setup check will be handled in Dashboard component
      // to avoid hard redirects that break React Router navigation
      
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};