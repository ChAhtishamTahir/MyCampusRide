import api from './api';
import { makeApiRequest } from '../utils/apiUtils';

export const userService = {
  getUsers: (params) => makeApiRequest(() => api.get('/api/users', { params })),
  getUser: (id) => makeApiRequest(() => api.get(`/api/users/${id}`)),
  updateUser: (id, data) => makeApiRequest(() => api.put(`/api/users/${id}`, data)),
  deleteUser: (id) => makeApiRequest(() => api.delete(`/api/users/${id}`)),
  approveDriver: (id) => makeApiRequest(() => api.put(`/api/users/${id}/approve`)),
  rejectDriver: (id, reason) => makeApiRequest(() => api.put(`/api/users/${id}/reject`, { reason })),
  getPendingDrivers: () => makeApiRequest(() => api.get('/api/users/pending-drivers')),
  getUserStats: () => makeApiRequest(() => api.get('/api/users/stats')),
  createUser: (data) => makeApiRequest(() => api.post('/api/auth/register', data)),
};