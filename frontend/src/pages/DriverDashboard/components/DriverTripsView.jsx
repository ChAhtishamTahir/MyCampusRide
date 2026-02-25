/**
 * DriverTripsView Component
 *
 * Shows the driver's current route assignment with schedule,
 * a route stops table, and recent trip activity.
 * Replaces the old non-functional trips table with useful route info.
 */

import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert, Avatar
} from '@mui/material';
import {
  DirectionsBus, AccessTime, LocalShipping, Route as RouteIcon,
  LocationOn, AttachMoney, Schedule, Info
} from '@mui/icons-material';
import { busService, trackingService } from '../../../services';
import RouteStopsTimeline from './RouteStopsTimeline';
import {
  BRAND_COLORS,
  CARD_STYLES,
  BORDER_RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  BUTTON_STYLES,
  TABLE_STYLES,
  gradientIconBox,
} from '../../../styles/brandStyles';

const DriverTripsView = () => {
  const [busInfo, setBusInfo] = useState(null);
  const [route, setRoute] = useState(null);
  const [tripStatus, setTripStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get driver's bus (getBusesByDriver populates routeId)
      const busResponse = await busService.getDriverBuses();
      const buses = busResponse.data?.data || busResponse.data || [];

      if (buses && buses.length > 0) {
        const driverBus = buses[0];
        setBusInfo(driverBus);

        // Route is populated from getBusesByDriver
        if (typeof driverBus.routeId === 'object' && driverBus.routeId) {
          setRoute(driverBus.routeId);
        }
      }

      // Get current trip status
      try {
        const tripResponse = await trackingService.getMyTripStatus();
        const tripData = tripResponse.data?.data || tripResponse.data;
        setTripStatus(tripData);
      } catch (err) {
        console.error('Could not load trip status:', err);
      }
    } catch (err) {
      console.error('Error loading route data:', err);
      setError('Failed to load route information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress size={48} sx={{ color: BRAND_COLORS.skyBlue }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: BORDER_RADIUS.md }}>{error}</Alert>
      </Container>
    );
  }

  // No bus assigned
  if (!busInfo) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card sx={{ ...CARD_STYLES.standard, border: `1px solid ${BRAND_COLORS.slate300}` }}>
          <CardContent>
            <Box textAlign="center" py={6}>
              <Box sx={{
                width: 72, height: 72, borderRadius: '50%',
                background: BRAND_COLORS.slate100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
              }}>
                <LocalShipping sx={{ fontSize: 36, color: BRAND_COLORS.slate400 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: TYPOGRAPHY.weights.semibold, color: BRAND_COLORS.slate700, mb: 0.5 }}>
                No bus assigned
              </Typography>
              <Typography variant="body2" sx={{ color: BRAND_COLORS.slate500 }}>
                Contact admin to get a bus and route assigned to you.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const stops = route?.stops ? [...route.stops].sort((a, b) => (a.sequence || 0) - (b.sequence || 0)) : [];
  const isOnTrip = tripStatus?.isOnTrip || busInfo?.isOnTrip || false;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>

        {/* Route Assignment Card */}
        <Grid item xs={12}>
          <Card sx={{ ...CARD_STYLES.standard, border: `1px solid ${BRAND_COLORS.slate300}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box sx={gradientIconBox(
                  BRAND_COLORS.driverGradient,
                  '0 4px 16px rgba(245, 158, 11, 0.3)'
                )}>
                  <LocalShipping sx={{ color: BRAND_COLORS.white }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" sx={{ fontWeight: TYPOGRAPHY.weights.bold, color: BRAND_COLORS.slate900 }}>
                    My Route
                  </Typography>
                  <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
                    Your assigned bus and route details
                  </Typography>
                </Box>
                <Chip
                  label={isOnTrip ? 'On Trip' : 'Off Duty'}
                  sx={{
                    bgcolor: isOnTrip ? BRAND_COLORS.successGreen : BRAND_COLORS.slate400,
                    color: BRAND_COLORS.white,
                    fontWeight: TYPOGRAPHY.weights.bold,
                    px: 1,
                  }}
                />
              </Box>

              {/* Quick Info Stats */}
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{
                    p: 2, borderRadius: BORDER_RADIUS.md,
                    bgcolor: BRAND_COLORS.slate100,
                    border: `1px solid ${BRAND_COLORS.slate200}`,
                    textAlign: 'center',
                  }}>
                    <DirectionsBus sx={{ color: BRAND_COLORS.skyBlue, fontSize: 28, mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: TYPOGRAPHY.weights.bold, color: BRAND_COLORS.slate900 }}>
                      {busInfo.busNumber || 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BRAND_COLORS.slate500 }}>
                      Bus Number
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{
                    p: 2, borderRadius: BORDER_RADIUS.md,
                    bgcolor: BRAND_COLORS.slate100,
                    border: `1px solid ${BRAND_COLORS.slate200}`,
                    textAlign: 'center',
                  }}>
                    <RouteIcon sx={{ color: BRAND_COLORS.teal, fontSize: 28, mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: TYPOGRAPHY.weights.bold, color: BRAND_COLORS.slate900, fontSize: '1rem' }}>
                      {route?.routeName || 'No Route'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BRAND_COLORS.slate500 }}>
                      Route Name
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{
                    p: 2, borderRadius: BORDER_RADIUS.md,
                    bgcolor: BRAND_COLORS.slate100,
                    border: `1px solid ${BRAND_COLORS.slate200}`,
                    textAlign: 'center',
                  }}>
                    <Schedule sx={{ color: BRAND_COLORS.warningOrange, fontSize: 28, mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: TYPOGRAPHY.weights.bold, color: BRAND_COLORS.slate900 }}>
                      {route?.departureTime || 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BRAND_COLORS.slate500 }}>
                      Departure Time
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{
                    p: 2, borderRadius: BORDER_RADIUS.md,
                    bgcolor: BRAND_COLORS.slate100,
                    border: `1px solid ${BRAND_COLORS.slate200}`,
                    textAlign: 'center',
                  }}>
                    <LocationOn sx={{ color: BRAND_COLORS.errorRed, fontSize: 28, mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: TYPOGRAPHY.weights.bold, color: BRAND_COLORS.slate900 }}>
                      {stops.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BRAND_COLORS.slate500 }}>
                      Total Stops
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Two-column layout: Stops Table + Timeline */}
        <Grid item xs={12} md={7}>
          <Card sx={{ ...CARD_STYLES.standard, border: `1px solid ${BRAND_COLORS.slate300}`, height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box sx={gradientIconBox(
                  `linear-gradient(135deg, ${BRAND_COLORS.skyBlue} 0%, ${BRAND_COLORS.teal} 100%)`,
                  '0 4px 16px rgba(14, 165, 233, 0.3)'
                )}>
                  <LocationOn sx={{ color: BRAND_COLORS.white }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: TYPOGRAPHY.weights.bold, color: BRAND_COLORS.slate900 }}>
                    Route Stops
                  </Typography>
                  <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
                    All stops on your assigned route
                  </Typography>
                </Box>
              </Box>

              {stops.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Info sx={{ fontSize: 36, color: BRAND_COLORS.slate400, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: BRAND_COLORS.slate500 }}>
                    No stops configured for this route.
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ borderRadius: BORDER_RADIUS.md, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: BRAND_COLORS.slate100 }}>
                        <TableCell sx={TABLE_STYLES.headerCell}>#</TableCell>
                        <TableCell sx={TABLE_STYLES.headerCell}>Stop Name</TableCell>
                        <TableCell sx={TABLE_STYLES.headerCell}>Pickup Time</TableCell>
                        <TableCell sx={TABLE_STYLES.headerCell}>Fee</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stops.map((stop, index) => (
                        <TableRow key={index} sx={TABLE_STYLES.row}>
                          <TableCell sx={TABLE_STYLES.bodyCell}>
                            <Chip
                              label={stop.sequence || index + 1}
                              size="small"
                              sx={{
                                bgcolor: index === 0
                                  ? `${BRAND_COLORS.successGreen}18`
                                  : index === stops.length - 1
                                    ? `${BRAND_COLORS.errorRed}18`
                                    : BRAND_COLORS.slate100,
                                color: index === 0
                                  ? BRAND_COLORS.successGreen
                                  : index === stops.length - 1
                                    ? BRAND_COLORS.errorRed
                                    : BRAND_COLORS.slate700,
                                fontWeight: TYPOGRAPHY.weights.bold,
                                minWidth: 28,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={TABLE_STYLES.bodyCell}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: TYPOGRAPHY.weights.semibold, color: BRAND_COLORS.slate900 }}>
                                {stop.name}
                              </Typography>
                              {stop.address && (
                                <Typography variant="caption" sx={{ color: BRAND_COLORS.slate500 }}>
                                  {stop.address}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={TABLE_STYLES.bodyCell}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <AccessTime sx={{ fontSize: 14, color: BRAND_COLORS.slate500 }} />
                              <Typography variant="body2">{stop.pickupTime || 'N/A'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={TABLE_STYLES.bodyCell}>
                            <Typography variant="body2" sx={{ fontWeight: TYPOGRAPHY.weights.semibold, color: BRAND_COLORS.successGreen }}>
                              {stop.fee !== undefined ? `Rs. ${stop.fee}` : 'N/A'}
                            </Typography>
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

        {/* Route Timeline */}
        <Grid item xs={12} md={5}>
          <Card sx={{ ...CARD_STYLES.standard, border: `1px solid ${BRAND_COLORS.slate300}`, height: '100%' }}>
            <CardContent>
              <RouteStopsTimeline stops={stops} routeName={route?.routeName || ''} />

              {/* Trip info footer */}
              {tripStatus && (
                <Box mt={2} sx={{
                  p: 2,
                  borderRadius: BORDER_RADIUS.md,
                  bgcolor: isOnTrip ? `${BRAND_COLORS.successGreen}08` : BRAND_COLORS.slate100,
                  border: `1px solid ${isOnTrip ? `${BRAND_COLORS.successGreen}30` : BRAND_COLORS.slate200}`,
                }}>
                  <Typography variant="caption" sx={{
                    color: isOnTrip ? BRAND_COLORS.successGreen : BRAND_COLORS.slate500,
                    fontWeight: TYPOGRAPHY.weights.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {isOnTrip ? '🟢 Trip in Progress' : '⚪ No Active Trip'}
                  </Typography>
                  {isOnTrip && tripStatus.tripDuration > 0 && (
                    <Typography variant="body2" sx={{ color: BRAND_COLORS.slate700, mt: 0.5 }}>
                      Duration: {tripStatus.tripDuration} min
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Container>
  );
};

export default DriverTripsView;