import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { Box, CircularProgress, Typography } from '@mui/material';

const MapContext = createContext({
  isLoaded: false,
  hasApiKey: false
});

export const useMap = () => useContext(MapContext);

const GOOGLE_MAPS_LIBRARIES = ['places'];

const MapProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = apiKey && apiKey.trim() !== '';

  useEffect(() => {
    if (!hasApiKey) {
      setIsLoaded(true);
    }
  }, [hasApiKey]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (error) => {
    console.error('Google Maps loading error:', error);
    setLoadError(error);
    setIsLoaded(true);
  };

  if (!hasApiKey) {
    return (
      <MapContext.Provider value={{ isLoaded: true, hasApiKey: false }}>
        {children}
      </MapContext.Provider>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={GOOGLE_MAPS_LIBRARIES}
      onLoad={handleLoad}
      onError={handleError}
      loadingElement={
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: 2
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">Loading Maps...</Typography>
        </Box>
      }
    >
      <MapContext.Provider value={{ isLoaded, hasApiKey: !loadError }}>
        {children}
      </MapContext.Provider>
    </LoadScript>
  );
};

export default MapProvider;
