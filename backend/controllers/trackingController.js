/*
 * Tracking Controller
 *
 * Handles real-time bus tracking operations:
 * - Start trip (marks bus as on trip, sends notification to students)
 * - Stop trip (marks bus as available, calculates trip duration)
 * - Update bus location (real-time location updates during trip)
 * - Get bus location (for students tracking their bus)
 * - Get all bus locations (for admin dashboard map view)
 */

const Bus = require('../models/Bus');
const User = require('../models/User');
const Route = require('../models/Route');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Start trip
// @route   POST /api/tracking/start-trip
// @access  Private/Driver
const startTrip = asyncHandler(async (req, res) => {
  const driverId = req.user._id;

  // Find driver's assigned bus
  const bus = await Bus.findOne({ driverId })
    .populate('routeId', 'routeName stops departureTime estimatedDuration distance');

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'No bus assigned to you'
    });
  }

  if (bus.isOnTrip) {
    return res.status(400).json({
      success: false,
      message: 'Trip is already in progress'
    });
  }

  if (bus.status !== 'available') {
    return res.status(400).json({
      success: false,
      message: 'Bus is not available for trips'
    });
  }

  // Start trip
  bus.isOnTrip = true;
  bus.status = 'on_trip';
  bus.tripStartTime = new Date();
  await bus.save();

  // Emit Socket.io event for real-time updates
  if (req.io) {
    const tripData = {
      busId: bus._id,
      busNumber: bus.busNumber,
      routeId: bus.routeId._id,
      routeName: bus.routeId.routeName,
      tripStartTime: bus.tripStartTime
    };
    req.io.to(`route:${bus.routeId._id}`).emit('tripStarted', tripData);
    req.io.to('all-buses').emit('tripStarted', tripData);
  }

  // Create notification for students assigned to this bus
  const tripStartStudents = await User.find({ assignedBus: bus._id, role: 'student' }).select('_id');
  if (tripStartStudents.length > 0) {
    await Notification.insertMany(tripStartStudents.map(student => ({
      title: 'Trip Started',
      message: `Bus ${bus.busNumber} has started its trip on route ${bus.routeId.routeName}`,
      type: 'info',
      senderRole: 'system',
      receiverRole: 'student',
      receiverId: student._id,
      priority: 'medium',
      relatedEntity: { type: 'bus', id: bus._id },
      metadata: { routeId: bus.routeId._id }
    })));
  }

  res.json({
    success: true,
    message: 'Trip started successfully',
    data: {
      bus: bus,
      tripStartTime: bus.tripStartTime
    }
  });
});

// @desc    Stop trip
// @route   POST /api/tracking/stop-trip
// @access  Private/Driver
const stopTrip = asyncHandler(async (req, res) => {
  const driverId = req.user._id;

  // Find driver's assigned bus
  const bus = await Bus.findOne({ driverId })
    .populate('routeId', 'routeName stops departureTime estimatedDuration distance');

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'No bus assigned to you'
    });
  }

  if (!bus.isOnTrip) {
    return res.status(400).json({
      success: false,
      message: 'No trip in progress'
    });
  }

  // Calculate trip duration
  const tripDuration = new Date() - bus.tripStartTime;
  const tripDurationMinutes = Math.round(tripDuration / (1000 * 60));

  const routeId = bus.routeId._id;

  // Stop trip and clear stale location data
  bus.isOnTrip = false;
  bus.status = 'available';
  bus.tripStartTime = null;
  bus.currentLocation = {
    latitude: 0,
    longitude: 0,
    address: 'Location not available',
    speed: 0,
    heading: 0
  };
  await bus.save();

  // Emit Socket.io event for real-time updates
  if (req.io) {
    const tripData = {
      busId: bus._id,
      busNumber: bus.busNumber,
      routeId: routeId,
      routeName: bus.routeId.routeName,
      tripDuration: tripDurationMinutes
    };
    req.io.to(`route:${routeId}`).emit('tripStopped', tripData);
    req.io.to('all-buses').emit('tripStopped', tripData);
  }

  // Create notification for students assigned to this bus
  const tripStopStudents = await User.find({ assignedBus: bus._id, role: 'student' }).select('_id');
  if (tripStopStudents.length > 0) {
    await Notification.insertMany(tripStopStudents.map(student => ({
      title: 'Trip Completed',
      message: `Bus ${bus.busNumber} has completed its trip on route ${bus.routeId.routeName}. Duration: ${tripDurationMinutes} minutes`,
      type: 'success',
      senderRole: 'system',
      receiverRole: 'student',
      receiverId: student._id,
      priority: 'medium',
      relatedEntity: { type: 'bus', id: bus._id },
      metadata: { routeId: routeId }
    })));
  }

  res.json({
    success: true,
    message: 'Trip stopped successfully',
    data: {
      bus: bus,
      tripDuration: tripDurationMinutes
    }
  });
});

