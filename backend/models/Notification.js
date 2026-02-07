const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success', 'emergency'],
    default: 'info'
  },
  senderRole: {
    type: String,
    enum: ['admin', 'driver', 'system'],
    required: [true, 'Sender role is required']
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.senderRole !== 'system';
    }
  },
  receiverRole: {
    type: String,
    enum: ['admin', 'driver', 'student', 'all'],
    required: [true, 'Receiver role is required']
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  relatedEntity: {
    type: {
      type: String,
      enum: ['bus', 'route', 'user', 'trip']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Notifications expire after 30 days by default
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ receiverRole: 1, createdAt: -1 });
notificationSchema.index({ receiverId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ senderRole: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read method
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.statics.createSystemNotification = function(title, message, receiverRole, options = {}) {
  return this.create({
    title,
    message,
    type: options.type || 'info',
    senderRole: 'system',
    receiverRole,
    receiverId: options.receiverId || null,
    priority: options.priority || 'medium',
    relatedEntity: options.relatedEntity,
    metadata: options.metadata || {}
  });
};

module.exports = mongoose.model('Notification', notificationSchema);




