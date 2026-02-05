import api from './api';
import { makeApiRequest } from '../utils/apiUtils';

export const notificationService = {
  getNotifications: (params) => makeApiRequest(() => api.get('/api/notifications', { params })),
  getNotification: (id) => makeApiRequest(() => api.get(`/api/notifications/${id}`)),
  markAsRead: (id) => makeApiRequest(() => api.put(`/api/notifications/${id}/read`)),
  markAllAsRead: () => makeApiRequest(() => api.put('/api/notifications/mark-all-read')),
  sendNotification: (data) => makeApiRequest(() => api.post('/api/notifications', data)),
  deleteNotification: (id) => makeApiRequest(() => api.delete(`/api/notifications/${id}`)),
  getNotificationStats: () => makeApiRequest(() => api.get('/api/notifications/stats')),
};