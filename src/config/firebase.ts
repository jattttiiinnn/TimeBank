import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Firebase configuration is incomplete. Please check your environment variables.');
  console.log('Required env vars:', {
    VITE_FIREBASE_API_KEY: firebaseConfig.apiKey ? 'Set' : 'Missing',
    VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain ? 'Set' : 'Missing',
    VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId ? 'Set' : 'Missing',
    VITE_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket ? 'Set' : 'Missing',
    VITE_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId ? 'Set' : 'Missing',
    VITE_FIREBASE_APP_ID: firebaseConfig.appId ? 'Set' : 'Missing'
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Custom auth functions
export const signInWithGoogle = async () => {
  try {
    console.log('🔐 Initiating Google sign-in...');
    
    // Check if popup blockers might interfere
    const popup = window.open('', '_blank', 'width=1,height=1');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      throw new Error('Popup blocked. Please allow popups for this site and try again.');
    }
    popup.close();
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Google sign-in successful:', result.user.email);
    
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('❌ Google sign-in error:', error);
    
    let errorMessage = 'Google sign-in failed';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked. Please allow popups and try again.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Sign-in was cancelled. Please try again.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.code === 'auth/internal-error') {
      errorMessage = 'Internal error. Please try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { user: null, error: { ...error, message: errorMessage } };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export { auth, googleProvider };
export default app;
