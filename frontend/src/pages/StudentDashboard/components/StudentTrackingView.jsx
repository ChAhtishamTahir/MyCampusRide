import React, { useState, useEffect } from 'react';
import {
  Container, Card, CardContent, Typography, Box, Alert, Grid,
  LinearProgress, Chip
} from '@mui/material';
import {
  LocationOn, Speed, Timeline, Flag
} from '@mui/icons-material';
import { authService, trackingService, busService } from '../../../services';

const StudentTrackingView = () => {
  const [user, setUser] = useState(null);
  const [assignedBus, setAssignedBus] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [tripStatus, setTripStatus] = useState('idle'); // idle, on_trip, arrived
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrackingData();
    
    // Poll for bus location updates every 30 seconds if on a trip
    const locationInterval = setInterval(() => {
      if (assignedBus && tripStatus === 'on_trip') {
        loadBusLocation();
      }
    }, 30000);

    return () => clearInterval(locationInterval);
  }, [assignedBus, tripStatus]);

  const loadTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user data
      const userResponse = await authService.getMe();
      const currentUser = userResponse.data.data;
      setUser(currentUser);

      // Load assigned bus
      if (currentUser?.assignedBus) {
        if (typeof currentUser.assignedBus === 'object' && currentUser.assignedBus._id) {
          setAssignedBus(currentUser.assignedBus);
          
          // Check trip status
          checkTripStatus();
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  const checkTripStatus = async () => {
    try {
      const tripStatusResponse = await trackingService.getMyTripStatus();
      const status = tripStatusResponse.data?.data?.status || 'idle';
      setTripStatus(status);
      
      if (status === 'on_trip') {
        loadBusLocation();
      }
    } catch (err) {
      console.error('Failed to check trip status:', err);
      setTripStatus('idle');
    }
  };

  const loadBusLocation = async () => {
    try {
      if (assignedBus?._id) {
        const locationResponse = await trackingService.getBusLocation(assignedBus._id);
        setBusLocation(locationResponse.data?.data || null);
      }
    } catch (err) {
      console.error('Failed to load bus location:', err);
      setBusLocation(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading tracking information...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ p: 4 }}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Bus Tracking</Typography>
              <Typography variant="body2" color="text.secondary">
                Track your assigned bus in real-time
              </Typography>
            </Box>
          </Box>

          {!assignedBus ? (
            <Alert severity="info">
              You don't have a bus assigned yet. Please contact the admin to assign a bus based on your fee status.
            </Alert>
          ) : (
            <>
              <Box mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Bus: {assignedBus.busNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {assignedBus.model} ({assignedBus.year}) - Capacity: {assignedBus.capacity} seats
                </Typography>
              </Box>

              {/* Trip Status */}
              <Box mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Trip Status
                </Typography>
                
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Chip 
                    label={
                      tripStatus === 'on_trip' ? 'On Trip' : 
                      tripStatus === 'arrived' ? 'Arrived' : 'Not on Trip'
                    }
                    color={
                      tripStatus === 'on_trip' ? 'warning' : 
                      tripStatus === 'arrived' ? 'success' : 'default'
                    }
                    variant="outlined"
                  />
                  
                  {tripStatus === 'on_trip' && (
                    <Box flex={1}>
                      <LinearProgress color="warning" />
                    </Box>
                  )}
                </Box>
                
                {tripStatus === 'idle' && (
                  <Alert severity="info">
                    Your bus is not currently on a trip. It will appear here when the bus starts its journey.
                  </Alert>
                )}
                
                {tripStatus === 'on_trip' && (
                  <Alert severity="info">
                    Your bus is currently on a trip. Real-time location updates will appear below.
                  </Alert>
                )}
                
                {tripStatus === 'arrived' && (
                  <Alert severity="success">
                    Your bus has arrived at the destination.
                  </Alert>
                )}
              </Box>

              {/* Location Information */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Current Location
                </Typography>
                
                {busLocation ? (
                  <Box p={2} bgcolor="grey.50" borderRadius={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Latitude:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {busLocation.latitude ? busLocation.latitude.toFixed(6) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Longitude:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {busLocation.longitude ? busLocation.longitude.toFixed(6) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Speed:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {busLocation.speed ? `${busLocation.speed} km/h` : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {busLocation.timestamp ? new Date(busLocation.timestamp).toLocaleString() : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Alert severity="info">
                    Location data is not available at the moment. It will update when the bus is on a trip.
                  </Alert>
                )}
              </Box>

              {/* Tracking Tips */}
              <Box mt={3}>
                <Alert severity="info" icon={<Flag />}>
                  <Typography variant="body2">
                    <strong>Tips:</strong> The bus location updates every 30 seconds when on a trip. 
                    Make sure to arrive at your designated pickup point on time.
                  </Typography>
                </Alert>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentTrackingView;