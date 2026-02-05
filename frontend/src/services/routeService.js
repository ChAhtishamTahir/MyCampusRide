import api from './api';
import { makeApiRequest } from '../utils/apiUtils';

export const routeService = {
  getRoutes: (params) => makeApiRequest(() => api.get('/api/routes', { params })),
  getRoute: (id) => makeApiRequest(() => api.get(`/api/routes/${id}`)),
  createRoute: (data) => makeApiRequest(() => api.post('/api/routes', data)),
  updateRoute: (id, data) => makeApiRequest(() => api.put(`/api/routes/${id}`, data)),
  deleteRoute: (id) => makeApiRequest(() => api.delete(`/api/routes/${id}`)),
  getActiveRoutes: () => makeApiRequest(() => api.get('/api/routes/active')),
  getRouteStats: () => makeApiRequest(() => api.get('/api/routes/stats/overview')),
  assignBusToRoute: (routeId, busId) => makeApiRequest(() => api.put(`/api/routes/${routeId}/assign-bus`, { busId })),
};