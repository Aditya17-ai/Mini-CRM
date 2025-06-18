import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const statusOptions = ['Applied', 'Interview', 'Offer', 'Rejected', 'Accepted'];

interface Job {
  _id: string;
  company: string;
  role: string;
  status: string;
  applied_date: string;
  notes: string;
}

interface JobListProps {
  token: string;
  isAdmin?: boolean;
}

const JobList: React.FC<JobListProps> = ({ token, isAdmin }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [allJobs, setAllJobs] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    company: '',
    role: '',
    status: '',
    applied_date: '',
    notes: '',
  });
  const [addError, setAddError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: '',
    company: '',
    role: '',
    status: '',
    applied_date: '',
    notes: '',
  });
  const [editError, setEditError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      let url = allJobs && isAdmin ? `/api/jobs/all?sort=${sort}` : `/api/jobs?sort=${sort}`;
      if (status) url += `&status=${status}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setJobs(data);
    };
    fetchJobs();
  }, [token, status, sort, allJobs, isAdmin]);

  // BroadcastChannel and visibilitychange event handling
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

  // Add Job Handlers
  const handleAddOpen = () => {
    setAddForm({ company: '', role: '', status: '', applied_date: '', notes: '' });
    setAddError('');
    setAddOpen(true);
  };
  const handleAddClose = () => setAddOpen(false);
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    // Basic validation
    if (!addForm.company || !addForm.role || !addForm.status || !addForm.applied_date) {
      setAddError('All fields except notes are required.');
      return;
    }
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) {
        const data = await res.json();
        setAddError(data.error || 'Failed to add job');
        return;
      }
      const newJob = await res.json();
      setJobs(jobs => [...jobs, newJob]);
      setAddOpen(false);
    } catch {
      setAddError('Network error');
    }
  };

  // Edit Job Handlers
  const handleEditOpen = (job: Job) => {
    setEditForm({ ...job });
    setEditError('');
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.company || !editForm.role || !editForm.status || !editForm.applied_date) {
      setEditError('All fields except notes are required.');
      return;
    }
    try {
      const res = await fetch(`/api/jobs/${editForm._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.error || 'Failed to update job');
        return;
      }
      const updatedJob = await res.json();
      setJobs(jobs => jobs.map(j => j._id === updatedJob._id ? updatedJob : j));
      setEditOpen(false);
    } catch {
      setEditError('Network error');
    }
  };

  // Delete Job Handler
  const handleDelete = async (_id: string) => {
    setDeletingId(_id);
    try {
      const res = await fetch(`/api/jobs/${_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setDeletingId(null);
        return;
      }
      setJobs(jobs => jobs.filter(j => j._id !== _id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box mt={4}>
      {isAdmin ? (
        <Box mb={3}>
          <Button
            variant={allJobs ? 'contained' : 'outlined'}
            onClick={() => setAllJobs((v) => !v)}
            sx={{ mr: 2, minWidth: 140, fontWeight: 600 }}
          >
            {allJobs ? 'Show My Jobs' : 'Show All Jobs'}
          </Button>
        </Box>
      ) : (
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          My Applications
        </Typography>
      )}
      <Stack direction="row" spacing={2} mb={3} alignItems="center" flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {statusOptions.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant={sort === 'asc' ? 'contained' : 'outlined'} onClick={() => setSort('asc')} sx={{ minWidth: 120, fontWeight: 600 }}>Sort Asc</Button>
        <Button variant={sort === 'desc' ? 'contained' : 'outlined'} onClick={() => setSort('desc')} sx={{ minWidth: 120, fontWeight: 600 }}>Sort Desc</Button>
        <Button variant="contained" color="primary" onClick={handleAddOpen} sx={{ minWidth: 120, fontWeight: 600 }}>Add Job</Button>
      </Stack>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table size="small" aria-label="job table">
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map(job => (
              <TableRow key={job._id}>
                <TableCell>
                  <Button variant="text" onClick={() => { setDetailsJob(job); setDetailsOpen(true); }}>
                    {job.company}
                  </Button>
                </TableCell>
                <TableCell>{job.role}</TableCell>
                <TableCell>
                  <Chip label={job.status} color="primary" size="small" />
                </TableCell>
                <TableCell>{new Date(job.applied_date).toLocaleDateString()}</TableCell>
                <TableCell>{job.notes}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit" color="primary" onClick={() => handleEditOpen(job)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" color="error" onClick={() => handleDelete(job._id)} disabled={deletingId === job._id}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add Job Dialog */}
      <Dialog open={addOpen} onClose={handleAddClose}>
        <DialogTitle>Add Job</DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent>
            <TextField
              label="Company"
              name="company"
              value={addForm.company}
              onChange={handleAddChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Role"
              name="role"
              value={addForm.role}
              onChange={handleAddChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={addForm.status}
                label="Status"
                onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
              >
                {statusOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Applied Date"
              name="applied_date"
              type="date"
              value={addForm.applied_date}
              onChange={handleAddChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Notes"
              name="notes"
              value={addForm.notes}
              onChange={handleAddChange}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
            />
            {addError && <Box color="error.main" mt={1}>{addError}</Box>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddClose}>Cancel</Button>
            <Button type="submit" variant="contained">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Edit Job Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Job</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <TextField
              label="Company"
              name="company"
              value={editForm.company}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Role"
              name="role"
              value={editForm.role}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={editForm.status}
                label="Status"
                onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
              >
                {statusOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Applied Date"
              name="applied_date"
              type="date"
              value={editForm.applied_date}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Notes"
              name="notes"
              value={editForm.notes}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
            />
            {editError && <Box color="error.main" mt={1}>{editError}</Box>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Job Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Job Details</DialogTitle>
        <DialogContent>
          {detailsJob && (
            <Box>
              <Typography><b>Company:</b> {detailsJob.company}</Typography>
              <Typography><b>Role:</b> {detailsJob.role}</Typography>
              <Typography><b>Status:</b> {detailsJob.status}</Typography>
              <Typography><b>Applied Date:</b> {detailsJob ? new Date(detailsJob.applied_date).toLocaleDateString() : ''}</Typography>
              <Typography><b>Notes:</b> {detailsJob.notes}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobList;
