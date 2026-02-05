import api from './api';
import { makeApiRequest } from '../utils/apiUtils';

export const authService = {
  register: (userData) => makeApiRequest(() => api.post('/api/auth/register', userData)),
  login: (credentials) => makeApiRequest(() => api.post('/api/auth/login', credentials)),
  logout: () => makeApiRequest(() => api.post('/api/auth/logout')),
  getMe: () => makeApiRequest(() => api.get('/api/auth/me')),
  updateProfile: (data) => makeApiRequest(() => api.put('/api/auth/profile', data)),
  changePassword: (data) => makeApiRequest(() => api.put('/api/auth/change-password', data)),
};