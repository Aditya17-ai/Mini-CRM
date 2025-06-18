// Usage: node makeAdmin.js user@email.com
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from './models.js';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node makeAdmin.js user@email.com');
  process.exit(1);
}

async function promoteToAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOneAndUpdate(
    { email },
    { is_admin: true },
    { new: true }
  );
  if (user) {
    console.log(`User ${email} is now admin.`);
  } else {
    console.log(`User ${email} not found.`);
  }
  await mongoose.disconnect();
}

promoteToAdmin();
