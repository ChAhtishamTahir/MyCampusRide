import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, IconButton,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar, Alert as MuiAlert
} from '@mui/material';
import {
  People, CheckCircle, Cancel, Add, Edit, Delete, Visibility
} from '@mui/icons-material';
import { userService, busService } from '../../../services';

const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState(''); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, pendingResponse, busesResponse] = await Promise.all([
        userService.getUsers({ limit: 100 }),
        userService.getPendingDrivers(),
        busService.getBuses({ limit: 100 })
      ]);
      
      setUsers((usersResponse.data && usersResponse.data.data) || []);
      setPendingDrivers((pendingResponse.data && pendingResponse.data.data) || []);
      setBuses((busesResponse.data && busesResponse.data.data) || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnack('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnack = (message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  };

  const handleApproveDriver = async (driverId) => {
    try {
      await userService.approveDriver(driverId);
      showSnack('Driver approved');
      setPendingDrivers(prev => prev.filter(d => d._id !== driverId));
      loadData(); // Reload data
    } catch (error) {
      console.error('Error approving driver:', error);
      showSnack('Failed to approve driver', 'error');
    }
  };

  const handleRejectDriver = async (driverId) => {
    try {
      await userService.rejectDriver(driverId, 'Rejected by admin');
      showSnack('Driver rejected');
      setPendingDrivers(prev => prev.filter(d => d._id !== driverId));
      loadData(); // Reload data
    } catch (error) {
      console.error('Error rejecting driver:', error);
      showSnack('Failed to reject driver', 'error');
    }
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setFormData({ role: 'student', password: '' });
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const openEditDialog = (user) => {
    setDialogMode('edit');
    setSelectedUser(user);
    
    // Create form data with user info
    const userData = { ...user };
    
    // Handle the case where driverId might be an object or string
    if (user.role === 'driver') {
      // Find the bus assigned to this driver
      const driverBus = buses.find(bus => {
        if (bus.driverId) {
          return typeof bus.driverId === 'object' 
            ? bus.driverId._id === user._id 
            : bus.driverId === user._id;
        }
        return false;
      });
      
      // Add the bus assignment to the form data
      userData.assignedBusId = driverBus ? driverBus._id : '';
    }
    
    setFormData(userData);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setDialogMode('');
    setSelectedUser(null);
    setFormData({});
  };

  const validateStudentId = (id) => {
    if (!id) return true; // Allow empty for edit mode if not changing
    const pattern = /^(FA|SP)[0-9]{2}-(BCS|BBA|BSE)-[0-9]{3}$/;
    return pattern.test(id);
  };

  const handleSubmit = async () => {
    // Validate Student ID if role is student and in add mode or if studentId is provided
    if (formData.role === 'student') {
      if (dialogMode === 'add' || formData.studentId) {
        if (!formData.studentId) {
          showSnack('Student ID is required for students', 'error');
          return;
        }
        
        if (!validateStudentId(formData.studentId)) {
          showSnack('Student ID must follow the format: FA/SP + 2 digits - BCS/BBA/BSE - 3 digits (e.g., FA23-BCS-123)', 'error');
          return;
        }
      }
    }

    try {
      if (dialogMode === 'add') {
        await userService.createUser(formData);
        showSnack('User created');
      } else if (dialogMode === 'edit') {
        // Prepare update data (exclude fields that shouldn't be updated)
        const updateData = { ...formData };
        delete updateData.assignedBusId; // Don't send this to the user update endpoint
        
        await userService.updateUser(selectedUser._id, updateData);
        
        // If the user is a driver and assignedBusId changed, update the bus assignment
        if (selectedUser.role === 'driver' && formData.assignedBusId !== undefined) {
          // First, unassign the driver from any bus they were previously assigned to
          const oldAssignedBus = buses.find(bus => {
            if (bus.driverId) {
              return typeof bus.driverId === 'object' 
                ? bus.driverId._id === selectedUser._id 
                : bus.driverId === selectedUser._id;
            }
            return false;
          });
          
          if (oldAssignedBus && oldAssignedBus._id !== formData.assignedBusId) {
            // Unassign the driver from the old bus
            await busService.updateBus(oldAssignedBus._id, { driverId: null });
          }
          
          // If a new bus is assigned, update it
          if (formData.assignedBusId) {
            await busService.updateBus(formData.assignedBusId, { driverId: selectedUser._id });
          }
        }
        
        showSnack('User updated');
      }
      
      closeDialog();
      loadData(); // Reload data
    } catch (error) {
      console.error('Error saving user:', error);
      showSnack('Operation failed', 'error');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        showSnack('User deleted');
        loadData(); // Reload data
      } catch (error) {
        console.error('Error deleting user:', error);
        showSnack('Failed to delete user', 'error');
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Grid container spacing={3}>
        {/* Pending Approvals */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Pending Driver Approvals</Typography>
              {pendingDrivers.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <People sx={{ fontSize: 64, color: 'grey.400' }} />
                  <Typography>No pending approvals</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>License</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingDrivers.map(driver => (
                        <TableRow key={driver._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar>{driver.name?.charAt(0)}</Avatar>
                              <Typography>{driver.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{driver.email}</TableCell>
                          <TableCell>{driver.licenseNumber}</TableCell>
                          <TableCell>{driver.phone}</TableCell>
                          <TableCell>
                            <Button 
                              startIcon={<CheckCircle />} 
                              color="success" 
                              onClick={() => handleApproveDriver(driver._id)}
                              size="small"
                            >
                              Approve
                            </Button>
                            <Button 
                              startIcon={<Cancel />} 
                              color="error" 
                              onClick={() => handleRejectDriver(driver._id)}
                              size="small"
                              sx={{ ml: 1 }}
                            >
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* All Users */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">All Users ({users.length})</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
                  Add User
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Related Info</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map(user => {
                      // Find if this user (if driver) is assigned to a bus
                      let relatedInfo = '';
                      if (user.role === 'driver') {
                        const driverBus = buses.find(bus => {
                          if (bus.driverId) {
                            return typeof bus.driverId === 'object' 
                              ? bus.driverId._id === user._id 
                              : bus.driverId === user._id;
                          }
                          return false;
                        });
                        relatedInfo = driverBus ? `Bus: ${driverBus.busNumber}` : 'No bus assigned';
                      } else if (user.role === 'student') {
                        // For students, show assigned route and bus if applicable
                        if (user.assignedRoute) {
                          const routeName = typeof user.assignedRoute === 'object' 
                            ? user.assignedRoute.routeName 
                            : user.assignedRoute;
                          relatedInfo = `Route: ${routeName}`;
                          
                          if (user.assignedBus) {
                            const busNumber = typeof user.assignedBus === 'object' 
                              ? user.assignedBus.busNumber 
                              : user.assignedBus;
                            relatedInfo += `, Bus: ${busNumber}`;
                          }
                        } else {
                          relatedInfo = 'No route/bus assigned';
                        }
                      }
                      
                      return (
                        <TableRow key={user._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar>{user.name?.charAt(0)}</Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 600 }}>{user.name}</Typography>
                                <Typography variant="caption">ID: {user.studentId || user.licenseNumber || 'N/A'}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={user.role} size="small" />
                          </TableCell>
                          <TableCell><Chip label={user.status} size="small" /></TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {relatedInfo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => openEditDialog(user)}>
                              <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteUser(user._id)} color="error">
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add User' : 'Edit User'}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="grid" gap={2} mt={1}>
            <TextField 
              label="Name" 
              value={formData.name || ''} 
              onChange={(e) => handleFormChange('name', e.target.value)} 
              required
            />
            <TextField 
              label="Email" 
              value={formData.email || ''} 
              onChange={(e) => handleFormChange('email', e.target.value)} 
              required
              disabled={dialogMode === 'edit'}
            />
            <TextField 
              label="Phone" 
              value={formData.phone || ''} 
              onChange={(e) => handleFormChange('phone', e.target.value)} 
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select 
                value={formData.role || 'student'} 
                label="Role" 
                onChange={(e) => handleFormChange('role', e.target.value)}
                disabled={dialogMode === 'edit'}
              >
                <MenuItem value="admin">admin</MenuItem>
                <MenuItem value="driver">driver</MenuItem>
                <MenuItem value="student">student</MenuItem>
              </Select>
            </FormControl>
            
            {formData.role === 'student' && (
              <TextField 
                label="Student ID" 
                value={formData.studentId || ''} 
                onChange={(e) => handleFormChange('studentId', e.target.value)} 
                required={dialogMode === 'add'}  // Required only when adding new user
                disabled={dialogMode === 'edit'}  // Disabled when editing to prevent changes
                helperText={dialogMode === 'edit' ? 'Student ID cannot be changed' : 'Format: FA/SP + 2 digits - BCS/BBA/BSE - 3 digits (e.g., FA23-BCS-123)'}
              />
            )}
            
            {formData.role === 'driver' && (
              <TextField 
                label="License Number" 
                value={formData.licenseNumber || ''} 
                onChange={(e) => handleFormChange('licenseNumber', e.target.value)} 
                disabled={dialogMode === 'edit'}
                helperText={dialogMode === 'edit' ? 'License Number cannot be changed' : ''}
              />
            )}
            
            {formData.role === 'driver' && dialogMode === 'edit' && (
              <FormControl fullWidth>
                <InputLabel>Assigned Bus</InputLabel>
                <Select 
                  value={formData.assignedBusId || ''} 
                  label="Assigned Bus" 
                  onChange={(e) => handleFormChange('assignedBusId', e.target.value)}
                >
                  <MenuItem value="">No Bus Assigned</MenuItem>
                  {buses.filter(bus => !bus.driverId || 
                      (typeof bus.driverId === 'object' ? bus.driverId._id : bus.driverId) === selectedUser?._id
                  ).map(bus => (
                    <MenuItem key={bus._id} value={bus._id}>
                      {bus.busNumber} ({bus.model})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {dialogMode === 'add' && (
              <TextField 
                label="Password" 
                type="password" 
                value={formData.password || ''} 
                onChange={(e) => handleFormChange('password', e.target.value)} 
                required
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snack.open} 
        autoHideDuration={4000} 
        onClose={() => setSnack(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert 
          onClose={() => setSnack(prev => ({ ...prev, open: false }))} 
          severity={snack.severity} 
          sx={{ width: '100%' }}
        >
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default UsersView;