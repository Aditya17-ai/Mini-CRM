import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Snackbar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface User {
  _id: string;
  email: string;
  is_admin: boolean;
}

interface UserListProps {
  token: string;
}

const UserList: React.FC<UserListProps> = ({ token }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editAdmin, setEditAdmin] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      console.log('UserList token:', token); // Debug log
      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          let data;
          try {
            data = await res.json();
          } catch {
            setError(`HTTP ${res.status}: ${res.statusText}`);
            return;
          }
          throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setUsers(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Network error');
        }
      }
    };
    fetchUsers();
  }, [token]);

  const handleEdit = (user: User) => {
    setEditUser(user);
    setEditEmail(user.email);
    setEditAdmin(user.is_admin);
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    try {
      const res = await fetch(`/api/users/${editUser._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: editEmail, is_admin: editAdmin }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      setSnackbar('User updated');
      setEditUser(null);
      setEditEmail('');
      setEditAdmin(false);
      // Refresh users
      const updated = await res.json();
      setUsers(users => users.map(u => u._id === updated._id ? updated : u));
    } catch {
      setSnackbar('Error updating user');
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      const res = await fetch(`/api/users/${deleteUser._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      setSnackbar('User deleted');
      setDeleteUser(null);
      setUsers(users => users.filter(u => u._id !== deleteUser._id));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setSnackbar(e.message);
      } else {
        setSnackbar('Error deleting user');
      }
    }
  };

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

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>Users List</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Paper>
        <List>
          {users.map(user => (
            <ListItem key={user._id} divider
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => setDeleteUser(user)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={user.email}
                secondary={user.is_admin ? 'Admin' : 'User'}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* Edit Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            value={editEmail}
            onChange={e => setEditEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
          <label>
            <input
              type="checkbox"
              checked={editAdmin}
              onChange={e => setEditAdmin(e.target.checked)}
            />{' '}
            Admin
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Dialog */}
      <Dialog open={!!deleteUser} onClose={() => setDeleteUser(null)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {deleteUser?.email}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUser(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for notifications */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
};

export default UserList;
