import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // For production, you'll need to set FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY as environment variable
  // For development, you can use the project ID directly
  const firebaseConfig = {
    projectId: 'timebank-e67e2',
  };

  // Try to initialize with service account if available, otherwise use project ID only
  try {
    if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'timebank-e67e2'
      });
    } else {
      // For development - Firebase Admin will use default credentials
      admin.initializeApp(firebaseConfig);
    }
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export default admin;
