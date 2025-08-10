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
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Switch,
  FormControlLabel,
  Avatar,
  TablePagination,
} from '@mui/material';
import { Search, Edit, Delete, Check, Close } from '@mui/icons-material';
import { adminFunctions } from '../../config/firebase';
import { useSnackbar } from 'notistack';

interface User {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  disabled: boolean;
  customClaims?: {
    admin?: boolean;
  };
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const { enqueueSnackbar } = useSnackbar();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const result = await adminFunctions.getUsers();
        setUsers(result.data as User[]);
      } catch (error) {
        console.error('Error fetching users:', error);
        enqueueSnackbar('Failed to load users', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      displayName: user.displayName || '',
      disabled: user.disabled || false,
      customClaims: {
        admin: user.customClaims?.admin || false,
      },
    });
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await adminFunctions.deleteUser({ uid: selectedUser.uid });
      setUsers(users.filter(user => user.uid !== selectedUser.uid));
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting user:', error);
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    try {
      await adminFunctions.updateUser({
        uid: selectedUser.uid,
        ...editForm,
      });

      // Update local state
      setUsers(users.map(user => 
        user.uid === selectedUser.uid 
          ? { ...user, ...editForm, customClaims: { ...user.customClaims, ...editForm.customClaims } } 
          : user
      ));

      enqueueSnackbar('User updated successfully', { variant: 'success' });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      enqueueSnackbar('Failed to update user', { variant: 'error' });
    }
  };

  const filteredUsers = users.filter(user => 
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedUsers = filteredUsers.slice(
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
          placeholder="Search users..."
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
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Last Sign In</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.uid} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar 
                        src={user.photoURL || ''} 
                        alt={user.displayName || 'User'}
                        sx={{ width: 32, height: 32 }}
                      />
                      {user.displayName || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {user.emailVerified && (
                        <Tooltip title="Email verified">
                          <Check color="primary" fontSize="small" />
                        </Tooltip>
                      )}
                      {user.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {user.disabled ? (
                        <Typography color="error">Disabled</Typography>
                      ) : (
                        <Typography color="success.main">Active</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {user.customClaims?.admin ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell>
                    {user.metadata.creationTime 
                      ? new Date(user.metadata.creationTime).toLocaleString() 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {user.metadata.lastSignInTime 
                      ? new Date(user.metadata.lastSignInTime).toLocaleString() 
                      : 'Never'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit user">
                      <IconButton onClick={() => handleEditClick(user)} size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete user">
                      <IconButton 
                        onClick={() => handleDeleteClick(user)} 
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
                    No users found
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
        count={filteredUsers.length}
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
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user {selectedUser?.email}? This action cannot be undone.
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

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <TextField
              label="Display Name"
              fullWidth
              margin="normal"
              value={editForm.displayName || ''}
              onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!editForm.disabled}
                  onChange={(e) => setEditForm({...editForm, disabled: !e.target.checked})}
                  color="primary"
                />
              }
              label={editForm.disabled ? "Account Disabled" : "Account Enabled"}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.customClaims?.admin || false}
                  onChange={(e) => setEditForm({
                    ...editForm, 
                    customClaims: {
                      ...editForm.customClaims,
                      admin: e.target.checked
                    }
                  })}
                  color="primary"
                />
              }
              label="Admin User"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersTab;
