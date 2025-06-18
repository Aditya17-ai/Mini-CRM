import express from 'express';
import { sendInAppNotification } from './index.js';
const router = express.Router();

// POST /api/aboutus
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    // Real-time in-app notification only (no email)
    sendInAppNotification(`New About Us message from ${name}: ${message}`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

export default router;
