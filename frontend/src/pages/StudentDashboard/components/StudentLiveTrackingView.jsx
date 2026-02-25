import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  DirectionsBus,
  LocationOn,
  Speed,
  AccessTime,
  Phone,
  Person,
  NearMe,
} from '@mui/icons-material';
import { GoogleMap, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { useMap } from '../../../components/MapProvider';
import { useAuth } from '../../../context/AuthContext';
import { socketService, busService } from '../../../services';
import { haversineDistance, formatDistance, calculateETA, formatETA, getDistanceStatus } from '../../../utils/geoUtils';
import {
  BRAND_COLORS,
  BORDER_RADIUS,
} from '../../../styles/brandStyles';

const CAMPUS_CENTER = { lat: 30.03204, lng: 72.31631 };

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

const StudentLiveTrackingView = () => {
  const { user } = useAuth();
  const { isLoaded, hasApiKey } = useMap();
  const [busData, setBusData] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [studentLocation, setStudentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBusInfo, setShowBusInfo] = useState(false);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);

  const socketConnectedRef = useRef(false);

  useEffect(() => {
    fetchAssignedBus();
    requestStudentLocation();

    return () => {
      if (socketConnectedRef.current) {
        socketService.leaveRoute(busData?.routeId?._id);
        socketService.disconnect();
        socketConnectedRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (busData?.routeId?._id && !socketConnectedRef.current) {
      socketService.connect();
      socketService.joinRoute(busData.routeId._id);
      socketConnectedRef.current = true;

      socketService.onBusLocationUpdate(handleBusLocationUpdate);
      socketService.onTripStarted(handleTripStarted);
      socketService.onTripStopped(handleTripStopped);
    }

    return () => {
      if (socketConnectedRef.current) {
        socketService.offBusLocationUpdate(handleBusLocationUpdate);
        socketService.offTripStarted(handleTripStarted);
        socketService.offTripStopped(handleTripStopped);
      }
    };
  }, [busData?.routeId?._id]);

  useEffect(() => {
    if (busLocation && studentLocation) {
      const dist = haversineDistance(
        studentLocation.lat,
        studentLocation.lng,
        busLocation.lat,
        busLocation.lng
      );
      setDistance(dist);

      const speed = busLocation.speed || 30;
      const etaMinutes = calculateETA(dist, speed);
      setEta(etaMinutes);
    }
  }, [busLocation, studentLocation]);

  const handleBusLocationUpdate = (data) => {
    if (data.busId === busData?._id || data.busId === busData?.bus?._id) {
      setBusLocation({
        lat: data.location.latitude,
        lng: data.location.longitude,
        speed: data.location.speed || 0,
        heading: data.location.heading || 0,
      });
    }
  };

  const handleTripStarted = (data) => {
    if (data.busId === busData?._id || data.busId === busData?.bus?._id) {
      fetchAssignedBus();
    }
  };

  const handleTripStopped = (data) => {
    if (data.busId === busData?._id || data.busId === busData?.bus?._id) {
      setBusLocation(null);
      fetchAssignedBus();
    }
  };

  const fetchAssignedBus = async () => {
    try {
      setIsLoading(true);
      const response = await busService.getStudentBus();
      if (response.data?.success && response.data.data) {
        setBusData(response.data.data);
        if (response.data.data.currentLocation?.latitude) {
          setBusLocation({
            lat: response.data.data.currentLocation.latitude,
            lng: response.data.data.currentLocation.longitude,
            speed: response.data.data.currentLocation.speed || 0,
            heading: response.data.data.currentLocation.heading || 0,
          });
        }
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to load bus information');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const requestStudentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStudentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.error('Student location error:', err);
      },
      { enableHighAccuracy: true }
    );
  };

  const isValidCoord = (lat, lng) => {
    return typeof lat === 'number' && typeof lng === 'number' &&
           isFinite(lat) && isFinite(lng) &&
           lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const renderMap = () => {
    if (!hasApiKey) {
      const hasValidBusLoc = busLocation && isValidCoord(busLocation.lat, busLocation.lng);
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
          {hasValidBusLoc && (
            <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
              Bus at: {busLocation.lat.toFixed(5)}, {busLocation.lng.toFixed(5)}
            </Typography>
          )}
        </Box>
      );
    }

    const hasValidBusLoc = busLocation && isValidCoord(busLocation.lat, busLocation.lng);
    const hasValidStudentLoc = studentLocation && isValidCoord(studentLocation.lat, studentLocation.lng);
    const center = hasValidBusLoc ? busLocation : (hasValidStudentLoc ? studentLocation : CAMPUS_CENTER);
    const routeStops = (busData?.routeId?.stops || []).filter(
      stop => isValidCoord(stop.latitude, stop.longitude)
    );

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        options={mapOptions}
      >
        {hasValidBusLoc && (
          <Marker
            position={busLocation}
            icon={{
              path: 'M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z',
              fillColor: '#22c55e',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: 1.8,
              anchor: { x: 12, y: 22 },
            }}
            onClick={() => setShowBusInfo(true)}
          />
        )}

        {showBusInfo && hasValidBusLoc && (
          <InfoWindow
            position={busLocation}
            onCloseClick={() => setShowBusInfo(false)}
          >
            <Box sx={{ p: 1, minWidth: 150 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {busData?.busNumber || 'Your Bus'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Driver: {busData?.driverId?.name || 'N/A'}
              </Typography>
              {busData?.driverId?.phone && (
                <Typography variant="body2" color="text.secondary">
                  Phone: {busData.driverId.phone}
                </Typography>
              )}
              {busLocation.speed > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Speed: {Math.round(busLocation.speed)} km/h
                </Typography>
              )}
            </Box>
          </InfoWindow>
        )}

        {hasValidStudentLoc && (
          <Marker
            position={studentLocation}
            icon={{
              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
              scale: 10,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeWeight: 3,
              strokeColor: '#ffffff',
            }}
            title="Your location"
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
                  scale: 6,
                  fillColor: '#f59e0b',
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
                strokeOpacity: 0.7,
                strokeWeight: 3,
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

  if (!busData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Live Tracking
        </Typography>
        <Alert severity="info">
          No bus assigned to you yet. Please contact the administrator.
        </Alert>
      </Box>
    );
  }

  const distanceStatus = distance !== null ? getDistanceStatus(distance) : null;

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
                  Your Bus
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Bus Number
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {busData.busNumber}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Route
                </Typography>
                <Typography variant="body1">
                  {busData.routeId?.routeName || 'No route assigned'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Chip
                  label={busData.isOnTrip ? 'On Trip' : 'Not Active'}
                  color={busData.isOnTrip ? 'success' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {busData.driverId && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Person sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {busData.driverId.name}
                    </Typography>
                  </Box>
                  {busData.driverId.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {busData.driverId.phone}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {busData.isOnTrip && busLocation && (
            <Card sx={{ borderRadius: BORDER_RADIUS.lg }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Live Status
                </Typography>

                {distance !== null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <NearMe sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Distance:
                    </Typography>
                    <Chip
                      label={formatDistance(distance)}
                      color={distanceStatus?.color || 'default'}
                      size="small"
                    />
                  </Box>
                )}

                {eta !== null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AccessTime sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      ETA:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatETA(eta)}
                    </Typography>
                  </Box>
                )}

                {busLocation.speed > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Speed sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Speed:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {Math.round(busLocation.speed)} km/h
                    </Typography>
                  </Box>
                )}

                <Alert severity="success" sx={{ mt: 2 }}>
                  Receiving live updates
                </Alert>
              </CardContent>
            </Card>
          )}

          {!busData.isOnTrip && (
            <Alert severity="info">
              Your bus is not currently on a trip. Live tracking will be available once the driver starts the trip.
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentLiveTrackingView;
