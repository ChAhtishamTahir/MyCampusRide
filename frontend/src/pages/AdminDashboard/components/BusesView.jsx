import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, IconButton,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Alert as MuiAlert
} from '@mui/material';
import {
  DirectionsBus, Add, Edit, Delete
} from '@mui/icons-material';
import { busService, userService, routeService } from '../../../services';

const BusesView = () => {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState(''); // 'add' or 'edit'
  const [selectedBus, setSelectedBus] = useState(null);
  const [formData, setFormData] = useState({});
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [busesResponse, usersResponse, routesResponse] = await Promise.all([
        busService.getBuses({ limit: 100 }),
        userService.getUsers({ limit: 100 }),
        routeService.getRoutes({ limit: 100 })
      ]);
      
      setBuses((busesResponse.data && busesResponse.data.data) || []);
      
      // Filter drivers from users
      const driversList = (usersResponse.data && usersResponse.data.data) || [];
      setDrivers(driversList.filter(user => user.role === 'driver'));
      
      setRoutes((routesResponse.data && routesResponse.data.data) || []);
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

  const openAddDialog = () => {
    setDialogMode('add');
    setFormData({ capacity: 30, status: 'active' }); // Default capacity and status
    setSelectedBus(null);
    setOpenDialog(true);
  };

  const openEditDialog = (bus) => {
    setDialogMode('edit');
    setSelectedBus(bus);
    
    // Prepare form data with proper handling of driverId and routeId
    const busData = { ...bus };
    
    // Ensure driverId and routeId are properly formatted for the form
    if (bus.driverId) {
      busData.driverId = typeof bus.driverId === 'object' ? bus.driverId._id : bus.driverId;
    } else {
      busData.driverId = '';
    }
    
    if (bus.routeId) {
      busData.routeId = typeof bus.routeId === 'object' ? bus.routeId._id : bus.routeId;
    } else {
      busData.routeId = '';
    }
    
    setFormData(busData);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setDialogMode('');
    setSelectedBus(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        await busService.createBus(formData);
        showSnack('Bus created');
      } else if (dialogMode === 'edit') {
        // Prepare update data
        const updateData = { ...formData };
        
        // Make sure driverId and routeId are properly set
        if (updateData.driverId === '') {
          updateData.driverId = null;
        }
        if (updateData.routeId === '') {
          updateData.routeId = null;
        }
        
        // Ensure status is properly formatted
        if (!updateData.status) {
          updateData.status = 'inactive';
        }
        
        await busService.updateBus(selectedBus._id, updateData);
        showSnack('Bus updated');
      }
      
      closeDialog();
      loadData(); // Reload data
    } catch (error) {
      console.error('Error saving bus:', error);
      const errorMessage = error.response?.data?.message || 'Operation failed';
      showSnack(errorMessage, 'error');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteBus = async (busId) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await busService.deleteBus(busId);
        showSnack('Bus deleted');
        loadData(); // Reload data
      } catch (error) {
        console.error('Error deleting bus:', error);
        showSnack('Failed to delete bus', 'error');
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Buses ({buses.length})</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
                Add Bus
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bus Number</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buses.map(bus => {
                    // Properly format driver and route names for display
                    let driverName = 'No driver';
                    if (bus.driverId) {
                      if (typeof bus.driverId === 'object') {
                        driverName = bus.driverId.name;
                      } else {
                        // If driverId is a string, find the driver from our drivers list
                        const driver = drivers.find(d => d._id === bus.driverId);
                        driverName = driver ? driver.name : 'Unknown Driver';
                      }
                    }
                    
                    let routeName = 'No route';
                    if (bus.routeId) {
                      if (typeof bus.routeId === 'object') {
                        routeName = bus.routeId.routeName;
                      } else {
                        // If routeId is a string, find the route from our routes list
                        const route = routes.find(r => r._id === bus.routeId);
                        routeName = route ? route.routeName : 'Unknown Route';
                      }
                    }
                      
                    return (
                      <TableRow key={bus._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <DirectionsBus color="primary" />
                            <Typography sx={{ fontWeight: 600 }}>{bus.busNumber}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {driverName}
                        </TableCell>
                        <TableCell>
                          {routeName}
                        </TableCell>
                        <TableCell>{bus.model || 'N/A'}</TableCell>
                        <TableCell>{bus.year || 'N/A'}</TableCell>
                        <TableCell>{bus.capacity || 'N/A'}</TableCell>
                        <TableCell><Chip label={bus.status || 'inactive'} size="small" /></TableCell>
                        <TableCell>
                          <IconButton onClick={() => openEditDialog(bus)}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteBus(bus._id)} color="error">
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

      {/* Add/Edit Bus Dialog */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add Bus' : 'Edit Bus'}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="grid" gap={2} mt={1}>
            <TextField 
              label="Bus Number" 
              value={formData.busNumber || ''} 
              onChange={(e) => handleFormChange('busNumber', e.target.value)} 
              required
            />
            <TextField 
              label="Model" 
              value={formData.model || ''} 
              onChange={(e) => handleFormChange('model', e.target.value)} 
            />
            <TextField 
              label="Year" 
              type="number" 
              value={formData.year || ''} 
              onChange={(e) => handleFormChange('year', Number(e.target.value))} 
            />
            <TextField 
              label="Capacity" 
              type="number" 
              value={formData.capacity || ''} 
              onChange={(e) => handleFormChange('capacity', Number(e.target.value))} 
              required
            />
            <FormControl fullWidth>
              <InputLabel>Driver</InputLabel>
              <Select 
                value={formData.driverId || ''} 
                label="Driver" 
                onChange={(e) => handleFormChange('driverId', e.target.value)}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {drivers.map(driver => (
                  <MenuItem key={driver._id} value={driver._id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Route</InputLabel>
              <Select 
                value={formData.routeId || ''} 
                label="Route" 
                onChange={(e) => handleFormChange('routeId', e.target.value)}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {routes.map(route => (
                  <MenuItem key={route._id} value={route._id}>
                    {route.routeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select 
                value={formData.status || 'active'} 
                label="Status" 
                onChange={(e) => handleFormChange('status', e.target.value)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
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

export default BusesView;