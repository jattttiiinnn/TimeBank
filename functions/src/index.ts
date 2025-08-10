// Import types for Node.js HTTP server
import { createServer, Server as HttpServer } from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { AddressInfo } from 'net';

// Import Express and CORS with types
import express, { Express, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';

// Import Socket.IO with types
import { Server as SocketIOServer, Socket } from 'socket.io';

// Import Firebase Admin with types
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Firebase Admin
admin.initializeApp();

// Define types for Socket.IO with custom user property
declare module 'socket.io' {
  interface Socket {
    user?: {
      uid: string;
      email?: string;
      name?: string;
    };
  }
}

// Create Express app for WebSocket server
const app = express();
const server = http.createServer(app);

// Get allowed origins from environment variables or use defaults
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://your-app.web.app', // Replace with your production domain
  'https://your-app.firebaseapp.com' // Firebase Hosting domain
].filter(Boolean);

// Configure CORS for Express
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS middleware
express().use(cors(corsOptions));

// Configure Socket.IO with CORS and authentication
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io/',
  serveClient: false,
  connectTimeout: 10000,
  pingTimeout: 5000,
  pingInterval: 10000
});

// Store active rooms and their participants
const rooms = new Map<string, Set<string>>();
const socketToRoom = new Map<string, string>();
const socketToUserId = new Map<string, string>();

// Authentication middleware for WebSocket connections
const authenticateSocket = async (socket: any, next: (err?: Error) => void) => {
  try {
    // Get token from either auth object or query parameters
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      console.warn('No auth token provided');
      return next(new Error('Authentication error: No token provided'));
    }
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    if (!decodedToken || !decodedToken.uid) {
      console.warn('Invalid token format');
      return next(new Error('Authentication error: Invalid token'));
    }
    
    // Get additional user data from Firestore
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      console.warn('User data not found in Firestore');
      return next(new Error('Authentication error: User not found'));
    }
    
    // Attach user info to the socket
    socket.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || userData.email,
      name: userData.displayName || userData.name || 'Anonymous',
      role: userData.role || 'user',
      avatar: userData.photoURL || userData.avatar
    };
    
    // Map socket ID to user ID for quick lookups
    socketToUserId.set(socket.id, decodedToken.uid);
    
    console.log(`User ${socket.user.uid} (${socket.user.name}) authenticated`);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    
    // More specific error messages based on error type
    if (error.code === 'auth/id-token-expired') {
      return next(new Error('Authentication error: Token expired'));
    } else if (error.code === 'auth/argument-error') {
      return next(new Error('Authentication error: Invalid token format'));
    } else if (error.code === 'auth/user-not-found') {
      return next(new Error('Authentication error: User not found'));
    }
    
    next(new Error('Authentication error: Could not authenticate'));
  }
};

// Apply authentication middleware
io.use(authenticateSocket);

