console.log('Starting debug server...');

import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);
const PORT = 3001;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'Debug server is running',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Debug server running on http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/debug\n`);});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);});
