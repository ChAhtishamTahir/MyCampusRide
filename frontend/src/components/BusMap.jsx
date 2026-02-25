import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Chip,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  LocationOn,
  DirectionsBus,
  Refresh,
  Warning,
} from '@mui/icons-material';
import { GoogleMap, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { useMap } from './MapProvider';
import { trackingAPI } from '../api/api';

const CAMPUS_CENTER = { lat: 30.03204, lng: 72.31631 };

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  gestureHandling: 'cooperative',
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const BusMap = ({ routeId, height = 400, buses: externalBuses, showRefresh = true }) => {
  const theme = useTheme();
  const { isLoaded, hasApiKey } = useMap();
  const [busLocations, setBusLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (externalBuses) {
      setBusLocations(externalBuses);
    } else {
      loadBusLocations();
    }
  }, [routeId, externalBuses]);

  const loadBusLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = routeId ? { routeId } : {};
      const response = await trackingAPI.getSimulatedLocations(params);
      setBusLocations(response.data.data || []);
    } catch (err) {
      setError('Failed to load bus locations');
      console.error('Bus map error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const isValidCoord = (lat, lng) => {
    return typeof lat === 'number' && typeof lng === 'number' &&
           isFinite(lat) && isFinite(lng) &&
           lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const getBusIcon = (bus) => {
    const color = bus.isOnTrip ? '#22c55e' : '#3B82F6';
    return {
      path: 'M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 10c-1.67 0-3.14-.85-4-2.15.02-1.32 2.67-2.05 4-2.05s3.98.73 4 2.05c-.86 1.3-2.33 2.15-4 2.15z',
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 1.5,
      anchor: { x: 12, y: 22 }
    };
  };

  const renderGoogleMap = () => {
    const validBuses = busLocations.filter(
      bus => bus.location && isValidCoord(bus.location.latitude, bus.location.longitude)
    );

    const center = validBuses.length > 0
      ? { lat: validBuses[0].location.latitude, lng: validBuses[0].location.longitude }
      : CAMPUS_CENTER;

    return (
      <Box sx={{ height, borderRadius: 2, overflow: 'hidden' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {validBuses.map((bus) => (
            <Marker
              key={bus.busId}
              position={{
                lat: bus.location.latitude,
                lng: bus.location.longitude
              }}
              icon={getBusIcon(bus)}
              onClick={() => setSelectedBus(bus)}
            />
          ))}

          {selectedBus && selectedBus.location && isValidCoord(selectedBus.location.latitude, selectedBus.location.longitude) && (
            <InfoWindow
              position={{
                lat: selectedBus.location.latitude,
                lng: selectedBus.location.longitude
              }}
              onCloseClick={() => setSelectedBus(null)}
            >
              <Box sx={{ p: 1, minWidth: 150 }}>
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
                <Chip
                  label={selectedBus.isOnTrip ? 'On Trip' : 'Available'}
                  color={selectedBus.isOnTrip ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </InfoWindow>
          )}
        </GoogleMap>
      </Box>
    );
  };

  const renderSimulatedMap = () => (
    <Box
      sx={{
        height,
        bgcolor: 'grey.100',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Alert
        severity="info"
        icon={<Warning />}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 1,
        }}
      >
        Google Maps API key not configured. Showing simulation mode.
      </Alert>

      {busLocations.map((bus, index) => (
        <Box
          key={bus.busId}
          sx={{
            position: 'absolute',
            left: `${20 + (index * 20)}%`,
            top: `${30 + (index * 15)}%`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <DirectionsBus
            sx={{
              fontSize: 32,
              color: bus.isOnTrip ? 'success.main' : 'primary.main',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              bgcolor: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 600,
              fontSize: '0.75rem',
              boxShadow: theme.shadows[2],
            }}
          >
            {bus.busNumber}
          </Typography>
        </Box>
      ))}

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      <Box sx={{ textAlign: 'center', zIndex: 2 }}>
        <LocationOn sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" color="grey.600" sx={{ fontWeight: 600 }}>
          Campus Transport Map
        </Typography>
        <Typography variant="body2" color="grey.500">
          {busLocations.length} bus{busLocations.length !== 1 ? 'es' : ''} active
        </Typography>
      </Box>
    </Box>
  );

  if (!isLoaded) {
    return (
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box
          sx={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Bus Tracking Map
        </Typography>
        {showRefresh && !externalBuses && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={loadBusLocations}
            disabled={isLoading}
          >
            Refresh
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box
          sx={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {hasApiKey ? renderGoogleMap() : renderSimulatedMap()}

          {busLocations.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Active Buses ({busLocations.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {busLocations.map((bus) => (
                  <Card key={bus.busId} sx={{ minWidth: 200 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <DirectionsBus
                          sx={{
                            fontSize: 20,
                            color: bus.isOnTrip ? 'success.main' : 'primary.main',
                          }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {bus.busNumber}
                        </Typography>
                        <Chip
                          label={bus.isOnTrip ? 'On Trip' : 'Available'}
                          color={bus.isOnTrip ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Driver: {bus.driver?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Route: {bus.route?.routeName || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Location: {bus.location?.address || 'Not available'}
                      </Typography>
                      {bus.isSimulated && (
                        <Chip
                          label="Simulated"
                          color="info"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default BusMap;
