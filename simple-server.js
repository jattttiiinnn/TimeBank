import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Simple test server is working!',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});
