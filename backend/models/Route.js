const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Stop name is required'],
    trim: true
  },
  latitude: {
    type: Number,
    required: false
  },
  longitude: {
    type: Number,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  sequence: {
    type: Number,
    required: [true, 'Stop sequence is required'],
    min: [1, 'Sequence must be at least 1']
  },
  pickupTime: {
    type: String,
    required: [true, 'Pickup time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  fee: {
    type: Number,
    required: [true, 'Fee is required'],
    min: [0, 'Fee cannot be negative']
  }
});

const routeSchema = new mongoose.Schema({
  routeNo: {
    type: String,
    required: [true, 'Route number is required'],
    unique: true,
    trim: true
  },
  routeName: {
    type: String,
    required: [true, 'Route name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  stops: [stopSchema],
  departureTime: {
    type: String,
    required: [true, 'Departure time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  distance: {
    type: Number,
    required: [true, 'Route distance is required'],
    min: [0.1, 'Distance must be at least 0.1 km']
  },
  estimatedDuration: {
    type: Number,
    required: [true, 'Estimated duration is required'],
    min: [5, 'Duration must be at least 5 minutes']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code']
  },
  assignedBuses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  }],
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

// Index for efficient queries (routeName already has unique index)
routeSchema.index({ isActive: 1 });


module.exports = mongoose.model('Route', routeSchema);
