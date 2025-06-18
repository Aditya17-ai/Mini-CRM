import React, { useState } from 'react';
import { Typography, TextField, Button, Alert, Paper, Box } from '@mui/material';

const API_BASE = import.meta.env.VITE_API_URL || '';

const AboutUs: React.FC<{ onSubmitSuccess?: () => void }> = ({ onSubmitSuccess }) => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.email || !form.message) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/aboutus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send message');
        setLoading(false);
        return;
      }
      setSuccess('Your details have been sent to the admin!');
      setForm({ name: '', email: '', message: '' });
      setLoading(false);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch {
      setError('Network error');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1 }} />
      <Paper sx={{ p: 4, maxWidth: 500, mx: 'auto', mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>About Us</Typography>
        <Typography align="center" sx={{ mb: 2 }}>
          Have a question or want to introduce yourself? Fill out the form below and the admin will be notified in real time!
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Message"
            name="message"
            value={form.message}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            minRows={3}
            required
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AboutUs;
