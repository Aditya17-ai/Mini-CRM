import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface AdminDashboardProps {
  onShowUsers: () => void;
  onShowJobs: () => void;
  showUsers: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onShowUsers, onShowJobs, showUsers }) => {
  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, letterSpacing: 1 }}>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: '#e3f2fd', boxShadow: 3 }}>
            <CardContent>
              <GroupIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Manage Users
              </Typography>
              <Button
                variant={showUsers ? 'contained' : 'outlined'}
                color="primary"
                sx={{ mt: 2 }}
                onClick={onShowUsers}
                fullWidth
              >
                Show Users
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: '#f3e5f5', boxShadow: 3 }}>
            <CardContent>
              <WorkIcon color="secondary" sx={{ fontSize: 40 }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Manage Jobs
              </Typography>
              <Button
                variant={!showUsers ? 'contained' : 'outlined'}
                color="secondary"
                sx={{ mt: 2 }}
                onClick={onShowJobs}
                fullWidth
              >
                Show Jobs
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: '#fffde7', boxShadow: 3 }}>
            <CardContent>
              <AssessmentIcon color="action" sx={{ fontSize: 40 }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Analytics (Coming Soon)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Visualize job stats, user activity, and more.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
