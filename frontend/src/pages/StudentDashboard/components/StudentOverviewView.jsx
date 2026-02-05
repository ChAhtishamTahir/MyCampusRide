import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Avatar, Chip,
  CircularProgress, Alert, Tab, Tabs
} from '@mui/material';
import {
  DirectionsBus, Route, AccessTime, Receipt, Timeline
} from '@mui/icons-material';
import { authService, busService, routeService } from '../../../services';
import VirtualTransportCard from './VirtualTransportCard';

const StudentOverviewView = () => {
  const [user, setUser] = useState(null);
  const [assignedBus, setAssignedBus] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user data
      const userResponse = await authService.getMe();
      const currentUser = userResponse.data.data || userResponse.data;
      setUser(currentUser);

      // Load assigned bus and route data from the populated user data
      if (currentUser?.assignedBus) {
        if (typeof currentUser.assignedBus === 'object' && currentUser.assignedBus._id) {
          setAssignedBus(currentUser.assignedBus);
          
          // Set route from populated bus data
          if (currentUser.assignedBus.routeId) {
            if (typeof currentUser.assignedBus.routeId === 'object') {
              setAssignedRoute(currentUser.assignedBus.routeId);
            } else {
              try {
                const routeResponse = await routeService.getRoute(currentUser.assignedBus.routeId);
                setAssignedRoute(routeResponse.data.data || routeResponse.data);
              } catch (routeErr) {
                console.error('Failed to load route info:', routeErr);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Calculate fee details based on user data
  const monthlyFee = 500;
  const feeStatus = user?.feeStatus || 'pending';
  let paidAmount = 0;
  let dueAmount = monthlyFee;
  
  if (feeStatus === 'paid') {
    paidAmount = monthlyFee;
    dueAmount = 0;
  } else if (feeStatus === 'partially_paid') {
    paidAmount = monthlyFee * 0.5;
    dueAmount = monthlyFee * 0.5;
  }

  const feeInfo = {
    monthlyFee,
    paidAmount,
    dueAmount,
    nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Dashboard Overview" />
        <Tab label="Transport Card" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Student Info Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{user?.name || 'Student'}</Typography>
                    <Typography variant="body2" color="text.secondary">ID: {user?.studentId || 'N/A'}</Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Receipt fontSize="small" color="action" />
                  <Typography variant="body2">Fee Status:</Typography>
                  <Chip 
                    label={feeStatus === 'paid' ? 'Paid' : feeStatus === 'partially_paid' ? 'Partially Paid' : 'Pending'} 
                    size="small"
                    color={
                      feeStatus === 'paid' ? 'success' :
                      feeStatus === 'partially_paid' ? 'warning' : 'default'
                    }
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">Email: {user?.email || 'N/A'}</Typography>
                <Typography variant="body2" color="text.secondary">Phone: {user?.phone || 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Bus Assignment Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <DirectionsBus />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Bus Assignment</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {assignedBus ? 'Assigned' : 'Not Assigned'}
                    </Typography>
                  </Box>
                </Box>
                
                {assignedBus ? (
                  <>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{assignedBus.busNumber}</Typography>
                    <Typography variant="body2" color="text.secondary">{assignedBus.model} ({assignedBus.year})</Typography>
                    <Typography variant="body2" color="text.secondary">Capacity: {assignedBus.capacity} seats</Typography>
                    
                    {assignedRoute && (
                      <>
                        <Box mt={2}>
                          <Typography variant="subtitle2" color="text.primary">Assigned Route</Typography>
                          <Typography variant="body2">{assignedRoute.routeName}</Typography>
                          <Typography variant="body2" color="text.secondary">{assignedRoute.description}</Typography>
                        </Box>
                        
                        {assignedRoute.departureTime && (
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="body2">Departure: {assignedRoute.departureTime}</Typography>
                          </Box>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <Alert severity="info">No bus assigned yet. Contact admin to assign a bus based on your fee status.</Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Fee Summary Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <Receipt />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Fee Summary</Typography>
                    <Typography variant="body2" color="text.secondary">Monthly Transport Fee</Typography>
                  </Box>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Monthly Fee:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>PKR {feeInfo.monthlyFee}</Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Paid Amount:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>PKR {feeInfo.paidAmount}</Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2">Due Amount:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: feeInfo.dueAmount > 0 ? 'error.main' : 'success.main' }}>
                    PKR {feeInfo.dueAmount}
                  </Typography>
                </Box>
                
                <Typography variant="body2">Next Due Date: {feeInfo.nextDueDate}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Route Information Card */}
          {assignedRoute && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <Route />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Route Information</Typography>
                      <Typography variant="body2" color="text.secondary">{assignedRoute.routeName}</Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2">Route Number: {assignedRoute.routeNo || 'N/A'}</Typography>
                  <Typography variant="body2">Distance: {assignedRoute.distance} km</Typography>
                  <Typography variant="body2">Estimated Duration: {assignedRoute.estimatedDuration} minutes</Typography>
                  
                  {assignedRoute.stops && assignedRoute.stops.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" color="text.primary">Route Stops</Typography>
                      <Box mt={1}>
                        {assignedRoute.stops.slice(0, 3).map((stop, index) => (
                          <Typography key={index} variant="body2">
                            {index + 1}. {stop.name} - {stop.pickupTime} (Fee: PKR {stop.fee})
                          </Typography>
                        ))}
                        {assignedRoute.stops.length > 3 && (
                          <Typography variant="body2" color="text.secondary">
                            + {assignedRoute.stops.length - 3} more stops...
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Box display="flex" justifyContent="center" py={3}>
          <VirtualTransportCard user={user} assignedBus={assignedBus} assignedRoute={assignedRoute} />
        </Box>
      )}
    </Container>
  );
};

export default StudentOverviewView;