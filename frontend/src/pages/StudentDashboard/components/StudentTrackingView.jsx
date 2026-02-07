/**
 * StudentTrackingView Component
 *
 * Real-time bus tracking interface for students showing:
 * - Current trip status (idle, on_trip, arrived)
 * - Bus location coordinates with auto-refresh
 * - Speed and timestamp information
 * - Tracking tips and guidance
 *
 * Features brand styling with color-coded status indicators.
 */

import React, { useState, useEffect } from 'react';
import {
  Container, Card, CardContent, Typography, Box, Alert, Grid,
  LinearProgress, Chip, CircularProgress
} from '@mui/material';
import {
  LocationOn, Speed, Timeline, Flag
} from '@mui/icons-material';
import { authService, trackingService, busService } from '../../../services';
import {
  BRAND_COLORS,
  CARD_STYLES,
  BORDER_RADIUS,
  SHADOWS,
} from '../styles/brandStyles';

const StudentTrackingView = () => {
  const [user, setUser] = useState(null);
  const [assignedBus, setAssignedBus] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [tripStatus, setTripStatus] = useState('idle'); // idle, on_trip, arrived
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load tracking data and setup polling interval
   * Auto-refreshes bus location every 30 seconds during active trips
   */
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

  /**
   * Load user data and assigned bus information
   * Checks trip status if bus is assigned
   */
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

  /**
   * Check current trip status from backend
   * Loads bus location if trip is active
   */
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

  /**
   * Fetch current bus location data
   * Updates latitude, longitude, speed, and timestamp
   */
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

  // Show loading spinner with brand color
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} sx={{ color: BRAND_COLORS.skyBlue }} />
      </Container>
    );
  }

  // Show error message if data loading fails
  if (error) {
    return (
      <Container maxWidth="md" sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: BORDER_RADIUS.md }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ p: 4 }}>
      {/* Tracking Card with brand styling */}
      <Card sx={{
        ...CARD_STYLES.standard,
        border: `1px solid ${BRAND_COLORS.slate300}`,
      }}>
        <CardContent>
          {/* Header with gradient icon */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: BORDER_RADIUS.xl,
              background: BRAND_COLORS.primaryGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(14, 165, 233, 0.3)',
            }}>
              <LocationOn sx={{ fontSize: 32, color: BRAND_COLORS.white }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900 }}>
                Bus Tracking
              </Typography>
              <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
                Track your assigned bus in real-time
              </Typography>
            </Box>
          </Box>

          {!assignedBus ? (
            <Alert
              severity="info"
              sx={{
                borderRadius: BORDER_RADIUS.md,
                bgcolor: 'rgba(14, 165, 233, 0.08)',
                border: `1px solid ${BRAND_COLORS.skyBlue}`,
                color: BRAND_COLORS.slate700,
              }}
            >
              You don't have a bus assigned yet. Please contact the admin to assign a bus based on your fee status.
            </Alert>
          ) : (
            <>
              {/* Bus Information */}
              <Box mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900, mb: 1 }}>
                  Bus: {assignedBus.busNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
                  {assignedBus.model} ({assignedBus.year}) - Capacity: {assignedBus.capacity} seats
                </Typography>
              </Box>

              {/* Trip Status with brand colors */}
              <Box mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900, mb: 1 }}>
                  Trip Status
                </Typography>

                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Chip
                    label={
                      tripStatus === 'on_trip' ? 'On Trip' :
                      tripStatus === 'arrived' ? 'Arrived' : 'Not on Trip'
                    }
                    sx={{
                      bgcolor: tripStatus === 'on_trip' ? BRAND_COLORS.warningOrange :
                               tripStatus === 'arrived' ? BRAND_COLORS.successGreen :
                               BRAND_COLORS.slate400,
                      color: BRAND_COLORS.white,
                      fontWeight: 600,
                      borderRadius: BORDER_RADIUS.md,
                    }}
                  />

                  {tripStatus === 'on_trip' && (
                    <Box flex={1}>
                      <LinearProgress
                        sx={{
                          bgcolor: 'rgba(245, 158, 11, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: BRAND_COLORS.warningOrange,
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>

                {tripStatus === 'idle' && (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: BORDER_RADIUS.md,
                      bgcolor: 'rgba(14, 165, 233, 0.08)',
                      border: `1px solid ${BRAND_COLORS.skyBlue}`,
                      color: BRAND_COLORS.slate700,
                    }}
                  >
                    Your bus is not currently on a trip. It will appear here when the bus starts its journey.
                  </Alert>
                )}

                {tripStatus === 'on_trip' && (
                  <Alert
                    severity="warning"
                    sx={{
                      borderRadius: BORDER_RADIUS.md,
                      bgcolor: 'rgba(245, 158, 11, 0.08)',
                      border: `1px solid ${BRAND_COLORS.warningOrange}`,
                      color: BRAND_COLORS.slate700,
                    }}
                  >
                    Your bus is currently on a trip. Real-time location updates will appear below.
                  </Alert>
                )}

                {tripStatus === 'arrived' && (
                  <Alert
                    severity="success"
                    sx={{
                      borderRadius: BORDER_RADIUS.md,
                      bgcolor: 'rgba(16, 185, 129, 0.08)',
                      border: `1px solid ${BRAND_COLORS.successGreen}`,
                      color: BRAND_COLORS.slate700,
                    }}
                  >
                    Your bus has arrived at the destination.
                  </Alert>
                )}
              </Box>

              {/* Location Information with brand styling */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900, mb: 1 }}>
                  Current Location
                </Typography>

                {busLocation ? (
                  <Box
                    p={3}
                    sx={{
                      bgcolor: BRAND_COLORS.slate100,
                      borderRadius: BORDER_RADIUS.lg,
                      border: `1px solid ${BRAND_COLORS.slate300}`,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600, mb: 0.5 }}>
                          Latitude:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900 }}>
                          {busLocation.latitude ? busLocation.latitude.toFixed(6) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600, mb: 0.5 }}>
                          Longitude:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900 }}>
                          {busLocation.longitude ? busLocation.longitude.toFixed(6) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600, mb: 0.5 }}>
                          Speed:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: BRAND_COLORS.skyBlue }}>
                          {busLocation.speed ? `${busLocation.speed} km/h` : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600, mb: 0.5 }}>
                          Last Updated:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900 }}>
                          {busLocation.timestamp ? new Date(busLocation.timestamp).toLocaleTimeString() : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: BORDER_RADIUS.md,
                      bgcolor: 'rgba(14, 165, 233, 0.08)',
                      border: `1px solid ${BRAND_COLORS.skyBlue}`,
                      color: BRAND_COLORS.slate700,
                    }}
                  >
                    Location data is not available at the moment. It will update when the bus is on a trip.
                  </Alert>
                )}
              </Box>

              {/* Tracking Tips with brand styling */}
              <Box mt={3}>
                <Alert
                  icon={<Flag />}
                  severity="info"
                  sx={{
                    borderRadius: BORDER_RADIUS.md,
                    bgcolor: 'rgba(14, 165, 233, 0.08)',
                    border: `1px solid ${BRAND_COLORS.skyBlue}`,
                    color: BRAND_COLORS.slate700,
                  }}
                >
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