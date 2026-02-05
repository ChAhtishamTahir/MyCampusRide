import api from './api';
import { makeApiRequest } from '../utils/apiUtils';

export const busService = {
  getBuses: (params) => makeApiRequest(() => api.get('/api/buses', { params })),
  getBus: (id) => makeApiRequest(() => api.get(`/api/buses/${id}`)),
  createBus: (data) => makeApiRequest(() => api.post('/api/buses', data)),
  updateBus: (id, data) => makeApiRequest(() => api.put(`/api/buses/${id}`, data)),
  deleteBus: (id) => makeApiRequest(() => api.delete(`/api/buses/${id}`)),
  getBusesByDriver: (driverId) => makeApiRequest(() => api.get(`/api/buses/driver/${driverId}`)),
  getBusesByRoute: (routeId) => makeApiRequest(() => api.get(`/api/buses/route/${routeId}`)),
  getActiveBuses: () => makeApiRequest(() => api.get('/api/buses/active')),
  getBusStats: () => makeApiRequest(() => api.get('/api/buses/stats/overview')),
};