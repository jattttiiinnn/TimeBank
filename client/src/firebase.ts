import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

// Type augmentation for ImportMeta to include 'env'
interface ImportMetaEnv {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  // add other env variables as needed
}

interface ImportMeta {
  env: ImportMetaEnv;
}

// Your web app's Firebase configuration

// Validate Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingVars = Object.entries(firebaseConfig).filter(([_, v]) => !v);
if (missingVars.length > 0) {
  // eslint-disable-next-line no-console
  console.error('Firebase configuration is incomplete. Missing:', missingVars.map(([k]) => k).join(', '));
  throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Custom claims type
export interface CustomClaims {
  admin?: boolean;
  [key: string]: any;
}

// Check if current user is admin
export const isAdmin = async (user: FirebaseUser): Promise<boolean> => {
  const idTokenResult = await user.getIdTokenResult();
  return !!idTokenResult.claims.admin;
};

// Admin functions
export const adminFunctions = {
  setAdmin: httpsCallable(functions, "setAdminRole"),
  getUsers: httpsCallable(functions, "getUsers"),
  updateUser: httpsCallable(functions, "updateUser"),
  deleteUser: httpsCallable(functions, "deleteUser"),
  getSessions: httpsCallable(functions, "getSessions"),
  updateSession: httpsCallable(functions, "updateSession"),
  deleteSession: httpsCallable(functions, "deleteSession"),
  getAnalytics: httpsCallable(functions, "getAnalytics"),
};

export default app;
