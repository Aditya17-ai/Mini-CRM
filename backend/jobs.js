import express from 'express';
import jwt from 'jsonwebtoken';
import { Job, User } from './models.js';
import { sendEmailNotification } from './notify.js';
import { sendInAppNotification } from './index.js';
const router = express.Router();

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

const allowedStatuses = ["Applied", "Interview", "Offer", "Rejected", "Accepted"];

// CRUD routes
router.get('/', authMiddleware, async (req, res) => {
  const { status, sort } = req.query;
  const filter = { user_id: req.user.id };
  if (status) filter.status = status;
  const jobs = await Job.find(filter).sort({ applied_date: sort === 'desc' ? -1 : 1 });
  res.json(jobs);
});

router.post('/', authMiddleware, async (req, res) => {
  const { company, role, status, applied_date, notes } = req.body;
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  const job = await Job.create({
    user_id: req.user.id,
    company,
    role,
    status,
    applied_date,
    notes,
  });
  // Send email notification (replace with real user email in production)
  try {
    await sendEmailNotification('admin@example.com', 'New Job Application', `A new job was added: ${company} - ${role}`);
  } catch (e) {
    console.error('Email notification failed:', e);
  }
  // Send in-app notification
  sendInAppNotification(`New job added: ${company} - ${role}`);
  res.json(job);
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { company, role, status, applied_date, notes } = req.body;
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user.id },
    { company, role, status, applied_date, notes },
    { new: true }
  );
  // Send email notification for job edit
  try {
    await sendEmailNotification('admin@example.com', 'Job Updated', `A job was updated: ${company} - ${role}`);
  } catch (e) {
    console.error('Email notification failed:', e);
  }
  sendInAppNotification(`Job updated: ${company} - ${role}`);
  res.json(job);
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
  if (job) {
    // Send email notification for job delete
    try {
      await sendEmailNotification('admin@example.com', 'Job Deleted', `A job was deleted: ${job.company} - ${job.role}`);
    } catch (e) {
      console.error('Email notification failed:', e);
    }
    sendInAppNotification(`Job deleted: ${job.company} - ${job.role}`);
  }
  res.json({ success: !!job });
});

// GET /api/jobs/all - admin only
router.get('/all', authMiddleware, async (req, res) => {
  // Check if user is admin
  const user = await User.findById(req.user.id);
  if (!user || !user.is_admin) return res.status(403).json({ error: 'Forbidden' });
  const { sort } = req.query;
  const jobs = await Job.find({}).sort({ applied_date: sort === 'asc' ? 1 : -1 });
  res.json(jobs);
});

export default router;
