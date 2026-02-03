import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Button,
  Chip, CircularProgress, Alert, Avatar, List, ListItem, ListItemText,
  ListItemAvatar, Divider
} from '@mui/material';
import { LocationOn, DirectionsBus, AccessTime, Map } from '@mui/icons-material';
import { trackingService, busService } from '../../../services';

const DriverTrackingView = () => {
  const [locationData, setLocationData] = useState(null);
  const [busInfo, setBusInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrackingData();
  }, []);

  const loadTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current driver's bus location data
      const busResponse = await busService.getDriverBuses();
      const buses = busResponse.data?.data || busResponse.data || [];
      if (buses && buses.length > 0) {
        const driverBus = buses[0]; // Assuming driver has one bus assigned
        setBusInfo(driverBus);

        // Get tracking data for the bus
        try {
          const trackingResponse = await trackingService.getBusLocation(driverBus._id);
          setLocationData(trackingResponse.data?.data || trackingResponse.data);
        } catch (err) {
          // If no tracking data available, set default values
          setLocationData({
            latitude: 0,
            longitude: 0,
            lastUpdated: new Date().toISOString(),
            status: 'offline'
          });
        }
      }
    } catch (err) {
      console.error('Error loading tracking data:', err);
      setError('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    try {
      setLoading(true);
      
      if (busInfo) {
        const trackingResponse = await trackingService.getBusLocation(busInfo._id);
        setLocationData(trackingResponse.data?.data || trackingResponse.data);
      }
    } catch (err) {
      console.error('Error refreshing location:', err);
      setError('Failed to refresh location');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Bus Tracking
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AccessTime />}
                  onClick={refreshLocation}
                  disabled={loading}
                >
                  Refresh Location
                </Button>
              </Box>

              {busInfo && (
                <Grid container spacing={3} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Current Bus
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <DirectionsBus sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6">{busInfo.busNumber || busInfo.number}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Capacity: {busInfo.currentCapacity || 0}/{busInfo.maxCapacity || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Status
                        </Typography>
                        <Chip 
                          label={locationData?.status || 'Offline'} 
                          color={locationData?.status === 'active' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                        <Typography variant="body2" mt={1}>
                          Last Updated: {locationData?.lastUpdated ? 
                            new Date(locationData.lastUpdated).toLocaleString() : 
                            'Never'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Current Location
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                              <LocationOn />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={`Lat: ${locationData?.latitude?.toFixed(6) || 'N/A'}`}
                            secondary="Latitude"
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                              <LocationOn />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={`Lng: ${locationData?.longitude?.toFixed(6) || 'N/A'}`}
                            secondary="Longitude"
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'info.light', color: 'info.main' }}>
                              <Map />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={locationData?.address || 'Address not available'}
                            secondary="Full Address"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Route Information
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                              <DirectionsBus />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={busInfo?.routeName || 'No route assigned'}
                            secondary="Current Route"
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main' }}>
                              <AccessTime />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={busInfo?.startTime || 'N/A'}
                            secondary="Start Time"
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'error.light', color: 'error.main' }}>
                              <AccessTime />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={busInfo?.endTime || 'N/A'}
                            secondary="End Time"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box mt={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  <Map sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  Real-time bus tracking system
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DriverTrackingView;