const Notification = require('../models/Notification');
const User = require('../models/User');
const Bus = require('../models/Bus');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { isRead, type, priority, page = 1, limit = 20 } = req.query;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Build filter object
  const filter = {
    $or: [
      { receiverId: userId },
      { receiverRole: userRole },
      { receiverRole: 'all' }
    ]
  };
  
  // For admin users, also include notifications intended for admins
  if (userRole === 'admin') {
    filter.$or.push({
      'metadata.intendedRole': 'admin'
    });
  }

  if (isRead !== undefined) filter.isRead = isRead === 'true';
  if (type) filter.type = type;
  if (priority) filter.priority = priority;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get notifications with pagination
  const notifications = await Notification.find(filter)
    .populate('senderId', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Notification.countDocuments(filter);

  // Get unread count
  const unreadCount = await Notification.countDocuments({
    ...filter,
    isRead: false
  });

  res.json({
    success: true,
    data: notifications,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    },
    unreadCount
  });
});

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
const getNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
    .populate('senderId', 'name email role');

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Check if user has access to this notification
  const userId = req.user._id;
  const userRole = req.user.role;
  
  const hasAccess = 
    notification.receiverId && notification.receiverId.toString() === userId.toString() ||
    notification.receiverRole === userRole ||
    notification.receiverRole === 'all' ||
    (userRole === 'admin' && notification.metadata?.intendedRole === 'admin');

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this notification'
    });
  }

  res.json({
    success: true,
    data: notification
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Check if user has access to this notification
  const userId = req.user._id;
  const userRole = req.user.role;
  
  const hasAccess = 
    notification.receiverId && notification.receiverId.toString() === userId.toString() ||
    notification.receiverRole === userRole ||
    notification.receiverRole === 'all' ||
    (userRole === 'admin' && notification.metadata?.intendedRole === 'admin');

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this notification'
    });
  }

  // Mark as read
  await notification.markAsRead();

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  const filter = {
    $or: [
      { receiverId: userId },
      { receiverRole: userRole },
      { receiverRole: 'all' }
    ],
    isRead: false
  };
  
  // For admin users, also include notifications intended for admins
  if (userRole === 'admin') {
    filter.$or.push({
      'metadata.intendedRole': 'admin'
    });
  };

  const result = await Notification.updateMany(filter, {
    isRead: true,
    readAt: new Date()
  });

  res.json({
    success: true,
    message: `${result.modifiedCount} notifications marked as read`
  });
});

