const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { role, status, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get users with pagination
  const users = await User.find(filter)
    .populate({
      path: 'assignedBus',
      select: 'busNumber model year capacity',
      populate: [
        { path: 'driverId', select: 'name email phone' },
        { path: 'routeId', select: 'routeName routeNo' }
      ]
    })
    .populate('assignedRoute', 'routeName routeNo')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: users,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: 'assignedBus',
      populate: [
        { path: 'driverId', select: 'name email phone' },
        { path: 'routeId', select: 'routeName routeNo stops timings departureTime' }
      ]
    })
    .populate('assignedRoute', 'routeName routeNo stops timings departureTime');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, status, feeStatus, assignedRoute, assignedBus } = req.body;
  
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, phone, status, feeStatus, assignedRoute, assignedBus },
    { new: true, runValidators: true }
  ).populate({
    path: 'assignedBus',
    select: 'busNumber model year',
    populate: [
      { path: 'driverId', select: 'name' },
      { path: 'routeId', select: 'routeName routeNo' }
    ]
  })
   .populate('assignedRoute', 'routeName routeNo');

  res.json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Don't allow deleting admin users
  if (user.role === 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete admin users'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Approve driver
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
const approveDriver = asyncHandler(async (req, res) => {
  const driver = await User.findById(req.params.id);
  
  if (!driver) {
    return res.status(404).json({
      success: false,
      message: 'Driver not found'
    });
  }

  if (driver.role !== 'driver') {
    return res.status(400).json({
      success: false,
      message: 'User is not a driver'
    });
  }

  if (driver.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Driver is not pending approval'
    });
  }

  // Update driver status
  driver.status = 'active';
  await driver.save();

  // Create notification for driver
  await Notification.createSystemNotification(
    'Account Approved',
    'Your driver account has been approved. You can now access all driver features.',
    'driver',
    {
      receiverId: driver._id,
      type: 'success',
      priority: 'high'
    }
  );

  res.json({
    success: true,
    message: 'Driver approved successfully',
    data: driver
  });
});

// @desc    Reject driver
// @route   PUT /api/users/:id/reject
// @access  Private/Admin
const rejectDriver = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const driver = await User.findById(req.params.id);
  
  if (!driver) {
    return res.status(404).json({
      success: false,
      message: 'Driver not found'
    });
  }

  if (driver.role !== 'driver') {
    return res.status(400).json({
      success: false,
      message: 'User is not a driver'
    });
  }

  if (driver.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Driver is not pending approval'
    });
  }

  // Update driver status
  driver.status = 'suspended';
  await driver.save();

  // Create notification for driver
  await Notification.createSystemNotification(
    'Account Rejected',
    `Your driver account application has been rejected. Reason: ${reason || 'No reason provided'}`,
    'driver',
    {
      receiverId: driver._id,
      type: 'error',
      priority: 'high'
    }
  );

  res.json({
    success: true,
    message: 'Driver rejected successfully',
    data: driver
  });
});

// @desc    Get pending drivers
// @route   GET /api/users/pending-drivers
// @access  Private/Admin
const getPendingDrivers = asyncHandler(async (req, res) => {
  const pendingDrivers = await User.find({ 
    role: 'driver', 
    status: 'pending' 
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: pendingDrivers
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        suspended: {
          $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
        }
      }
    }
  ]);

  const totalUsers = await User.countDocuments();
  const totalActive = await User.countDocuments({ status: 'active' });
  const totalPending = await User.countDocuments({ status: 'pending' });
  const totalSuspended = await User.countDocuments({ status: 'suspended' });

  res.json({
    success: true,
    data: {
      total: totalUsers,
      active: totalActive,
      pending: totalPending,
      suspended: totalSuspended,
      byRole: stats
    }
  });
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  approveDriver,
  rejectDriver,
  getPendingDrivers,
  getUserStats
};




