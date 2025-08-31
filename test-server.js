import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('=== Server Environment Test ===');
console.log('Current directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || 5000);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');

// Test MongoDB connection
if (process.env.MONGODB_URI) {
  console.log('\nTesting MongoDB connection...');
  try {
    await import('mongoose').then(async (mongoose) => {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connection successful');
      await mongoose.connection.close();
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

console.log('\n=== Server Test Complete ===');
