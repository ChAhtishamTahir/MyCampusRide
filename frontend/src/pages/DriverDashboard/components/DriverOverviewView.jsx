import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Avatar, Chip,
  CircularProgress, Alert
} from '@mui/material';
import {
  DirectionsBus, LocationOn, AccessTime, Timeline
} from '@mui/icons-material';
import { authService, busService, trackingService, routeService } from '../../../services';

const DriverOverviewView = () => {
  const [user, setUser] = useState(null);
  const [driverBus, setDriverBus] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tripStatus, setTripStatus] = useState('idle'); // idle, on_trip, arrived

  useEffect(() => {
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user data
      const userResponse = await authService.getMe();
      const currentUser = userResponse.data.data || userResponse.data;
      setUser(currentUser);

      // Find the bus assigned to this driver
      const busesResponse = await busService.getBuses({ limit: 100 });
      const buses = busesResponse.data?.data || [];
      const myBus = buses.find(bus => {
        if (bus.driverId) {
          return typeof bus.driverId === 'object' 
            ? bus.driverId._id === currentUser._id 
            : bus.driverId === currentUser._id;
        }
        return false;
      });

      if (myBus) {
        setDriverBus(myBus);
        
        // Load route information if bus has a route
        if (myBus.routeId) {
          try {
            const routeId = typeof myBus.routeId === 'object' ? myBus.routeId._id : myBus.routeId;
            const routeResponse = await routeService.getRoute(routeId);
            setAssignedRoute(routeResponse.data.data || routeResponse.data);
          } catch (routeErr) {
            console.error('Could not load route info:', routeErr);
          }
        }
      }
      
      // Check trip status
      try {
        const tripStatusResponse = await trackingService.getMyTripStatus();
        const tripData = tripStatusResponse.data?.data || tripStatusResponse.data;
        const status = tripData?.status || 'idle';
        setTripStatus(status);
      } catch (err) {
        console.error('Failed to check trip status:', err);
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

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Grid container spacing={3}>
        {/* Driver Info Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'D'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{user?.name || 'Driver'}</Typography>
                  <Typography variant="body2" color="text.secondary">License: {user?.licenseNumber || 'N/A'}</Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary">Email: {user?.email || 'N/A'}</Typography>
              <Typography variant="body2" color="text.secondary">Phone: {user?.phone || 'N/A'}</Typography>
              
              <Box mt={2}>
                <Typography variant="body2">Status: <Chip label={user?.status || 'Unknown'} size="small" /></Typography>
                <Typography variant="body2">Role: <Chip label={user?.role || 'Unknown'} size="small" color="primary" /></Typography>
              </Box>
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
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>My Bus</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {driverBus ? 'Assigned' : 'Not Assigned'}
                  </Typography>
                </Box>
              </Box>
              
              {driverBus ? (
                <>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{driverBus.busNumber}</Typography>
                  <Typography variant="body2" color="text.secondary">{driverBus.model} ({driverBus.year})</Typography>
                  <Typography variant="body2" color="text.secondary">Capacity: {driverBus.capacity} seats</Typography>
                  
                  <Box mt={2}>
                    <Typography variant="body2">Status: <Chip label={driverBus.status || 'Unknown'} size="small" /></Typography>
                    <Typography variant="body2">Route: <Chip label={driverBus.routeId ? 'Assigned' : 'None'} size="small" color="info" /></Typography>
                  </Box>
                </>
              ) : (
                <Alert severity="info">
                  No bus assigned to you yet. Contact admin to assign a bus.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Trip Status Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Timeline />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Trip Status</Typography>
                  <Typography variant="body2" color="text.secondary">Current trip information</Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2">
                  Current Status: <strong>{tripStatus === 'on_trip' ? 'ON TRIP' : tripStatus === 'arrived' ? 'ARRIVED' : 'NOT ON TRIP'}</strong>
                </Typography>
              </Box>
              
              <Chip 
                label={tripStatus === 'on_trip' ? 'On Trip' : tripStatus === 'arrived' ? 'Arrived' : 'Not on Trip'} 
                size="small"
                color={
                  tripStatus === 'on_trip' ? 'warning' :
                  tripStatus === 'arrived' ? 'success' : 'default'
                }
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Location Tracking Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <LocationOn />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Location Tracking</Typography>
                  <Typography variant="body2" color="text.secondary">Real-time location updates</Typography>
                </Box>
              </Box>
              
              <Alert severity="info">
                Location tracking is enabled when you start a trip. The system will update your location automatically during trips.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DriverOverviewView;