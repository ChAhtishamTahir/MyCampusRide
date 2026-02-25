/**
 * DriverTrackingView Component (Refactored)
 *
 * Composed from sub-components:
 * - BusStatusCard (bus info + tracking status)
 * - LocationCard (lat/lng/address)
 * - RouteInfoCard (route, times)
 * - RouteStopsTimeline (visual stepper)
 */

import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Button,
  CircularProgress, Alert
} from '@mui/material';
import { MyLocation, AccessTime } from '@mui/icons-material';
import { trackingService, busService, routeService } from '../../../services';
import BusStatusCard from './tracking/BusStatusCard';
import LocationCard from './tracking/LocationCard';
import RouteInfoCard from './tracking/RouteInfoCard';
import RouteStopsTimeline from './RouteStopsTimeline';
import {
  BRAND_COLORS,
  CARD_STYLES,
  BORDER_RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  BUTTON_STYLES,
  gradientIconBox,
} from '../../../styles/brandStyles';

const DriverTrackingView = () => {
  const [locationData, setLocationData] = useState(null);
  const [busInfo, setBusInfo] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [routeName, setRouteName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrackingData();
  }, []);

  const loadTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const busResponse = await busService.getDriverBuses();
      const buses = busResponse.data?.data || busResponse.data || [];
      if (buses && buses.length > 0) {
        const driverBus = buses[0];
        setBusInfo(driverBus);

        // Load route details for stops timeline
        if (driverBus.routeId) {
          try {
            const routeId = typeof driverBus.routeId === 'object' ? driverBus.routeId._id : driverBus.routeId;
            const routeResponse = await routeService.getRoute(routeId);
            const route = routeResponse.data?.data || routeResponse.data;
            setRouteStops(route?.stops || []);
            setRouteName(route?.routeName || '');
          } catch (err) {
            console.error('Could not load route stops:', err);
          }
        }

        try {
          const trackingResponse = await trackingService.getBusLocation(driverBus._id);
          const trackData = trackingResponse.data?.data || trackingResponse.data;
          setLocationData({
            latitude: trackData?.location?.latitude || 0,
            longitude: trackData?.location?.longitude || 0,
            address: trackData?.location?.address || 'Address not available',
            isOnTrip: trackData?.isOnTrip || false,
            lastUpdate: trackData?.lastUpdate || null,
          });
        } catch (err) {
          setLocationData({
            latitude: 0,
            longitude: 0,
            address: 'Address not available',
            isOnTrip: false,
            lastUpdate: null,
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
        const trackData = trackingResponse.data?.data || trackingResponse.data;
        setLocationData({
          latitude: trackData?.location?.latitude || 0,
          longitude: trackData?.location?.longitude || 0,
          address: trackData?.location?.address || 'Address not available',
          isOnTrip: trackData?.isOnTrip || false,
          lastUpdate: trackData?.lastUpdate || null,
        });
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Card sx={{ ...CARD_STYLES.standard, border: `1px solid ${BRAND_COLORS.slate300}` }}>
        <CardContent>
          {/* Card Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={gradientIconBox(
                `linear-gradient(135deg, ${BRAND_COLORS.teal} 0%, ${BRAND_COLORS.skyBlue} 100%)`,
                '0 4px 16px rgba(20, 184, 166, 0.3)'
              )}>
                <MyLocation sx={{ color: BRAND_COLORS.white }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: TYPOGRAPHY.weights.bold, color: BRAND_COLORS.slate900 }}>
                  Bus Tracking
                </Typography>
                <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
                  Real-time location and route info
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AccessTime />}
              onClick={refreshLocation}
              disabled={loading}
              sx={{
                ...BUTTON_STYLES.primary,
                px: 3,
                py: 1,
              }}
            >
              Refresh Location
            </Button>
          </Box>

          {/* Sub-components */}
          {busInfo && (
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6}>
                <BusStatusCard busInfo={busInfo} locationData={locationData} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocationCard locationData={locationData} />
              </Grid>
            </Grid>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <RouteInfoCard busInfo={busInfo} />
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Route Stops Timeline */}
              <Card sx={{
                ...CARD_STYLES.standard,
                border: `1px solid ${BRAND_COLORS.slate200}`,
                boxShadow: SHADOWS.sm,
              }}>
                <CardContent>
                  <RouteStopsTimeline stops={routeStops} routeName={routeName} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Footer Note */}
          <Box mt={3} textAlign="center" sx={{
            p: 2,
            borderRadius: BORDER_RADIUS.md,
            bgcolor: BRAND_COLORS.slate100,
          }}>
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <MyLocation sx={{ fontSize: 18, color: BRAND_COLORS.skyBlue }} />
              <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600, fontWeight: TYPOGRAPHY.weights.medium }}>
                Real-time bus tracking system — Location updates automatically during active trips
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DriverTrackingView;