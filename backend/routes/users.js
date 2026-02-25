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
  getUserStats,
  getDriverLicense
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly, adminOrDriver } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Admin or Driver routes (drivers can view users assigned to their bus)
router.get('/', adminOrDriver, getUsers);
router.get('/stats', adminOnly, getUserStats);
router.get('/pending-drivers', adminOnly, getPendingDrivers);
router.get('/:id', adminOnly, getUser);
router.put('/:id', adminOnly, updateUser);
router.delete('/:id', adminOnly, deleteUser);
router.put('/:id/approve', adminOnly, approveDriver);
router.put('/:id/reject', adminOnly, rejectDriver);
router.get('/:id/license', adminOnly, getDriverLicense);

module.exports = router;




