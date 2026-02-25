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
  // Convenience: get the currently logged-in driver's buses
  getDriverBuses: async () => {
    const meResponse = await makeApiRequest(() => api.get('/api/auth/me'));
    const user = meResponse.data?.data || meResponse.data;
    return makeApiRequest(() => api.get(`/api/buses/driver/${user._id}`));
  },
  // Get student's assigned bus
  getStudentBus: async () => {
    const meResponse = await makeApiRequest(() => api.get('/api/auth/me'));
    const user = meResponse.data?.data || meResponse.data;
    if (user?.assignedBus) {
      const busId = typeof user.assignedBus === 'object' ? user.assignedBus._id : user.assignedBus;
      return makeApiRequest(() => api.get(`/api/buses/${busId}`));
    }
    return { data: { success: false, data: null } };
  },
};