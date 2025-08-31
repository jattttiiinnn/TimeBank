import express from 'express';

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint is working!', timestamp: new Date().toISOString() });
});

export default router;
