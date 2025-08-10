import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  TablePagination,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Delete, Event, Person, AccessTime, Check, Close } from '@mui/icons-material';
import { adminFunctions } from '../../config/firebase';
import { useSnackbar } from 'notistack';

export interface Session {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  teacher: {
    _id: string;
    name: string;
    email: string;
    photoURL?: string;
  };
  student: {
    _id: string;
    name: string;
    email: string;
    photoURL?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const SessionsTab: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const result = await adminFunctions.getSessions();
        setSessions(result.data as Session[]);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        enqueueSnackbar('Failed to load sessions', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [enqueueSnackbar]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (session: Session) => {
    setSelectedSession(session);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSession) return;

    try {
      await adminFunctions.deleteSession({ sessionId: selectedSession._id });
      setSessions(sessions.filter(session => session._id !== selectedSession._id));
      enqueueSnackbar('Session deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting session:', error);
      enqueueSnackbar('Failed to delete session', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedSession(null);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Chip label="Scheduled" color="primary" size="small" />;
      case 'in-progress':
        return <Chip label="In Progress" color="secondary" size="small" />;
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'cancelled':
        return <Chip label="Cancelled" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'Ongoing';
    
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(durationMs / 60000);
    
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSessions = filteredSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search sessions..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSessions.length > 0 ? (
              paginatedSessions.map((session) => (
                <TableRow key={session._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {session.title}
                    </Typography>
                    {session.description && (
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {session.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar 
                        src={session.teacher.photoURL} 
                        alt={session.teacher.name}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                      <Typography variant="body2">
                        {session.teacher.name} (Teacher)
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        src={session.student.photoURL} 
                        alt={session.student.name}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                      <Typography variant="body2">
                        {session.student.name} (Student)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Event fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(session.startTime)}
                      </Typography>
                    </Box>
                    {session.endTime && (
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(session.endTime)}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDuration(session.startTime, session.endTime)}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(session.status)}
                  </TableCell>
                  <TableCell>
                    {formatDate(session.createdAt)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete session">
                      <IconButton 
                        onClick={() => handleDeleteClick(session)} 
                        size="small"
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No sessions found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredSessions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the session "{selectedSession?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionsTab;
