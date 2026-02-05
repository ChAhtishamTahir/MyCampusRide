const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  approveDriver,
  rejectDriver,
  getPendingDrivers,
  getUserStats
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Admin only routes
router.get('/', adminOnly, getUsers);
router.get('/stats', adminOnly, getUserStats);
router.get('/pending-drivers', adminOnly, getPendingDrivers);
router.get('/:id', adminOnly, getUser);
router.put('/:id', adminOnly, updateUser);
router.delete('/:id', adminOnly, deleteUser);
router.put('/:id/approve', adminOnly, approveDriver);
router.put('/:id/reject', adminOnly, rejectDriver);

module.exports = router;




