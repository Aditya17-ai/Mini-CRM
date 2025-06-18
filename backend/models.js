import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_admin: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true }, // opt-in/out
});

const jobSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, required: true },
  applied_date: { type: Date, required: true },
  notes: String,
});

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);

export { User, Job };
