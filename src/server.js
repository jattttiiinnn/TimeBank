import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Config
import config from './config/env.js';
import { connectDB } from './config/database.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';
import apiLimiter from './middleware/rateLimiter.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import sessionRoutes from './routes/sessions.js';
import chatRoutes from './routes/chat.js';
import healthRoutes from './routes/health.js';

// Models
import Chat from './models/Chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Enhanced CORS Configuration
const allowedOrigins = [
  'https://timebank-e67e2.web.app',
  'https://www.timebank-e67e2.web.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: ${origin} not allowed`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Enable CORS with options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Log CORS errors
app.use((err, req, res, next) => {
  if (err) {
    console.error('CORS Error:', err.message);
    if (err.status === 403) {
      return res.status(403).json({
        status: 'error',
        message: 'Not allowed by CORS',
        allowedOrigins: allowedOrigins
      });
    }
  }
  next();
});

// Socket.IO Configuration with matching CORS settings
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  },
  pingTimeout: 10000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e8 // 100MB
});

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Test endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
    nodeVersion: process.version
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware (must be after all routes)
app.use(errorHandler);

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join chat room
  socket.on('join-chat', (chatId) => {
    try {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
      
      const room = io.sockets.adapter.rooms.get(chatId);
      console.log(`Room ${chatId} now has ${room ? room.size : 0} users`);
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle new messages
  socket.on('send-message', async (data) => {
    try {
      const { chatId, senderId, content } = data;
      
      if (!chatId || !senderId || !content) {
        throw new Error('Missing required fields');
      }
      
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }
      
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
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: error.message || 'Failed to send message' });
    }
  });

  // Video call events
  socket.on('initiate-video-call', (data) => {
    try {
      console.log('Video call initiated:', data);
      socket.to(data.chatId).emit('incoming-video-call', {
        from: data.from,
        chatId: data.chatId,
        fromName: data.fromName || 'Unknown User'
      });
    } catch (error) {
      console.error('Error initiating video call:', error);
      socket.emit('error', { message: 'Failed to initiate video call' });
    }
  });

  socket.on('accept-video-call', (data) => {
    try {
      socket.to(data.chatId).emit('call-accepted', {
        from: data.to
      });
    } catch (error) {
      console.error('Error accepting video call:', error);
      socket.emit('error', { message: 'Failed to accept video call' });
    }
  });

  socket.on('reject-video-call', (data) => {
    try {
      socket.to(data.chatId).emit('call-rejected', {
        from: data.to
      });
    } catch (error) {
      console.error('Error rejecting video call:', error);
      socket.emit('error', { message: 'Failed to reject video call' });
    }
  });

  socket.on('end-video-call', (data) => {
    try {
      socket.to(data.chatId).emit('call-ended');
    } catch (error) {
      console.error('Error ending video call:', error);
      socket.emit('error', { message: 'Failed to end video call' });
    }
  });

  socket.on('video-call-offer', (data) => {
    try {
      socket.to(data.chatId).emit('video-call-offer', data);
    } catch (error) {
      console.error('Error handling video call offer:', error);
      socket.emit('error', { message: 'Failed to process video call offer' });
    }
  });

  socket.on('video-call-answer', (data) => {
    try {
      socket.to(data.chatId).emit('video-call-answer', data);
    } catch (error) {
      console.error('Error handling video call answer:', error);
      socket.emit('error', { message: 'Failed to process video call answer' });
    }
  });

  socket.on('ice-candidate', (data) => {
    try {
      socket.to(data.chatId).emit('ice-candidate', data);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      socket.emit('error', { message: 'Failed to process ICE candidate' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'TimeBank API is running!',
    timestamp: new Date().toISOString(),
    environment: config.env,
    nodeVersion: process.version
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(config.port, () => {
      console.log(`Server running in ${config.env} mode on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, server, io }; // Export for testing