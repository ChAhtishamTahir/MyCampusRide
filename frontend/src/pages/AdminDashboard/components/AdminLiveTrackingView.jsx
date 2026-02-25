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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import {
  DirectionsBus,
  LocationOn,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { GoogleMap, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { useMap } from '../../../components/MapProvider';
import { socketService, routeService, trackingService } from '../../../services';
import { useNavigate } from 'react-router-dom';
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

const ROUTE_COLORS = [
  '#3B82F6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

const AdminLiveTrackingView = () => {
  const navigate = useNavigate();
  const { isLoaded, hasApiKey } = useMap();
  const [activeBuses, setActiveBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [selectedBus, setSelectedBus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const socketConnectedRef = useRef(false);

  useEffect(() => {
    fetchRoutes();
    fetchActiveBuses();

    if (!socketConnectedRef.current) {
      socketService.connect();
      socketService.joinAllBuses();
      socketConnectedRef.current = true;

      socketService.onBusLocationUpdate(handleBusLocationUpdate);
      socketService.onTripStarted(handleTripStarted);
      socketService.onTripStopped(handleTripStopped);
    }

    return () => {
      if (socketConnectedRef.current) {
        socketService.leaveAllBuses();
        socketService.offBusLocationUpdate(handleBusLocationUpdate);
        socketService.offTripStarted(handleTripStarted);
        socketService.offTripStopped(handleTripStopped);
        socketConnectedRef.current = false;
      }
    };
  }, []);

  const handleBusLocationUpdate = (data) => {
    setActiveBuses((prev) => {
      const index = prev.findIndex((b) => b.busId === data.busId);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          location: data.location,
          lastUpdate: data.lastUpdate,
        };
        return updated;
      }
      return prev;
    });
  };

  const handleTripStarted = () => {
    fetchActiveBuses();
  };

  const handleTripStopped = () => {
    fetchActiveBuses();
  };

  const fetchRoutes = async () => {
    try {
      const response = await routeService.getAllRoutes();
      if (response.data?.success) {
        setRoutes(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    }
  };

  const fetchActiveBuses = async () => {
    try {
      setIsLoading(true);
      const response = await trackingService.getActiveBusLocations();
      if (response.data?.success) {
        setActiveBuses(response.data.data || []);
      }
    } catch (err) {
      setError('Failed to load active buses');
    } finally {
      setIsLoading(false);
    }
  };

  const getRouteColor = (routeId) => {
    const index = routes.findIndex((r) => r._id === routeId);
    return ROUTE_COLORS[index % ROUTE_COLORS.length];
  };

  const isValidCoord = (lat, lng) => {
    return typeof lat === 'number' && typeof lng === 'number' &&
      isFinite(lat) && isFinite(lng) &&
      lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
      (lat !== 0 || lng !== 0);
  };

  const filteredBuses = selectedRoute === 'all'
    ? activeBuses
    : activeBuses.filter((b) => b.route?._id === selectedRoute);

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
        </Box>
      );
    }

    const validBuses = filteredBuses.filter(
      (b) => b.location && isValidCoord(b.location.latitude, b.location.longitude)
    );

    const center = validBuses.length > 0
      ? { lat: validBuses[0].location.latitude, lng: validBuses[0].location.longitude }
      : CAMPUS_CENTER;

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        options={mapOptions}
      >
        {validBuses.map((bus) => {
          const color = getRouteColor(bus.route?._id);
          return (
            <Marker
              key={bus.busId}
              position={{
                lat: bus.location.latitude,
                lng: bus.location.longitude,
              }}
              icon={{
                path: 'M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z',
                fillColor: color,
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: 1.5,
                anchor: { x: 12, y: 22 },
              }}
              onClick={() => setSelectedBus(bus)}
            />
          );
        })}

        {selectedBus && selectedBus.location && isValidCoord(selectedBus.location.latitude, selectedBus.location.longitude) && (
          <InfoWindow
            position={{
              lat: selectedBus.location.latitude,
              lng: selectedBus.location.longitude,
            }}
            onCloseClick={() => setSelectedBus(null)}
          >
            <Box sx={{ p: 1, minWidth: 180 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {selectedBus.busNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Driver: {selectedBus.driver?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Route: {selectedBus.route?.routeName || 'N/A'}
              </Typography>
              {selectedBus.location?.speed > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Speed: {Math.round(selectedBus.location.speed)} km/h
                </Typography>
              )}
              {selectedBus.tripStartTime && (
                <Typography variant="body2" color="text.secondary">
                  Started: {new Date(selectedBus.tripStartTime).toLocaleTimeString()}
                </Typography>
              )}
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() => navigate('/admin/buses')}
              >
                View Details
              </Button>
            </Box>
          </InfoWindow>
        )}

        {selectedRoute !== 'all' && routes.length > 0 && (() => {
          const route = routes.find((r) => r._id === selectedRoute);
          const validStops = (route?.stops || []).filter(
            stop => isValidCoord(stop.latitude, stop.longitude)
          );
          if (validStops.length > 0) {
            return (
              <>
                {validStops.map((stop, index) => (
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
                  path={validStops.map((s) => ({ lat: s.latitude, lng: s.longitude }))}
                  options={{
                    strokeColor: getRouteColor(selectedRoute),
                    strokeOpacity: 0.7,
                    strokeWeight: 3,
                  }}
                />
              </>
            );
          }
          return null;
        })()}
      </GoogleMap>
    );
  };

  if (!isLoaded) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Live Tracking
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchActiveBuses}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Paper
            elevation={2}
            sx={{
              height: { xs: 400, md: 550 },
              borderRadius: BORDER_RADIUS.lg,
              overflow: 'hidden',
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              renderMap()
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ mb: 2, borderRadius: BORDER_RADIUS.lg }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterList sx={{ color: BRAND_COLORS.skyBlue }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Filters
                </Typography>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Route</InputLabel>
                <Select
                  value={selectedRoute}
                  label="Route"
                  onChange={(e) => setSelectedRoute(e.target.value)}
                >
                  <MenuItem value="all">All Routes</MenuItem>
                  {routes.map((route) => (
                    <MenuItem key={route._id} value={route._id}>
                      {route.routeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: BORDER_RADIUS.lg }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DirectionsBus sx={{ color: BRAND_COLORS.skyBlue }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Active Buses
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Chip
                  label={`${filteredBuses.length} Active`}
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {filteredBuses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active buses at the moment
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
                  {filteredBuses.map((bus) => (
                    <Box
                      key={bus.busId}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: BORDER_RADIUS.md,
                        bgcolor: 'grey.50',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                      }}
                      onClick={() => setSelectedBus(bus)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: getRouteColor(bus.route?._id),
                          }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {bus.busNumber}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {bus.route?.routeName || 'No route'}
                      </Typography>
                      {bus.driver && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {bus.driver.name}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminLiveTrackingView;
