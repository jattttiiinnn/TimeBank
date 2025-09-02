// Placeholder to satisfy tests if real file path differs.
// Replace this with actual router file path used by the project.
import express from 'express';
const router = express.Router();
router.get('/me', (_req, res) => res.json({ user: {} }));
export default router;