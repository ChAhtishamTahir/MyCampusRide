const express = require('express');
const router = express.Router();
const {
  getBuses,
  getBus,
  createBus,
  updateBus,
  deleteBus,
  getBusesByDriver,
  getBusesByRoute,
  getActiveBuses,
  getBusStats
} = require('../controllers/busController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly, adminOrDriver } = require('../middleware/roleMiddleware');

// Public routes (accessible without authentication for registration)
router.get('/route/:routeId', getBusesByRoute);

// All routes require authentication from this point
router.use(authMiddleware);

// Authenticated routes
router.get('/', getBuses);
router.get('/active', getActiveBuses);
router.get('/driver/:driverId', getBusesByDriver);
router.get('/:id', getBus);

// Admin only routes
router.post('/', adminOnly, createBus);
router.put('/:id', adminOnly, updateBus);
router.delete('/:id', adminOnly, deleteBus);
router.get('/stats/overview', adminOnly, getBusStats);

module.exports = router;




