import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar, Alert as MuiAlert
} from '@mui/material';
import {
  Payment, Add
} from '@mui/icons-material';
import { userService, busService, routeService } from '../../../services';

const FeeManagementView = () => {
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeSearchQuery, setFeeSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openFeeStatusDialog, setOpenFeeStatusDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, routesResponse, busesResponse] = await Promise.all([
        userService.getUsers({ limit: 100 }),
        routeService.getRoutes({ limit: 100 }),
        busService.getBuses({ limit: 100 })
      ]);
      
      setUsers((usersResponse.data && usersResponse.data.data) || []);
      setRoutes((routesResponse.data && routesResponse.data.data) || []);
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

  const formatFeeStatus = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'partially_paid': return 'Partially Paid';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const openFeeStatusDialogHandler = (student) => {
    setSelectedStudent(student);
    setFormData({
      feeStatus: student.feeStatus || 'pending',
      assignedRoute: student.assignedRoute?._id || '',
      assignedBus: student.assignedBus?._id || ''
    });
    setOpenFeeStatusDialog(true);
  };

  const closeFeeStatusDialog = () => {
    setOpenFeeStatusDialog(false);
    setSelectedStudent(null);
    setFormData({});
  };

  const handleFeeStatusFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const getBusesForRoute = (routeId) => {
    return buses.filter(bus => bus.routeId?._id === routeId || bus.routeId === routeId);
  };

  const handleFeeStatusSubmit = async () => {
    try {
      const updateData = {
        feeStatus: formData.feeStatus,
        assignedRoute: formData.assignedRoute || null,
        assignedBus: formData.assignedBus || null
      };

      // Validation
      if ((formData.feeStatus === 'paid' || formData.feeStatus === 'partially_paid') && 
          (!formData.assignedRoute || !formData.assignedBus)) {
        showSnack('Please assign both route and bus for paid/partially paid students', 'error');
        return;
      }

      // If fee status is pending, remove route and bus assignments
      if (formData.feeStatus === 'pending') {
        updateData.assignedRoute = null;
        updateData.assignedBus = null;
      }

      await userService.updateUser(selectedStudent._id, updateData);
      showSnack('Student fee status updated successfully');
      closeFeeStatusDialog();
      loadData(); // Reload data
    } catch (error) {
      console.error('Error updating fee status:', error);
      showSnack('Failed to update fee status', 'error');
    }
  };

  const filteredStudents = users
    .filter(u => u.role === 'student')
    .filter(u => !feeSearchQuery || u.studentId?.toLowerCase().includes(feeSearchQuery.toLowerCase()));

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">Fee Management</Typography>
              <TextField
                size="small"
                placeholder="Search by Student ID"
                value={feeSearchQuery}
                onChange={(e) => setFeeSearchQuery(e.target.value)}
                sx={{ minWidth: 300 }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Fee Status</TableCell>
                    <TableCell>Assigned Route</TableCell>
                    <TableCell>Assigned Bus</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map(student => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <div style={{width: 40, height: 40, borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            {student.name?.charAt(0)}
                          </div>
                          <Typography sx={{ fontWeight: 600 }}>{student.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{student.studentId || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>
                        <Chip 
                          label={formatFeeStatus(student.feeStatus)} 
                          size="small"
                          color={
                            student.feeStatus === 'paid' ? 'success' :
                            student.feeStatus === 'partially_paid' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {student.assignedRoute ? (
                          <Typography variant="body2">
                            {typeof student.assignedRoute === 'object' 
                              ? student.assignedRoute.routeName 
                              : routes.find(r => r._id === student.assignedRoute)?.routeName || 'Unknown'}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not Assigned</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.assignedBus ? (
                          <Typography variant="body2">
                            {typeof student.assignedBus === 'object' 
                              ? student.assignedBus.busNumber 
                              : buses.find(b => b._id === student.assignedBus)?.busNumber || 'Unknown'}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not Assigned</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={() => openFeeStatusDialogHandler(student)}
                        >
                          Update Fee
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredStudents.length === 0 && (
              <Box textAlign="center" py={6}>
                <Payment sx={{ fontSize: 64, color: 'grey.400' }} />
                <Typography color="text.secondary">No students found</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Fee Status Dialog */}
      <Dialog open={openFeeStatusDialog} onClose={closeFeeStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Fee Status - {selectedStudent?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="grid" gap={3} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Fee Status</InputLabel>
              <Select 
                value={formData.feeStatus || 'pending'} 
                label="Fee Status" 
                onChange={(e) => handleFeeStatusFormChange('feeStatus', e.target.value)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="partially_paid">Partially Paid</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>

            {(formData.feeStatus === 'paid' || formData.feeStatus === 'partially_paid') && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Assign Route</InputLabel>
                  <Select 
                    value={formData.assignedRoute || ''} 
                    label="Assign Route" 
                    onChange={(e) => handleFeeStatusFormChange('assignedRoute', e.target.value)}
                  >
                    <MenuItem value="">Select Route</MenuItem>
                    {routes.map(route => (
                      <MenuItem key={route._id} value={route._id}>
                        {route.routeName} ({route.routeNo})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Assign Bus</InputLabel>
                  <Select 
                    value={formData.assignedBus || ''} 
                    label="Assign Bus" 
                    onChange={(e) => handleFeeStatusFormChange('assignedBus', e.target.value)}
                    disabled={!formData.assignedRoute}
                  >
                    <MenuItem value="">Select Bus</MenuItem>
                    {formData.assignedRoute && getBusesForRoute(formData.assignedRoute).map(bus => (
                      <MenuItem key={bus._id} value={bus._id}>
                        {bus.busNumber} - {bus.model} ({bus.year})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {formData.assignedRoute && getBusesForRoute(formData.assignedRoute).length === 0 && (
                  <Alert severity="warning">
                    No buses assigned to this route. Please assign a bus to the route first.
                  </Alert>
                )}
              </>
            )}

            {formData.feeStatus === 'pending' && (
              <Alert severity="info">
                Setting fee status to pending will remove any assigned route and bus.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFeeStatusDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleFeeStatusSubmit}>Update</Button>
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

export default FeeManagementView;