/*
 * User Management Controller
 *
 * This file handles all user-related operations (admin only):
 * - Get all users (with filtering and pagination)
 * - Get single user details
 * - Update user (with AUTOMATIC FEE NOTES generation)
 * - Delete user
 * - Approve/reject driver applications
 *
 * IMPORTANT: The updateUser function automatically tracks all fee-related changes:
 * - When feeStatus changes: Records "Fee marked as [status] by [admin] on [date]"
 * - When assignedRoute changes: Records "Assigned to route [name] by [admin] on [date]"
 * - When assignedBus changes: Records "Assigned to bus [number] by [admin] on [date]"
 * This creates an audit trail that helps admins track fee management history.
 */

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
        { path: 'routeId', select: 'routeName routeNo stops departureTime estimatedDuration distance' }
      ]
    })
    .populate('assignedRoute', 'routeName routeNo stops departureTime estimatedDuration distance');

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

  // Find the existing user to compare changes
  const user = await User.findById(req.params.id)
    .populate('assignedRoute', 'routeName')
    .populate('assignedBus', 'busNumber');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get the admin who is making this update
  const adminName = req.user.name; // The logged-in admin's name
  const adminId = req.user._id;

  // Generate timestamp for the note
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Initialize variables for tracking changes
  let feeNoteEntries = [];

  // AUTOMATIC FEE NOTES GENERATION
  // Check if feeStatus changed
  if (feeStatus && feeStatus !== user.feeStatus) {
    const statusMap = {
      'paid': 'Paid',
      'partially_paid': 'Partially Paid',
      'pending': 'Pending'
    };
    feeNoteEntries.push(
      `Fee marked as ${statusMap[feeStatus]} by ${adminName} on ${timestamp}`
    );
  }

  // Check if assignedRoute changed
  if (assignedRoute !== undefined) {
    // Convert to string for comparison
    const oldRouteId = user.assignedRoute?._id?.toString();
    const newRouteId = assignedRoute?.toString();

    if (oldRouteId !== newRouteId) {
      if (!newRouteId) {
        // Route was removed
        feeNoteEntries.push(
          `Unassigned from route by ${adminName} on ${timestamp}`
        );
      } else {
        // Route was changed or newly assigned
        const routeData = await Route.findById(newRouteId);
        if (routeData) {
          feeNoteEntries.push(
            `Assigned to route "${routeData.routeName}" by ${adminName} on ${timestamp}`
          );
        }
      }
    }
  }

  // Check if assignedBus changed
  if (assignedBus !== undefined) {
    // Convert to string for comparison
    const oldBusId = user.assignedBus?._id?.toString();
    const newBusId = assignedBus?.toString();

    if (oldBusId !== newBusId) {
      if (!newBusId) {
        // Bus was removed
        feeNoteEntries.push(
          `Unassigned from bus by ${adminName} on ${timestamp}`
        );
      } else {
        // Bus was changed or newly assigned
        const busData = await Bus.findById(newBusId);
        if (busData) {
          feeNoteEntries.push(
            `Assigned to bus "${busData.busNumber}" by ${adminName} on ${timestamp}`
          );
        }
      }
    }
  }

  // Build the update object
  const updateData = { name, email, phone, status, feeStatus, assignedRoute, assignedBus };

  // If there were any fee-related changes, append to feeNotes
  if (feeNoteEntries.length > 0) {
    const newNote = feeNoteEntries.join('\n');
    const existingNotes = user.feeNotes || '';

    // Append new notes to existing notes (with separator if notes already exist)
    updateData.feeNotes = existingNotes
      ? `${existingNotes}\n${newNote}`
      : newNote;

    // Update fee tracking fields
    updateData.feeUpdatedAt = new Date();
    updateData.feeUpdatedBy = adminId;
  }

  // Update user with all changes including automatic fee notes
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate({
    path: 'assignedBus',
    select: 'busNumber model year',
    populate: [
      { path: 'driverId', select: 'name' },
      { path: 'routeId', select: 'routeName routeNo' }
    ]
  })
   .populate('assignedRoute', 'routeName routeNo')
   .populate('feeUpdatedBy', 'name email');

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