// Handle socket connections
io.on('connection', (socket: any) => {
  if (!socket.user || !socket.user.uid) {
    console.error('Socket connected without proper authentication');
    socket.disconnect(true);
    return;
  }

  const userId = socket.user.uid;
  console.log(`User connected: ${socket.id} (User ID: ${userId}, Name: ${socket.user.name || 'Unknown'})`);
  
  // Send welcome message with user data
  socket.emit('authenticated', { 
    userId,
    user: socket.user,
    message: 'Successfully connected to WebSocket server'
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason: string) => {
    console.log(`User disconnected: ${socket.id} (User ID: ${userId}, Reason: ${reason})`);
    
    // Clean up user mappings
    socketToUserId.delete(socket.id);
    
    // Remove from any rooms
    if (socketToRoom.has(socket.id)) {
      const roomId = socketToRoom.get(socket.id)!;
      
      // Notify other users in the room
      socket.to(roomId).emit('user-disconnected', { 
        userId,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
      
      // Clean up room tracking
      if (rooms.has(roomId)) {
        rooms.get(roomId)?.delete(socket.id);
        
        // If room is empty, clean it up
        if (rooms.get(roomId)?.size === 0) {
          console.log(`Room ${roomId} is empty, cleaning up`);
          rooms.delete(roomId);
        }
      }
      
      socketToRoom.delete(socket.id);
    }
    
    // Log disconnection metrics (optional)
    const connectionDuration = Date.now() - (socket.handshake.time || Date.now());
    console.log(`User ${userId} was connected for ${Math.floor(connectionDuration / 1000)} seconds`);
  });
  
  // Handle connection errors
  socket.on('error', (error: Error) => {
    console.error(`Socket error for user ${userId}:`, error);
    socket.emit('error', { 
      code: 'socket_error', 
      message: 'A socket error occurred',
      details: error.message 
    });
  });
  
  // Handle join-room event
  socket.on('join-room', async ({ roomId, userId: clientUserId }: { roomId: string; userId: string }, callback: Function) => {
    try {
      // Input validation
      if (!roomId || !clientUserId) {
        throw new Error('Missing required parameters: roomId and userId are required');
      }
      
      // Verify the client's userId matches the authenticated user
      if (clientUserId !== socket.user.uid) {
        throw new Error('User ID mismatch');
      }
      
      const userId = socket.user.uid;
      console.log(`User ${userId} attempting to join room ${roomId}`);
      
      // Validate room ID format if needed
      // Example: if (roomId.length < 6 || roomId.length > 64) {
      //   throw new Error('Invalid room ID format');
      // }
      
      // Leave any existing room
      if (socketToRoom.has(socket.id)) {
        const previousRoom = socketToRoom.get(socket.id)!;
        
        // Only clean up if joining a different room
        if (previousRoom !== roomId) {
          console.log(`User ${userId} leaving previous room ${previousRoom}`);
          
          // Notify others in the previous room
          socket.to(previousRoom).emit('user-left-room', { 
            userId,
            socketId: socket.id,
            roomId: previousRoom
          });
          
          // Clean up previous room
          if (rooms.has(previousRoom)) {
            rooms.get(previousRoom)?.delete(socket.id);
            if (rooms.get(previousRoom)?.size === 0) {
              console.log(`Room ${previousRoom} is now empty`);
              rooms.delete(previousRoom);
            }
          }
          
          socket.leave(previousRoom);
        } else {
          // Already in this room, no need to rejoin
          console.log(`User ${userId} already in room ${roomId}`);
          
          // Still send current room state
          const otherUsers = getUsersInRoom(roomId, socket.id);
          
          if (typeof callback === 'function') {
            callback({
              success: true,
              roomId,
              userId,
              otherUsers,
              message: 'Already in room'
            });
          }
          
          return;
        }
      }
      
      // Join the new room
      console.log(`User ${userId} joining room ${roomId}`);
      await socket.join(roomId);
      socketToRoom.set(socket.id, roomId);
      
      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        console.log(`Creating new room: ${roomId}`);
        rooms.set(roomId, new Set());
      }
      
      // Add to room tracking
      rooms.get(roomId)?.add(socket.id);
      
      // Get list of other users in the room
      const otherUsers = getUsersInRoom(roomId, socket.id);
      
      // Notify the user who just joined about other users
      socket.emit('users-in-room', { 
        roomId,
        users: otherUsers,
        timestamp: new Date().toISOString()
      });
      
      // Notify others about the new user (excluding self)
      const userInfo = {
        userId,
        socketId: socket.id,
        user: {
          name: socket.user.name,
          email: socket.user.email,
          avatar: socket.user.avatar
        },
        timestamp: new Date().toISOString()
      };
      
      socket.to(roomId).emit('user-connected', userInfo);
      
      console.log(`User ${userId} successfully joined room ${roomId} with ${otherUsers.length} other users`);
      
      // Send success response if callback provided
      if (typeof callback === 'function') {
        callback({
          success: true,
          roomId,
          userId,
          otherUsers,
          message: 'Successfully joined room'
        });
      }
      
    } catch (error) {
      console.error('Error joining room:', error);
      
      // Send detailed error to client
      const errorResponse = {
        success: false,
        error: error.message || 'Failed to join room',
        code: error.code || 'room_join_error',
        roomId,
        timestamp: new Date().toISOString()
      };
      
      if (typeof callback === 'function') {
        callback(errorResponse);
      } else {
        // Fallback to emitting error event if no callback
        socket.emit('room-join-error', errorResponse);
      }
    }
  });
  
  // Helper function to get users in a room
  const getUsersInRoom = (roomId: string, excludeSocketId: string) => {
    if (!rooms.has(roomId)) return [];
    
    return Array.from(rooms.get(roomId) || [])
      .filter((id: string) => id !== excludeSocketId)
      .map((id: string) => ({
        socketId: id,
        userId: socketToUserId.get(id) || 'unknown',
        // Add any additional user info you want to share
      }));
  };
  
  // Handle signaling for WebRTC
  socket.on('signal', ({ to, signal, roomId }: { to: string; signal: any; roomId?: string }, callback: Function) => {
    try {
      if (!to) {
        throw new Error('Missing target user ID');
      }
      
      if (!signal) {
        throw new Error('Missing signal data');
      }
      
      // Validate that the user is in the same room as the target (if roomId is provided)
      if (roomId) {
        const currentRoom = socketToRoom.get(socket.id);
        if (currentRoom !== roomId) {
          throw new Error('Not in the same room as the target user');
        }
        
        // Verify target is in the same room
        const targetSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.id === to);
          
        if (targetSocket && socketToRoom.get(targetSocket.id) !== roomId) {
          throw new Error('Target user is not in the same room');
        }
      }
      
      console.log(`Forwarding signal from ${socket.id} to ${to} (type: ${signal.type || 'unknown'})`);
      
      // Forward the signal to the target user
      io.to(to).emit('signal', { 
        signal,
        from: socket.id,
        userId: socket.user?.uid,
        roomId: roomId || socketToRoom.get(socket.id),
        timestamp: new Date().toISOString()
      });
      
      // Send acknowledgement if callback provided
      if (typeof callback === 'function') {
        callback({ success: true });
      }
      
    } catch (error) {
      console.error('Error handling signal:', error);
      
      const errorResponse = {
        success: false,
        error: error.message || 'Failed to send signal',
        code: error.code || 'signal_error',
        timestamp: new Date().toISOString()
      };
      
      if (typeof callback === 'function') {
        callback(errorResponse);
      } else {
        socket.emit('signal-error', errorResponse);
      }
    }
  });
  
  // Handle token refresh
  socket.on('auth:refresh', async ({ token }: { token: string }, callback: Function) => {
    try {
      if (!token) {
        throw new Error('No token provided');
      }
      
      console.log(`Refreshing token for socket ${socket.id}`);
      
      const decodedToken = await admin.auth().verifyIdToken(token, true);
      
      if (!decodedToken || !decodedToken.uid) {
        throw new Error('Invalid token');
      }
      
      // Get updated user data
      const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('User data not found');
      }
      
      // Update socket user data
      socket.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || userData.email,
        name: userData.displayName || userData.name || 'Anonymous',
        role: userData.role || 'user',
        avatar: userData.photoURL || userData.avatar
      };
      
      // Update user ID mapping
      socketToUserId.set(socket.id, decodedToken.uid);
      
      console.log(`Token refreshed for user ${socket.user.uid} (${socket.user.name})`);
      
      // Send success response
      if (typeof callback === 'function') {
        callback({
          success: true,
          user: socket.user,
          message: 'Token refreshed successfully'
        });
      }
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      const errorResponse = {
        success: false,
        error: error.message || 'Failed to refresh token',
        code: error.code || 'token_refresh_error',
        requiresReauth: true,
        timestamp: new Date().toISOString()
      };
      
      if (typeof callback === 'function') {
        callback(errorResponse);
      }
      
      // Only disconnect if it's an authentication error
      if (error.code?.startsWith('auth/')) {
        socket.emit('auth-error', errorResponse);
        socket.disconnect(true);
      }
    }
  });
});

