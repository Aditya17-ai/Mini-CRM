import React, { useState } from 'react';
import { Snackbar, Alert, IconButton, Badge, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, DialogActions, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface NotificationBarProps {
  messages: string[];
  open: boolean;
  onClose: () => void;
  onShowList: () => void;
  unreadCount: number;
}

const NotificationBar: React.FC<NotificationBarProps> = ({ messages, open, onClose, onShowList, unreadCount }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleBellClick = () => {
    setDialogOpen(true);
    onShowList();
  };

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={onClose} severity="info" sx={{ width: '100%' }}>
          {messages[messages.length - 1]}
        </Alert>
      </Snackbar>
      <IconButton color="inherit" onClick={handleBellClick} sx={{ position: 'fixed', top: 24, right: 24, zIndex: 2000 }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Messages</DialogTitle>
        <DialogContent>
          <List>
            {messages.length === 0 ? (
              <ListItem><ListItemText primary="No messages" /></ListItem>
            ) : (
              messages.slice().reverse().map((msg, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText primary={msg} />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationBar;
