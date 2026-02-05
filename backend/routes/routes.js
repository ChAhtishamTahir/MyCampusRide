const express = require('express');
const router = express.Router();
const {
  getRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
  getActiveRoutes,
  getRouteStats,
  assignBusToRoute
} = require('../controllers/routeController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// Public routes (accessible without authentication for registration)
router.get('/active', getActiveRoutes);
router.get('/:id', getRoute);

// All routes require authentication from this point
router.use(authMiddleware);

// Authenticated routes
router.get('/', getRoutes);

// Admin only routes
router.post('/', adminOnly, createRoute);
router.put('/:id', adminOnly, updateRoute);
router.delete('/:id', adminOnly, deleteRoute);
router.get('/stats/overview', adminOnly, getRouteStats);
router.put('/:id/assign-bus', adminOnly, assignBusToRoute);

module.exports = router;




