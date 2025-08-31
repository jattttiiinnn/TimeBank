import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing MongoDB connection...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not set in environment variables');
  process.exit(1);
}

try {
  console.log('Attempting to connect to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Successfully connected to MongoDB');
  await mongoose.connection.close();
  console.log('Connection closed');
} catch (error) {
  console.error('MongoDB connection error:', error);
  process.exit(1);
}
