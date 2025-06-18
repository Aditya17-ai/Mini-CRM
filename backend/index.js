import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';
import jobRoutes from './jobs.js';
import usersRoutes from './users.js';
import aboutusRoutes from './aboutus.js';
import analyticsRoutes from './analytics.js';
import connectDb from './db.js';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'mini-crm-tau.vercel.app', // replace with your actual frontend Render URL
  'https://mini-crm-bu0j.onrender.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDb();

// Mount the auth, job, and user routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/aboutus', aboutusRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test route
app.get('/', (req, res) => res.send('API Running'));

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const io = new Server(server, { cors: { origin: '*' } });

// Broadcast notification utility
export function sendInAppNotification(message) {
  io.emit('notification', message);
}
