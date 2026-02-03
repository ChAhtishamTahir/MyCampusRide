// Utility functions for simulating bus locations when Google Maps API is not available

/**
 * Generate random coordinates within a specified radius of a center point
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Object} - {latitude, longitude}
 */
const generateRandomLocation = (centerLat, centerLng, radiusKm = 0.5) => {
  // Convert radius from km to degrees (approximate)
  const radiusDegrees = radiusKm / 111; // 1 degree ≈ 111 km
  
  // Generate random angle and distance
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusDegrees;
  
  // Calculate new coordinates
  const newLat = centerLat + (distance * Math.cos(angle));
  const newLng = centerLng + (distance * Math.sin(angle));
  
  return {
    latitude: parseFloat(newLat.toFixed(6)),
    longitude: parseFloat(newLng.toFixed(6))
  };
};

/**
 * Generate a route between two points with intermediate stops
 * @param {Object} startPoint - {latitude, longitude}
 * @param {Object} endPoint - {latitude, longitude}
 * @param {number} numStops - Number of intermediate stops
 * @returns {Array} - Array of coordinate objects
 */
const generateRoutePath = (startPoint, endPoint, numStops = 5) => {
  const path = [startPoint];
  
  for (let i = 1; i < numStops; i++) {
    const ratio = i / numStops;
    const lat = startPoint.latitude + (endPoint.latitude - startPoint.latitude) * ratio;
    const lng = startPoint.longitude + (endPoint.longitude - startPoint.longitude) * ratio;
    
    // Add some randomness to make it more realistic
    const randomOffset = 0.001;
    const latOffset = (Math.random() - 0.5) * randomOffset;
    const lngOffset = (Math.random() - 0.5) * randomOffset;
    
    path.push({
      latitude: parseFloat((lat + latOffset).toFixed(6)),
      longitude: parseFloat((lng + lngOffset).toFixed(6))
    });
  }
  
  path.push(endPoint);
  return path;
};

/**
 * Simulate bus movement along a route
 * @param {Array} routeStops - Array of route stops with coordinates
 * @param {number} currentStopIndex - Current stop index
 * @param {number} progress - Progress between stops (0-1)
 * @returns {Object} - Current location and next stop info
 */
const simulateBusMovement = (routeStops, currentStopIndex = 0, progress = 0) => {
  if (!routeStops || routeStops.length === 0) {
    return {
      latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
      address: 'Simulated Location',
      currentStop: null,
      nextStop: null,
      progress: 0
    };
  }

  const currentStop = routeStops[currentStopIndex];
  const nextStopIndex = (currentStopIndex + 1) % routeStops.length;
  const nextStop = routeStops[nextStopIndex];

  // Calculate current position between stops
  const lat = currentStop.latitude + (nextStop.latitude - currentStop.latitude) * progress;
  const lng = currentStop.longitude + (nextStop.longitude - currentStop.longitude) * progress;

  return {
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lng.toFixed(6)),
    address: `Between ${currentStop.name} and ${nextStop.name}`,
    currentStop: currentStop,
    nextStop: nextStop,
    progress: progress
  };
};

/**
 * Generate realistic bus speed and timing
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} maxSpeedKmh - Maximum speed in km/h
 * @returns {Object} - Speed and estimated time
 */
const calculateBusTiming = (distanceKm, maxSpeedKmh = 30) => {
  // Bus speed varies between 15-30 km/h in city conditions
  const minSpeed = 15;
  const speed = minSpeed + Math.random() * (maxSpeedKmh - minSpeed);
  const timeHours = distanceKm / speed;
  const timeMinutes = Math.round(timeHours * 60);
  
  return {
    speed: Math.round(speed),
    estimatedTimeMinutes: timeMinutes,
    estimatedTimeFormatted: `${timeMinutes} min`
  };
};

/**
 * Generate sample campus coordinates for different universities
 */
const CAMPUS_COORDINATES = {
  'default': {
    center: { latitude: 40.7128, longitude: -74.0060 },
    name: 'Default Campus',
    radius: 2
  },
  'nyu': {
    center: { latitude: 40.7295, longitude: -73.9965 },
    name: 'NYU Campus',
    radius: 1.5
  },
  'columbia': {
    center: { latitude: 40.8075, longitude: -73.9626 },
    name: 'Columbia University',
    radius: 1.2
  },
  'mit': {
    center: { latitude: 42.3601, longitude: -71.0942 },
    name: 'MIT Campus',
    radius: 1.8
  },
  'stanford': {
    center: { latitude: 37.4275, longitude: -122.1697 },
    name: 'Stanford University',
    radius: 2.5
  }
};

/**
 * Get campus-specific coordinates
 * @param {string} campusType - Type of campus
 * @returns {Object} - Campus coordinates and info
 */
const getCampusCoordinates = (campusType = 'default') => {
  return CAMPUS_COORDINATES[campusType] || CAMPUS_COORDINATES['default'];
};

/**
 * Generate a complete simulated bus tracking data
 * @param {Object} bus - Bus object with route information
 * @param {string} campusType - Type of campus for realistic coordinates
 * @returns {Object} - Complete tracking data
 */
const generateSimulatedTrackingData = (bus, campusType = 'default') => {
  const campus = getCampusCoordinates(campusType);
  const route = bus.routeId;
  
  if (!route || !route.stops || route.stops.length === 0) {
    // Generate random location within campus
    const randomLocation = generateRandomLocation(
      campus.center.latitude,
      campus.center.longitude,
      campus.radius
    );
    
    return {
      busId: bus._id,
      busNumber: bus.busNumber,
      location: randomLocation,
      address: 'Simulated Campus Location',
      isOnTrip: bus.isOnTrip || false,
      lastUpdate: new Date(),
      tripStartTime: bus.tripStartTime,
      isSimulated: true,
      campus: campus.name
    };
  }

  // Simulate movement along route
  const currentStopIndex = Math.floor(Math.random() * route.stops.length);
  const progress = Math.random();
  
  const movement = simulateBusMovement(route.stops, currentStopIndex, progress);
  
  return {
    busId: bus._id,
    busNumber: bus.busNumber,
    location: {
      latitude: movement.latitude,
      longitude: movement.longitude,
      address: movement.address
    },
    isOnTrip: bus.isOnTrip || false,
    lastUpdate: new Date(),
    tripStartTime: bus.tripStartTime,
    isSimulated: true,
    currentStop: movement.currentStop,
    nextStop: movement.nextStop,
    progress: movement.progress,
    campus: campus.name
  };
};

module.exports = {
  generateRandomLocation,
  generateRoutePath,
  simulateBusMovement,
  calculateBusTiming,
  getCampusCoordinates,
  generateSimulatedTrackingData,
  CAMPUS_COORDINATES
};




