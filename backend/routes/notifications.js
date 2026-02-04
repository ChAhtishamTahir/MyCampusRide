const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  sendNotification,
  deleteNotification,
  getNotificationStats
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

// Send notification route (admin or driver)
router.post('/', adminOrDriver, sendNotification);

module.exports = router;