io.on('connection', (socket: any) => {
  console.log(`User connected: ${socket.id}`);

  // Handle joining a video room
  socket.on('join-room', (roomId: string) => {
    try {
      // Leave any existing room
      if (socketToRoom.has(socket.id)) {
        const previousRoom = socketToRoom.get(socket.id)!;
        socket.leave(previousRoom);
        
        // Remove from room tracking
        if (rooms.has(previousRoom)) {
          rooms.get(previousRoom)?.delete(socket.id);
          if (rooms.get(previousRoom)?.size === 0) {
            rooms.delete(previousRoom);
          }
        }
      }

      // Join the new room
      socket.join(roomId);
      socketToRoom.set(socket.id, roomId);

      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId)?.add(socket.id);

      // Notify others in the room
      socket.to(roomId).emit('user-connected', socket.id);

      // Send list of existing users in the room
      const usersInRoom = Array.from(rooms.get(roomId) || [])
        .filter((id: string) => id !== socket.id);
      
      socket.emit('existing-users', usersInRoom);

      console.log(`User ${socket.id} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  // WebRTC signaling
  socket.on('signal', (data: { to: string; signal: any }) => {
    io.to(data.to).emit('signal', { signal: data.signal, from: socket.id });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      socket.leave(roomId);
      
      // Remove from room tracking
      if (rooms.has(roomId)) {
        rooms.get(roomId)?.delete(socket.id);
        
        // Notify others in the room
        socket.to(roomId).emit('user-disconnected', socket.id);
        
        // Clean up empty rooms
        if (rooms.get(roomId)?.size === 0) {
          rooms.delete(roomId);
        }
      }
      
      socketToRoom.delete(socket.id);
    }
  });
});

// Import admin functions
import { 
  getUsers, 
  updateUser, 
  deleteUser, 
  getSessions, 
  updateSession, 
  deleteSession, 
  getAnalytics, 
  setAdminRole 
} from './admin';

// Export admin functions
export {
  getUsers,
  updateUser,
  deleteUser,
  getSessions,
  updateSession,
  deleteSession,
  getAnalytics,
  setAdminRole,
};

// Health check endpoint
export const healthCheck = functions.https.onRequest((req, res) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connections: io.engine.clientsCount,
    rooms: Array.from(rooms.keys()).length
  };
  
  res.json(status);
});

// Export WebSocket server as a callable function
export const videoChat = functions.https.onRequest((req, res) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', allowedOrigins.join(','));
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.status(204).send('');
    return;
  }
  
  // Handle regular requests
  res.json({
    status: 'WebSocket server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      websocket: '/socket.io/',
      health: '/health'
    },
    allowedOrigins
  });
});

// Export a callable function for room management
export const createRoom = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to create a room'
    );
  }
  
  const { roomId, roomName, isPrivate = false } = data;
  
  if (!roomId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Room ID is required'
    );
  }
  
  try {
    // Check if room already exists
    const roomRef = admin.firestore().collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    
    if (roomDoc.exists) {
      throw new functions.https.HttpsError(
        'already-exists',
        'A room with this ID already exists'
      );
    }
    
    // Create the room
    await roomRef.set({
      id: roomId,
      name: roomName || `Room ${roomId}`,
      isPrivate,
      createdBy: context.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      participantCount: 0
    });
    
    return {
      success: true,
      roomId,
      message: 'Room created successfully'
    };
    
  } catch (error) {
    console.error('Error creating room:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create room',
      error
    );
  }
});

// Start the server when running locally
if (process.env.FUNCTIONS_EMULATOR) {
  const PORT = process.env.PORT || 5001;
  
  // Add error handling for the server
  server.on('error', (error: NodeJS.ErrnoException) => {
    console.error('Server error:', error);
    
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
    }
  });
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=== WebSocket Server ===`);
    console.log(`Status:  Running`);
    console.log(`Port:    ${PORT}`);
    console.log(`Env:     ${process.env.NODE_ENV || 'development'}`);
    console.log(`Time:    ${new Date().toISOString()}`);
    console.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
    console.log(`======================\n`);
    
    // Log memory usage periodically
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const used = process.memoryUsage();
        console.log('Memory usage (MB):', {
          rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
          heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
          heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
          external: Math.round(used.external / 1024 / 1024 * 100) / 100,
        });
      }, 60000); // Log every minute
    }
  });
  
  // Handle graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down server...');
    
    // Close all sockets
    io.sockets.sockets.forEach(socket => {
      socket.emit('server-shutdown', { message: 'Server is shutting down' });
      socket.disconnect(true);
    });
    
    // Close the server
    server.close(() => {
      console.log('Server has been shut down');
      process.exit(0);
    });
    
    // Force exit after timeout
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 5000);
  };
  
  // Listen for termination signals
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
