import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from './models.js';
import { sendInAppNotification } from './index.js';
import { sendEmailNotification } from './notify.js';
const router = express.Router();

function adminMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    if (!decoded || !decoded.id) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/users - admin only
router.get('/', adminMiddleware, async (req, res) => {
  // Check if user is admin
  const user = await User.findById(req.user.id);
  if (!user || !user.is_admin) return res.status(403).json({ error: 'Forbidden' });
  const users = await User.find({}, '-password'); // Exclude password field
  res.json(users);
});

// PATCH /api/users/:id - admin only, edit user
router.patch('/:id', adminMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.is_admin) return res.status(403).json({ error: 'Forbidden' });
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, fields: '-password' });
  if (updated) {
    sendInAppNotification(`User updated: ${updated.email}`);
    try {
      await sendEmailNotification('admin@example.com', 'User Updated', `User updated: ${updated.email}`);
    } catch (e) {
      console.error('Email notification failed:', e);
    }
  }
  res.json(updated);
});

// PATCH /api/users/:id/emailNotifications - user or admin can update their own notification preference
router.patch('/:id/emailNotifications', adminMiddleware, async (req, res) => {
  // Only allow self or admin
  if (req.user.id !== req.params.id) {
    const user = await User.findById(req.user.id);
    if (!user || !user.is_admin) return res.status(403).json({ error: 'Forbidden' });
  }
  const { emailNotifications } = req.body;
  const updated = await User.findByIdAndUpdate(req.params.id, { emailNotifications }, { new: true, fields: '-password' });
  res.json(updated);
});

// DELETE /api/users/:id - admin only, delete user
router.delete('/:id', adminMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.is_admin) {
    console.log('Delete failed: not admin or not found', req.user.id);
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.user.id === req.params.id) {
    console.log('Delete failed: tried to delete self', req.user.id);
    return res.status(400).json({ error: "You can't delete yourself." });
  }
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (deleted) {
      sendInAppNotification(`User deleted: ${deleted.email}`);
      try {
        await sendEmailNotification('admin@example.com', 'User Deleted', `User deleted: ${deleted.email}`);
      } catch (e) {
        console.error('Email notification failed:', e);
      }
      console.log('User deleted:', deleted.email, deleted._id);
    } else {
      console.log('Delete failed: user not found', req.params.id);
    }
    res.json({ success: !!deleted });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
