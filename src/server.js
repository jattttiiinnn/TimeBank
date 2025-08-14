import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { router as authRoutes } from '../server/routes/auth.js';
import { router as userRoutes } from '../server/routes/users.js';
import { router as sessionRoutes } from '../server/routes/sessions.js';
import { router as chatRoutes } from '../server/routes/chat.js';
import { router as healthRoutes } from '../server/routes/health.js';
import Chat from '../server/models/Chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const app = express();
const server = http.createServer(app);

// CORS Configuration - More permissive in development
if (process.env.NODE_ENV === 'production') {
  const allowedOrigins = [
    'https://timebank-e67e2.web.app',
    'https://www.timebank-e67e2.web.app'
  ];
  
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const msg = `CORS policy: ${origin} not allowed`;
      console.warn(msg);
      return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
  }));
} else {
  // In development, allow all origins
  app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  console.log('CORS: Running in development mode - allowing all origins');
}

// Handle preflight requests
app.options('*', cors());

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://timebank-e67e2.web.app',
          'https://www.timebank-e67e2.web.app'
        ]
      : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(express.json());

// Connect to MongoDB
const MONGO_URI = process.env.NODE_ENV === 'production'
  ? process.env.MONGODB_URI
  : process.env.MONGODB_URI || 'mongodb://localhost:27017/timebank';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', healthRoutes);

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  socket.on('send-message', async (data) => {
    console.log('Server: Received send-message event:', data);
    try {
      const { chatId, senderId, content } = data;
      
      const chat = await Chat.findById(chatId);
      if (chat) {
        chat.messages.push({
          senderId,
          content,
          timestamp: new Date()
        });
        chat.lastActivity = new Date();
        await chat.save();
        
        await chat.populate('messages.senderId', 'name');
        const newMessage = chat.messages[chat.messages.length - 1];
        
        // Emit to chat room and also globally for notifications
        io.to(chatId).emit('new-message', newMessage);
        socket.broadcast.emit('new-message', { ...newMessage, chatId });
        console.log('Server: Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Video call events
  socket.on('initiate-video-call', (data) => {
    console.log('Server: Video call initiated:', data);
    console.log('Server: Emitting to chat room:', data.chatId);
    console.log('Server: Sender socket ID:', socket.id);
    console.log('Server: Broadcasting to other users in room');
    socket.to(data.chatId).emit('incoming-video-call', {
      from: data.from,
      chatId: data.chatId,
      fromName: data.fromName || 'Unknown User'
    });
    console.log('Server: incoming-video-call event emitted');
  });

  socket.on('accept-video-call', (data) => {
    console.log('Server: Video call accepted:', data);
    console.log('Server: Notifying caller that call was accepted');
    socket.to(data.chatId).emit('call-accepted', {
      from: data.to
    });
  });

  socket.on('reject-video-call', (data) => {
    console.log('Server: Video call rejected:', data);
    console.log('Server: Notifying caller that call was rejected');
    socket.to(data.chatId).emit('call-rejected', {
      from: data.to
    });
  });

  socket.on('end-video-call', (data) => {
    console.log('Server: Video call ended:', data);
    socket.to(data.chatId).emit('call-ended');
  });

  socket.on('video-call-offer', (data) => {
    console.log('Server: Video call offer:', data);
    console.log('Server: Broadcasting offer to chat room:', data.chatId);
    socket.to(data.chatId).emit('video-call-offer', data);
  });

  socket.on('video-call-answer', (data) => {
    console.log('Server: Video call answer:', data);
    console.log('Server: Broadcasting answer to chat room:', data.chatId);
    socket.to(data.chatId).emit('video-call-answer', data);
  });

  socket.on('ice-candidate', (data) => {
    console.log('Server: ICE candidate received, broadcasting to chat room:', data.chatId);
    socket.to(data.chatId).emit('ice-candidate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'TimeBank API is running!' });
});

const PORT = process.env.PORT || 5001; // Use environment port or 5001 as fallback

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/timebank';
    console.log('Attempting to connect to MongoDB at:', mongoUri);
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Make sure MongoDB is running and the connection string is correct.');
    process.exit(1);
  }
};

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  });
}

export { app, server, io }; // Export for testing