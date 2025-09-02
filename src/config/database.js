import mongoose from 'mongoose';
import config from './env.js';

const { mongodb } = config;

// Helpful Mongoose settings: fail fast on missing connection, but don't crash the process
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 30000);

const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Log sanitized target once per attempt
      try {
        const url = new URL(mongodb.uri.replace('mongodb+srv://', 'mongodb://'));
        const host = url.host;
        const dbName = url.pathname?.replace(/^\//, '') || '(default)';
        console.log(`Attempting MongoDB connect → host: ${host}, db: ${dbName}`);
      } catch {}

      await mongoose.connect(mongodb.uri, {
        ...mongodb.options,
        // Slightly higher to accommodate local/Atlas cold starts
        serverSelectionTimeoutMS: Math.max(15000, mongodb.options?.serverSelectionTimeoutMS || 0),
      });
      console.log('✅ MongoDB Connected');
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        console.error('Failed to connect to MongoDB after maximum retries');
        // Do not hard exit; let the process continue for diagnostics (e.g., health checks)
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  // Do not exit here; connectDB will handle retries and failures.
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');});

export { connectDB };
export default mongoose;
