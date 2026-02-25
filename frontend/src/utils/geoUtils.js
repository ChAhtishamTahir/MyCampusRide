export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

export const calculateETA = (distanceKm, speedKmh) => {
  if (!speedKmh || speedKmh <= 0) return null;
  return Math.round((distanceKm / speedKmh) * 60);
};

export const formatDistance = (km) => {
  if (km < 0.5) return 'Nearby';
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)} km away`;
};

export const formatETA = (minutes) => {
  if (minutes === null || minutes === undefined) return 'ETA unavailable';
  if (minutes < 1) return 'Arriving now';
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `~${hours}h ${mins}m`;
};

export const getDistanceStatus = (km) => {
  if (km < 0.5) return { text: 'Nearby', color: 'success' };
  if (km < 2) return { text: 'Close', color: 'info' };
  if (km < 5) return { text: 'Moderate', color: 'warning' };
  return { text: 'Far', color: 'default' };
};
