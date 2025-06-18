import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';

interface AuthFormProps {
  onAuth: (token: string) => void;
}

const backgroundUrl = 'https://static.wixstatic.com/media/84770f_7b2e2e2e2e2e4e2e8e2e2e2e2e2e2e2e~mv2.jpg'; // Use a modern background image or your own

const AuthForm: React.FC<AuthFormProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `url(${backgroundUrl}) center/cover no-repeat fixed`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
    }}>
      <Paper elevation={8} sx={{ p: 5, maxWidth: 400, width: '100%', borderRadius: 4, backdropFilter: 'blur(6px)', background: 'rgba(255,255,255,0.95)' }}>
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
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.5, fontWeight: 600, fontSize: 18 }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>
        <Button onClick={() => setIsLogin(!isLogin)} fullWidth sx={{ mt: 2, color: '#1976d2', fontWeight: 600 }}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </Button>
      </Paper>
    </Box>
  );
};

export default AuthForm;