// @desc    Update bus location
// @route   PUT /api/tracking/update-location
// @access  Private/Driver
const updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude, address, speed, heading } = req.body;
  const driverId = req.user._id;

  // Validate coordinates
  if (latitude == null || longitude == null ||
    typeof latitude !== 'number' || typeof longitude !== 'number' ||
    !isFinite(latitude) || !isFinite(longitude) ||
    latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'
    });
  }

  // Find driver's assigned bus with route info
  const bus = await Bus.findOne({ driverId }).populate('routeId', 'routeName');

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'No bus assigned to you'
    });
  }

  if (!bus.isOnTrip) {
    return res.status(400).json({
      success: false,
      message: 'Cannot update location when not on a trip'
    });
  }

  // Update location with speed and heading
  bus.currentLocation = {
    latitude,
    longitude,
    address: address || 'Location not available',
    speed: speed || 0,
    heading: heading || 0
  };
  bus.lastLocationUpdate = new Date();
  await bus.save();

  // Emit Socket.io event for real-time location updates
  if (req.io && bus.routeId) {
    const locationData = {
      busId: bus._id,
      busNumber: bus.busNumber,
      routeId: bus.routeId._id,
      location: bus.currentLocation,
      lastUpdate: bus.lastLocationUpdate,
      tripStartTime: bus.tripStartTime
    };
    req.io.to(`route:${bus.routeId._id}`).emit('busLocationUpdate', locationData);
    req.io.to('all-buses').emit('busLocationUpdate', locationData);
  }

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: {
      bus: bus,
      location: bus.currentLocation,
      lastUpdate: bus.lastLocationUpdate
    }
  });
});

// @desc    Get bus location
// @route   GET /api/tracking/bus/:busId
// @access  Private
const getBusLocation = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.busId)
    .populate('driverId', 'name phone')
    .populate('routeId', 'routeName stops');

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  res.json({
    success: true,
    data: {
      bus: bus,
      location: bus.currentLocation,
      isOnTrip: bus.isOnTrip,
      lastUpdate: bus.lastLocationUpdate,
      tripStartTime: bus.tripStartTime
    }
  });
});

// @desc    Get all active bus locations
// @route   GET /api/tracking/active-buses
// @access  Private
const getActiveBusLocations = asyncHandler(async (req, res) => {
  const activeBuses = await Bus.find({
    isOnTrip: true,
    status: 'on_trip'
  })
    .populate('driverId', 'name phone')
    .populate('routeId', 'routeName stops departureTime estimatedDuration distance');

  const busLocations = activeBuses.map(bus => ({
    busId: bus._id,
    busNumber: bus.busNumber,
    driver: bus.driverId,
    route: bus.routeId,
    location: bus.currentLocation,
    isOnTrip: bus.isOnTrip,
    lastUpdate: bus.lastLocationUpdate,
    tripStartTime: bus.tripStartTime
  }));

  res.json({
    success: true,
    data: busLocations
  });
});

