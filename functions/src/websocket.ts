import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export const initializeWebSocketServer = () => {
  const app = express();
  const server = http.createServer(app);
  
  // Configure CORS for Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        'http://localhost:3000', // Local development
        'https://your-app.web.app', // Production URL - replace with your actual domain
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io/' // Ensure this matches your client-side Socket.IO path
  });

  // Store active rooms and their participants
  const rooms = new Map<string, Set<string>>();
  const socketToRoom = new Map<string, string>();

  // Authentication middleware for WebSocket connections
  const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      (socket as any).user = decodedToken;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  };

  io.use(authenticateSocket);

  io.on('connection', (socket: Socket & { user?: any }) => {
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
          .filter(id => id !== socket.id);
        
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

  return server;
};

// Export the WebSocket server as a Firebase Function
export const videoChat = functions.https.onRequest((req, res) => {
  // This is a placeholder - the actual WebSocket server is initialized above
  res.status(200).send('WebSocket server is running');
});
