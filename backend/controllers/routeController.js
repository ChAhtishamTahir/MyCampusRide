/*
 * Route Management Controller
 *
 * Handles all route-related operations:
 * - Get all routes (with filtering and pagination)
 * - Get single route details
 * - Create new route (with stop validation)
 * - Update route information
 * - Delete route
 */

const Route = require('../models/Route');
const Bus = require('../models/Bus');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all routes
// @route   GET /api/routes
// @access  Private
const getRoutes = asyncHandler(async (req, res) => {
  const { isActive, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get routes with pagination
  const routes = await Route.find(filter)
    .populate('assignedBuses', 'busNumber driverId')
    .sort({ routeName: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Route.countDocuments(filter);

  res.json({
    success: true,
    data: routes,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Private
const getRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id)
    .populate('assignedBuses', 'busNumber driverId capacity');

  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  res.json({
    success: true,
    data: route
  });
});

// @desc    Create new route
// @route   POST /api/routes
// @access  Private/Admin
const createRoute = asyncHandler(async (req, res) => {
  const { 
    routeNo,
    routeName, 
    description, 
    stops, 
    departureTime, 
    distance, 
    estimatedDuration, 
    color 
  } = req.body;

  // Check if route number already exists
  if (routeNo) {
    const existingRouteNo = await Route.findOne({ routeNo });
    if (existingRouteNo) {
      return res.status(400).json({
        success: false,
        message: 'Route number already exists'
      });
    }
  }

  // Check if route name already exists
  if (routeName) {
    const existingRouteName = await Route.findOne({ routeName });
    if (existingRouteName) {
      return res.status(400).json({
        success: false,
        message: 'Route name already exists'
      });
    }
  }

  // Validate stops (allow routes without stops initially)
  if (stops && stops.length > 0) {
    // Validate stop sequences
    const sequences = stops.map(stop => stop.sequence);
    const uniqueSequences = [...new Set(sequences)];
    if (sequences.length !== uniqueSequences.length) {
      return res.status(400).json({
        success: false,
        message: 'Stop sequences must be unique'
      });
    }
  }

  // Create route
  const route = await Route.create({
    routeNo,
    routeName,
    description,
    stops: stops || [],
    departureTime,
    distance,
    estimatedDuration,
    color
  });

  res.status(201).json({
    success: true,
    message: 'Route created successfully',
    data: route
  });
});

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private/Admin
const updateRoute = asyncHandler(async (req, res) => {
  const { 
    routeNo,
    routeName, 
    description, 
    stops, 
    departureTime, 
    distance, 
    estimatedDuration, 
    color,
    isActive 
  } = req.body;
  
  const route = await Route.findById(req.params.id);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  // Check if routeNo or routeName is being changed to a value that already exists
  if (routeNo && routeNo !== route.routeNo) {
    const existingRouteNo = await Route.findOne({ routeNo });
    if (existingRouteNo) {
      return res.status(400).json({
        success: false,
        message: 'Route number already exists'
      });
    }
  }

  if (routeName && routeName !== route.routeName) {
    const existingRouteName = await Route.findOne({ routeName });
    if (existingRouteName) {
      return res.status(400).json({
        success: false,
        message: 'Route name already exists'
      });
    }
  }

  // Validate stops if provided
  if (stops && stops.length > 0) {
    // Validate stop sequences
    const sequences = stops.map(stop => stop.sequence);
    const uniqueSequences = [...new Set(sequences)];
    if (sequences.length !== uniqueSequences.length) {
      return res.status(400).json({
        success: false,
        message: 'Stop sequences must be unique'
      });
    }
  }

  // Update route
  const updatedRoute = await Route.findByIdAndUpdate(
    req.params.id,
    { 
      routeNo,
      routeName, 
      description, 
      stops, 
      departureTime, 
      distance, 
      estimatedDuration, 
      color,
      isActive 
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Route updated successfully',
    data: updatedRoute
  });
});

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private/Admin
const deleteRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  // Check if route has assigned buses
  const assignedBuses = await Bus.find({ routeId: req.params.id });
  if (assignedBuses.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete route that has assigned buses. Please reassign buses first.'
    });
  }

  // Check if route has assigned students
  const assignedStudents = await User.find({ 
    role: 'student', 
    assignedRoute: req.params.id 
  });
  if (assignedStudents.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete route that has assigned students. Please reassign students first.'
    });
  }

  await Route.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Route deleted successfully'
  });
});

// @desc    Get active routes
// @route   GET /api/routes/active
// @access  Private
const getActiveRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find({ isActive: true })
    .populate('assignedBuses', 'busNumber driverId capacity')
    .sort({ routeName: 1 });

  res.json({
    success: true,
    data: routes
  });
});

// @desc    Get route statistics
// @route   GET /api/routes/stats
// @access  Private/Admin
const getRouteStats = asyncHandler(async (req, res) => {
  const totalRoutes = await Route.countDocuments();
  const activeRoutes = await Route.countDocuments({ isActive: true });
  const inactiveRoutes = await Route.countDocuments({ isActive: false });

  // Get routes with bus assignments
  const routesWithBuses = await Route.aggregate([
    {
      $lookup: {
        from: 'buses',
        localField: '_id',
        foreignField: 'routeId',
        as: 'buses'
      }
    },
    {
      $project: {
        routeName: 1,
        busCount: { $size: '$buses' },
        isActive: 1
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      total: totalRoutes,
      active: activeRoutes,
      inactive: inactiveRoutes,
      routesWithBuses
    }
  });
});

// @desc    Assign bus to route
// @route   PUT /api/routes/:id/assign-bus
// @access  Private/Admin
const assignBusToRoute = asyncHandler(async (req, res) => {
  const { busId } = req.body;
  
  const route = await Route.findById(req.params.id);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  const bus = await Bus.findById(busId);
  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  // Check if bus is already assigned to this route
  if (bus.routeId.toString() === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'Bus is already assigned to this route'
    });
  }

  // Update bus route assignment
  bus.routeId = req.params.id;
  await bus.save();

  // Add bus to route's assigned buses if not already present
  if (!route.assignedBuses.includes(busId)) {
    route.assignedBuses.push(busId);
    await route.save();
  }

  res.json({
    success: true,
    message: 'Bus assigned to route successfully',
    data: {
      route: route,
      bus: bus
    }
  });
});

module.exports = {
  getRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
  getActiveRoutes,
  getRouteStats,
  assignBusToRoute
};




