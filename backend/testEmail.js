import dotenv from 'dotenv';
dotenv.config();
import { sendEmailNotification } from './notify.js';

const to = process.argv[2] || process.env.SMTP_USER;

async function test() {
  try {
    await sendEmailNotification(to, 'Test Email', 'This is a test email from your Job Application Tracker backend.');
    console.log('Test email sent to', to);
  } catch (e) {
    console.error('Failed to send test email:', e);
  }
}

test();
