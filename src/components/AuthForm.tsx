import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper, Fade } from '@mui/material';

interface AuthFormProps {
  onAuth: (token: string) => void;
}

const backgroundUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80'; // Modern background
const logoUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; // Example logo

const AuthForm: React.FC<AuthFormProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        onAuth(data.token);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Network error');
    }
  };

  const handleSwitch = () => {
    setShow(false);
    setTimeout(() => {
      setIsLogin((v) => !v);
      setShow(true);
    }, 300);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(rgba(25, 118, 210, 0.5), rgba(25, 118, 210, 0.7)), url(${backgroundUrl}) center/cover no-repeat fixed`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
    }}>
      <Fade in={show} timeout={400}>
        <Paper elevation={16} sx={{
          p: 5,
          maxWidth: 400,
          width: '100%',
          borderRadius: 6,
          backdropFilter: 'blur(12px)',
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          position: 'relative',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <img src={logoUrl} alt="Logo" style={{ width: 64, height: 64, borderRadius: '50%', boxShadow: '0 2px 8px #1976d2' }} />
          </Box>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, letterSpacing: 2, color: '#1976d2' }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoFocus
              sx={{ background: 'rgba(255,255,255,0.7)', borderRadius: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              sx={{ background: 'rgba(255,255,255,0.7)', borderRadius: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 3, boxShadow: '0 2px 8px #1976d2' }}>
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </form>
          <Button onClick={handleSwitch} fullWidth sx={{ mt: 2, color: '#1976d2', fontWeight: 600, borderRadius: 3 }}>
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </Button>
        </Paper>
      </Fade>
    </Box>
  );
};

export default AuthForm;
