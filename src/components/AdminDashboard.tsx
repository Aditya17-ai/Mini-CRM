import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, CircularProgress } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AdminDashboardProps {
  onShowUsers: () => void;
  onShowJobs: () => void;
  showUsers: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onShowUsers, onShowJobs, showUsers }) => {
  const [statusData, setStatusData] = useState<{ _id: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (showAnalytics) {
      setLoading(true);
      fetch('/api/analytics/jobs-status-count')
        .then(res => res.json())
        .then(data => {
          setStatusData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [showAnalytics]);

  const chartData = {
    labels: statusData.map(s => s._id),
    datasets: [
      {
        label: 'Jobs by Status',
        data: statusData.map(s => s.count),
        backgroundColor: [
          '#1976d2', '#9c27b0', '#43a047', '#e53935', '#fbc02d'
        ],
      },
    ],
  };

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
                variant={!showUsers && !showAnalytics ? 'contained' : 'outlined'}
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
          <Card sx={{ background: '#fffde7', boxShadow: 3, minHeight: 180 }}>
            <CardContent>
              <AssessmentIcon color="action" sx={{ fontSize: 40 }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Analytics
              </Typography>
              <Button
                variant={showAnalytics ? 'contained' : 'outlined'}
                color="warning"
                sx={{ mt: 2, mb: 2 }}
                onClick={() => setShowAnalytics((v) => !v)}
                fullWidth
              >
                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </Button>
              {showAnalytics && (
                loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                    <CircularProgress />
                  </Box>
                ) : statusData.length === 0 ? (
                  <Typography color="text.secondary">No data</Typography>
                ) : (
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                      },
                    }}
                  />
                )
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
