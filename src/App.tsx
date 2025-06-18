import { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import JobList from './components/JobList';
import UserList from './components/UserList';
import AdminDashboard from './components/AdminDashboard';
import AboutUs from './components/AboutUs';
import { Container, Typography, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import lightTheme from './theme';
import './App.css';
import { io } from 'socket.io-client';
import NotificationBar from './components/NotificationBar';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [showUsers, setShowUsers] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  // Removed unused notification state
  const [notifications, setNotifications] = useState<string[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('notification', (msg: string) => {
      setNotifications((prev) => [...prev, msg]);
      setNotificationOpen(true);
      setUnreadCount((c) => c + 1);
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel('job_updates');

    channel.onmessage = (event) => {
      if (event.data === 'update') {
        // Trigger data refetch logic here
        console.log('Data updated in another tab, refetching...');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Trigger data refetch logic here
        console.log('Tab is visible, refetching data...');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      channel.close();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  function parseJwt(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return {};
    }
  }

  const decoded = token ? parseJwt(token) : {};
  const isAdmin = !!decoded.is_admin;
  console.log('Decoded JWT:', decoded);
  console.log('isAdmin:', isAdmin);

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ background: '#f8fafc', borderRadius: 4, boxShadow: 3, py: 4, minHeight: '90vh' }}>
        {isAdmin && notifications.length > 0 && (
          <NotificationBar
            messages={notifications}
            open={notificationOpen}
            onClose={() => setNotificationOpen(false)}
            onShowList={() => {}}
            unreadCount={unreadCount}
          />
        )}
        {/* Removed unused notification display */}
        <Box my={4}>
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, letterSpacing: 2, color: '#1976d2' }}>
            Job Application Tracker
          </Typography>
          {!token ? (
            <AuthForm onAuth={setToken} />
          ) : showAbout ? (
            <AboutUs onSubmitSuccess={() => setShowAbout(false)} />
          ) : isAdmin ? (
            <>
              <AdminDashboard
                onShowUsers={() => setShowUsers(true)}
                onShowJobs={() => setShowUsers(false)}
                showUsers={showUsers}
              />
              <Box display="flex" justifyContent="center" mb={2}>
                <button onClick={() => setShowAbout(true)} style={{ margin: 8, padding: '8px 24px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>About Us</button>
              </Box>
              {showUsers ? <UserList token={token} /> : <JobList token={token} isAdmin={isAdmin} />}
            </>
          ) : (
            <>
              <Box display="flex" justifyContent="center" mb={2}>
                <button onClick={() => setShowAbout(true)} style={{ margin: 8, padding: '8px 24px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>About Us</button>
              </Box>
              <JobList token={token} isAdmin={false} />
            </>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
