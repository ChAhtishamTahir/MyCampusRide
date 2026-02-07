import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error("Unable to connect to server. Please check your internet connection and try again.");
    } else if (error.code === 'ECONNABORTED') {
      toast.error("Request timed out. Please try again.");
    }
    return Promise.reject(error);
  }
);

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
