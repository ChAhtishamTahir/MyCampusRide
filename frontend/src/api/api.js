import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Enable sending cookies with requests
});

// Import individual services for backward compatibility
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { busService } from '../services/busService';
import { routeService } from '../services/routeService';
import { trackingService } from '../services/trackingService';
import { notificationService } from '../services/notificationService';

// Export services for backward compatibility
export const authAPI = authService;
export const usersAPI = userService;
export const busesAPI = busService;
export const routesAPI = routeService;
export const trackingAPI = trackingService;
export const notificationsAPI = notificationService;

// Health check
export const healthAPI = {
  check: () => api.get('/api/health'),
};

export default api;
