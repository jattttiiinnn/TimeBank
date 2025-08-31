import mongoose from 'mongoose';
import config from './env.js';

const { mongodb } = config;

const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(mongodb.uri, mongodb.options);
      console.log('✅ MongoDB Connected');
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        console.error('Failed to connect to MongoDB after maximum retries');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');});

export { connectDB };
export default mongoose;
