import express from 'express';
import { Job, User } from './models.js';
const router = express.Router();

// GET /api/analytics/jobs-status-count
router.get('/jobs-status-count', async (req, res) => {
  // Only admin should access in production, but for demo, allow all
  const statusCounts = await Job.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  res.json(statusCounts);
});

export default router;
