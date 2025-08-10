import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, getIdTokenResult } from 'firebase/auth';
import { auth, signInWithGoogle, signOut } from '../config/firebase';
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  checkAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isAdmin: false,
  signIn: async () => ({ user: null, error: null }),
  signOut: async () => ({ error: null }),
  checkAdminStatus: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  const checkAdminStatus = useCallback(async (user: User | null): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    try {
      const idTokenResult = await getIdTokenResult(user, true);
      const isAdmin = !!idTokenResult.claims.admin;
      setIsAdmin(isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check admin status when user logs in
        await checkAdminStatus(user);
        // Optionally sync user data with your backend
        syncUserWithBackend(user);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { user, error } = await signInWithGoogle();
      return { user, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await signOut();
      setIsAdmin(false); // Reset admin status on sign out
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sync user data with backend
  const syncUserWithBackend = async (user: User) => {
    try {
      const idToken = await user.getIdToken();
      // Call your backend API to sync user data
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      });
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      isAdmin,
      signIn: handleSignIn,
      signOut: handleSignOut,
      checkAdminStatus: () => checkAdminStatus(currentUser),
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
