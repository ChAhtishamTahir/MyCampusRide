const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getNotificationStats,
  broadcastNotification,
  sendTargetedNotification
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly, adminOrDriver } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Public routes (authenticated users)
router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.get('/:id', getNotification);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

// Admin and Driver routes
router.post('/', adminOrDriver, createNotification);
router.post('/targeted', adminOrDriver, sendTargetedNotification);

// Admin only routes
router.post('/broadcast', adminOnly, broadcastNotification);

module.exports = router;