// @desc    Create notification (Admin/Driver only)
// @route   POST /api/notifications
// @access  Private/Admin/Driver
const sendTargetedNotification = asyncHandler(async (req, res) => {
  console.log('=== TARGETED NOTIFICATION CONTROLLER CALLED ===');
  console.log('Request body:', req.body);
  console.log('User:', req.user);
  
  const { title, message, type, priority, targetType } = req.body;
  
  const senderId = req.user._id;
  const senderRole = req.user.role;
  
  console.log('Target type:', targetType);
  console.log('Sender role:', senderRole);
  
  // Only drivers can use targeted notifications
  if (senderRole !== 'driver') {
    return res.status(403).json({
      success: false,
      message: 'Only drivers can send targeted notifications'
    });
  }
  
  // Validate target type
  if (!['students', 'admin'].includes(targetType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid target type. Must be "students" or "admin"'
    });
  }
  
  try {
    const notifications = [];
    
    if (targetType === 'students') {
      // Find driver's assigned bus
      const bus = await Bus.findOne({ driverId: senderId }).populate('routeId');
      
      if (!bus) {
        return res.status(404).json({
          success: false,
          message: 'No bus assigned to you'
        });
      }
      
      // Find students assigned to this bus/route
      const students = await User.find({
        role: 'student',
        assignedBus: bus._id
      });
      
      console.log(`Found ${students.length} students for bus ${bus.busNumber}`);
      
      // Create individual notifications for each student
      for (const student of students) {
        console.log(`Creating notification for student:`, student._id, student.name);
        
        const notificationData = {
          title,
          message,
          type: type || 'info',
          senderRole,
          senderId,
          receiverRole: 'student',
          receiverId: student._id,
          priority: priority || 'medium',
          relatedEntity: {
            type: 'bus',
            id: bus._id
          },
          metadata: {
            busNumber: bus.busNumber,
            routeName: bus.routeId?.routeName || 'Unknown Route'
          }
        };
        
        console.log('Notification data:', notificationData);
        
        try {
          const notification = await Notification.create(notificationData);
          notifications.push(notification);
          console.log('Successfully created notification:', notification._id);
        } catch (createError) {
          console.error('Error creating notification for student:', student._id, createError);
          throw createError;
        }
      }
      
      // Also send a copy to admin
      const adminNotification = await Notification.create({
        title: `[Driver: ${req.user.name}] ${title}`,
        message: `To students on bus ${bus.busNumber}: ${message}`,
        type: 'info',
        senderRole: 'driver',
        senderId,
        receiverRole: 'all', // Use 'all' so we can set receiverId to null
        receiverId: null,
        priority: priority || 'medium',
        relatedEntity: {
          type: 'bus',
          id: bus._id
        },
        metadata: {
          intendedRole: 'admin', // Custom field to indicate this is for admins
          originalTarget: 'students',
          busNumber: bus.busNumber,
          routeName: bus.routeId?.routeName || 'Unknown Route',
          studentCount: students.length
        }
      });
      notifications.push(adminNotification);
      
    } else if (targetType === 'admin') {
      // Send directly to admin (use 'all' role so receiverId is not required)
      const adminNotification = await Notification.create({
        title: `[Driver: ${req.user.name}] ${title}`,
        message,
        type: type || 'info',
        senderRole: 'driver',
        senderId,
        receiverRole: 'all', // Use 'all' so we can set receiverId to null
        receiverId: null,
        priority: priority || 'medium',
        metadata: {
          intendedRole: 'admin', // Custom field to indicate this is for admins
          driverName: req.user.name
        }
      });
      notifications.push(adminNotification);
    }
    
    // Populate sender information
    await Promise.all(notifications.map(notification => 
      notification.populate('senderId', 'name email role')
    ));
    
    res.status(201).json({
      success: true,
      message: `Notification sent to ${notifications.length} recipient(s)` + 
               (targetType === 'students' ? ` (${notifications.length - 1} students + 1 admin copy)` : ''),
      data: notifications
    });
    
  } catch (error) {
    console.error('Error sending targeted notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

const createNotification = asyncHandler(async (req, res) => {
  console.log('=== CREATE NOTIFICATION CONTROLLER CALLED ===');
  console.log('Request body:', req.body);
  console.log('User:', req.user);
  
  const { 
    title, 
    message, 
    type, 
    receiverRole, 
    receiverId, 
    priority,
    relatedEntity 
  } = req.body;

  const senderId = req.user._id;
  const senderRole = req.user.role;

  // Validate receiver
  if (receiverRole === 'admin' && senderRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can send notifications to other admins'
    });
  }

  // If specific receiver is provided, validate they exist
  if (receiverId) {
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Validate receiver role matches
    if (receiver.role !== receiverRole) {
      return res.status(400).json({
        success: false,
        message: 'Receiver role does not match specified role'
      });
    }
  }

  const notification = await Notification.create({
    title,
    message,
    type: type || 'info',
    senderRole,
    senderId,
    receiverRole,
    receiverId,
    priority: priority || 'medium',
    relatedEntity
  });

  // Populate sender information
  await notification.populate('senderId', 'name email role');

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: notification
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Check if user has access to delete this notification
  const userId = req.user._id;
  const userRole = req.user.role;
  
  const hasAccess = 
    notification.receiverId && notification.receiverId.toString() === userId.toString() ||
    notification.receiverRole === userRole ||
    notification.receiverRole === 'all' ||
    userRole === 'admin';

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to delete this notification'
    });
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
const getNotificationStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  const filter = {
    $or: [
      { receiverId: userId },
      { receiverRole: userRole },
      { receiverRole: 'all' }
    ]
  };

  const stats = await Notification.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        },
        byType: {
          $push: {
            type: '$type',
            isRead: '$isRead'
          }
        },
        byPriority: {
          $push: {
            priority: '$priority',
            isRead: '$isRead'
          }
        }
      }
    }
  ]);

  const result = stats[0] || { total: 0, unread: 0, byType: [], byPriority: [] };

  // Count by type
  const typeCounts = {};
  result.byType.forEach(item => {
    if (!typeCounts[item.type]) {
      typeCounts[item.type] = { total: 0, unread: 0 };
    }
    typeCounts[item.type].total++;
    if (!item.isRead) typeCounts[item.type].unread++;
  });

  // Count by priority
  const priorityCounts = {};
  result.byPriority.forEach(item => {
    if (!priorityCounts[item.priority]) {
      priorityCounts[item.priority] = { total: 0, unread: 0 };
    }
    priorityCounts[item.priority].total++;
    if (!item.isRead) priorityCounts[item.priority].unread++;
  });

  res.json({
    success: true,
    data: {
      total: result.total,
      unread: result.unread,
      byType: typeCounts,
      byPriority: priorityCounts
    }
  });
});

// @desc    Broadcast notification (Admin only)
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, type, priority, targetRoles } = req.body;

  if (!targetRoles || targetRoles.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Target roles are required for broadcast'
    });
  }

  const notifications = [];

  // Create notifications for each target role
  for (const role of targetRoles) {
    const notification = await Notification.create({
      title,
      message,
      type: type || 'info',
      senderRole: 'admin',
      senderId: req.user._id,
      receiverRole: role,
      receiverId: null, // Broadcast to all users of this role
      priority: priority || 'medium'
    });
    notifications.push(notification);
  }

  res.status(201).json({
    success: true,
    message: `Broadcast notification sent to ${notifications.length} role(s)`,
    data: notifications
  });
});

module.exports = {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getNotificationStats,
  broadcastNotification,
  sendTargetedNotification
};




