import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  MyLocation,
  Speed,
  AccessTime,
  DirectionsBus,
  LocationOn,
} from '@mui/icons-material';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { useMap } from '../../../components/MapProvider';
import { trackingService } from '../../../services';
import { toast } from 'react-toastify';
import {
  BRAND_COLORS,
  BORDER_RADIUS,
  SHADOWS,
} from '../../../styles/brandStyles';

const CAMPUS_CENTER = { lat: 30.03204, lng: 72.31631 };
const LOCATION_UPDATE_INTERVAL = 5000;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  gestureHandling: 'cooperative',
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

const DriverLiveTrackingView = () => {
  const { isLoaded, hasApiKey } = useMap();
  const [tripStatus, setTripStatus] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [tripDuration, setTripDuration] = useState(0);

  const watchIdRef = useRef(null);
  const updateIntervalRef = useRef(null);

  useEffect(() => {
    fetchTripStatus();
    return () => {
      stopWatchingPosition();
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (tripStatus?.isOnTrip) {
      startWatchingPosition();
      startLocationUpdates();
      const interval = setInterval(() => {
        if (tripStatus?.tripStartTime) {
          const duration = Math.round((Date.now() - new Date(tripStatus.tripStartTime).getTime()) / 60000);
          setTripDuration(duration);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      stopWatchingPosition();
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    }
  }, [tripStatus?.isOnTrip]);

  const fetchTripStatus = async () => {
    try {
      setIsLoading(true);
      const response = await trackingService.getMyTripStatus();
      if (response.data?.success) {
        setTripStatus(response.data.data);
        if (response.data.data.currentLocation?.latitude) {
          setCurrentPosition({
            lat: response.data.data.currentLocation.latitude,
            lng: response.data.data.currentLocation.longitude,
          });
        }
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to fetch trip status');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startWatchingPosition = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoError(null);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setGeoError(getGeoErrorMessage(err));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const stopWatchingPosition = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const startLocationUpdates = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    updateIntervalRef.current = setInterval(() => {
      if (currentPosition && tripStatus?.isOnTrip) {
        sendLocationUpdate();
      }
    }, LOCATION_UPDATE_INTERVAL);
  };

  const sendLocationUpdate = useCallback(async () => {
    if (!currentPosition) return;

    try {
      await trackingService.updateLocation({
        latitude: currentPosition.lat,
        longitude: currentPosition.lng,
        speed: 0,
        heading: 0,
      });
    } catch (err) {
      console.error('Failed to send location update:', err);
    }
  }, [currentPosition]);

  const getGeoErrorMessage = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location permission denied. Please enable location access.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable.';
      case error.TIMEOUT:
        return 'Location request timed out.';
      default:
        return 'An unknown error occurred getting location.';
    }
  };

  const handleStartTrip = async () => {
    try {
      setIsStarting(true);
      const response = await trackingService.startTrip();
      if (response.data?.success) {
        toast.success('Trip started successfully');
        fetchTripStatus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start trip');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopTrip = async () => {
    try {
      setIsStopping(true);
      const response = await trackingService.stopTrip();
      if (response.data?.success) {
        toast.success('Trip stopped successfully');
        fetchTripStatus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to stop trip');
    } finally {
      setIsStopping(false);
    }
  };

  const isValidCoord = (lat, lng) => {
    return typeof lat === 'number' && typeof lng === 'number' &&
           isFinite(lat) && isFinite(lng) &&
           lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const renderMap = () => {
    if (!hasApiKey) {
      return (
        <Box
          sx={{
            height: '100%',
            bgcolor: 'grey.100',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LocationOn sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="grey.600">
            Map unavailable
          </Typography>
          <Typography variant="body2" color="grey.500">
            Google Maps API key not configured
          </Typography>
          {currentPosition && isValidCoord(currentPosition.lat, currentPosition.lng) && (
            <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
              Current: {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}
            </Typography>
          )}
        </Box>
      );
    }

    const hasValidPosition = currentPosition && isValidCoord(currentPosition.lat, currentPosition.lng);
    const center = hasValidPosition ? currentPosition : CAMPUS_CENTER;
    const routeStops = (tripStatus?.bus?.routeId?.stops || []).filter(
      stop => isValidCoord(stop.latitude, stop.longitude)
    );

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        options={mapOptions}
      >
        {hasValidPosition && (
          <Marker
            position={currentPosition}
            icon={{
              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
              scale: 12,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeWeight: 3,
              strokeColor: '#ffffff',
            }}
          />
        )}

        {routeStops.length > 0 && (
          <>
            {routeStops.map((stop, index) => (
              <Marker
                key={index}
                position={{ lat: stop.latitude, lng: stop.longitude }}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                  scale: 8,
                  fillColor: '#10B981',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: '#ffffff',
                }}
                title={stop.name || `Stop ${index + 1}`}
              />
            ))}
            <Polyline
              path={routeStops.map((stop) => ({
                lat: stop.latitude,
                lng: stop.longitude,
              }))}
              options={{
                strokeColor: '#3B82F6',
                strokeOpacity: 0.8,
                strokeWeight: 4,
              }}
            />
          </>
        )}
      </GoogleMap>
    );
  };

  if (isLoading || !isLoaded) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Live Tracking
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {geoError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {geoError}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={2}
            sx={{
              height: { xs: 400, md: 500 },
              borderRadius: BORDER_RADIUS.lg,
              overflow: 'hidden',
            }}
          >
            {renderMap()}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2, borderRadius: BORDER_RADIUS.lg }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DirectionsBus sx={{ color: BRAND_COLORS.skyBlue }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Trip Controls
                </Typography>
              </Box>

              {tripStatus?.bus ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bus Number
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {tripStatus.bus.busNumber}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Route
                    </Typography>
                    <Typography variant="body1">
                      {tripStatus.bus.routeId?.routeName || 'No route assigned'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Chip
                      label={tripStatus.isOnTrip ? 'On Trip' : 'Available'}
                      color={tripStatus.isOnTrip ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  {tripStatus.isOnTrip ? (
                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      size="large"
                      startIcon={isStopping ? <CircularProgress size={20} color="inherit" /> : <Stop />}
                      onClick={handleStopTrip}
                      disabled={isStopping}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: SHADOWS.buttonDefault,
                      }}
                    >
                      {isStopping ? 'Stopping...' : 'Stop Trip'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={isStarting ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                      onClick={handleStartTrip}
                      disabled={isStarting}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        background: BRAND_COLORS.primaryGradient,
                        boxShadow: SHADOWS.buttonDefault,
                        '&:hover': {
                          background: BRAND_COLORS.primaryGradientHover,
                        },
                      }}
                    >
                      {isStarting ? 'Starting...' : 'Start Trip'}
                    </Button>
                  )}
                </>
              ) : (
                <Alert severity="info">No bus assigned to you</Alert>
              )}
            </CardContent>
          </Card>

          {tripStatus?.isOnTrip && (
            <Card sx={{ borderRadius: BORDER_RADIUS.lg }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Trip Information
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <AccessTime sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Duration:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {tripDuration} min
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <MyLocation sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    GPS Status:
                  </Typography>
                  <Chip
                    label={currentPosition ? 'Active' : 'Waiting'}
                    color={currentPosition ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Speed sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Updates:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Every 5 sec
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriverLiveTrackingView;
