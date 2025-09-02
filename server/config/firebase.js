import admin from 'firebase-admin';

let adminInitialized = false;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const envKey = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY;

    if (envKey) {
      // Support both JSON string and base64-encoded JSON
      let jsonString = envKey.trim();
      if (!jsonString.startsWith('{')) {
        try { jsonString = Buffer.from(jsonString, 'base64').toString('utf8'); } catch {}
      }

      const parsed = JSON.parse(jsonString);
      // Fix common Windows newline escaping in private_key
      if (parsed.private_key && typeof parsed.private_key === 'string') {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert(parsed),
        projectId: parsed.project_id || 'timebank-e67e2',
      });
      adminInitialized = true;
      console.log('Firebase Admin initialized using service account');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use ADC if a credentials file path is provided
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      adminInitialized = true;
      console.log('Firebase Admin initialized using application default credentials');
    } else {
      // No credentials; skip admin. Google auth endpoint should handle this gracefully.
      console.warn('Firebase Admin not configured. GOOGLE auth endpoint will be disabled.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export { adminInitialized };
export default admin;