// @desc    Get simulated bus locations (for when Google Maps API is not available)
// @route   GET /api/tracking/simulate
// @access  Private
const getSimulatedLocations = asyncHandler(async (req, res) => {
  const { routeId } = req.query;

  let buses;
  if (routeId) {
    buses = await Bus.find({ routeId, isOnTrip: true })
      .populate('driverId', 'name phone')
      .populate('routeId', 'routeName stops departureTime estimatedDuration distance');
  } else {
    buses = await Bus.find({ isOnTrip: true })
      .populate('driverId', 'name phone')
      .populate('routeId', 'routeName stops departureTime estimatedDuration distance');
  }

  // Generate simulated locations along the route
  const simulatedLocations = buses.map(bus => {
    const route = bus.routeId;
    const stops = route.stops || [];

    if (stops.length === 0) {
      return {
        busId: bus._id,
        busNumber: bus.busNumber,
        driver: bus.driverId,
        route: bus.routeId,
        location: {
          latitude: 30.032 + (Math.random() - 0.5) * 0.01,
          longitude: 72.316 + (Math.random() - 0.5) * 0.01,
          address: 'COMSATS Vehari (Simulated)'
        },
        isOnTrip: bus.isOnTrip,
        lastUpdate: new Date(),
        tripStartTime: bus.tripStartTime,
        isSimulated: true
      };
    }

    // Pick a random stop or interpolate between stops
    const randomStopIndex = Math.floor(Math.random() * stops.length);
    const currentStop = stops[randomStopIndex];

    // Add some random offset to simulate movement
    const latOffset = (Math.random() - 0.5) * 0.001;
    const lngOffset = (Math.random() - 0.5) * 0.001;

    // Guard against stops without coordinates
    const hasCoords = typeof currentStop.latitude === 'number' && typeof currentStop.longitude === 'number';

    return {
      busId: bus._id,
      busNumber: bus.busNumber,
      driver: bus.driverId,
      route: bus.routeId,
      location: {
        latitude: hasCoords ? currentStop.latitude + latOffset : 30.032 + latOffset * 10,
        longitude: hasCoords ? currentStop.longitude + lngOffset : 72.316 + lngOffset * 10,
        address: currentStop.address || 'COMSATS Vehari (Simulated)'
      },
      isOnTrip: bus.isOnTrip,
      lastUpdate: new Date(),
      tripStartTime: bus.tripStartTime,
      isSimulated: true,
      currentStop: currentStop
    };
  });

  res.json({
    success: true,
    data: simulatedLocations,
    message: 'Simulated locations generated'
  });
});

// @desc    Get driver's trip status
// @route   GET /api/tracking/my-trip
// @access  Private/Driver
const getMyTripStatus = asyncHandler(async (req, res) => {
  const driverId = req.user._id;

  const bus = await Bus.findOne({ driverId })
    .populate('routeId', 'routeName stops departureTime estimatedDuration distance');

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'No bus assigned to you'
    });
  }

  const tripData = {
    bus: bus,
    isOnTrip: bus.isOnTrip,
    tripStartTime: bus.tripStartTime,
    currentLocation: bus.currentLocation,
    lastLocationUpdate: bus.lastLocationUpdate,
    tripDuration: bus.isOnTrip && bus.tripStartTime
      ? Math.round((new Date() - bus.tripStartTime) / (1000 * 60))
      : 0
  };

  res.json({
    success: true,
    data: tripData
  });
});

// @desc    Get student's trip status (looks up the student's assigned bus)
// @route   GET /api/tracking/student-trip-status
// @access  Private (any authenticated user)
const getStudentTripStatus = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user._id).populate('assignedBus');

  if (!student || !student.assignedBus) {
    return res.status(404).json({
      success: false,
      message: 'No bus assigned to you'
    });
  }

  const bus = await Bus.findById(student.assignedBus._id || student.assignedBus)
    .populate('routeId', 'routeName stops')
    .populate('driverId', 'name phone');

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Assigned bus not found'
    });
  }

  res.json({
    success: true,
    data: {
      bus,
      isOnTrip: bus.isOnTrip,
      currentLocation: bus.currentLocation,
      lastLocationUpdate: bus.lastLocationUpdate,
      tripStartTime: bus.tripStartTime
    }
  });
});

module.exports = {
  startTrip,
  stopTrip,
  updateLocation,
  getBusLocation,
  getActiveBusLocations,
  getSimulatedLocations,
  getMyTripStatus,
  getStudentTripStatus
};




