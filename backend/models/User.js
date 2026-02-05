const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['admin', 'driver', 'student'],
    required: [true, 'Role is required'],
    default: 'student'
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^0\d{10}$/, 'Please enter a valid phone number (e.g., 03201033144)']
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended'],
    default: function() {
      if (this.role === 'admin') return 'active';
      if (this.role === 'driver') return 'pending';
      return 'active';
    }
  },
  studentId: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    unique: function() {
      return this.role === 'student';
    },
    sparse: true
  },
  feeStatus: {
    type: String,
    enum: ['paid', 'partially_paid', 'pending'],
    default: 'pending',
    required: function() {
      return this.role === 'student';
    }
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: false // Will be assigned later by admin
  },
  assignedBus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: false // Will be assigned later by admin
  },
  licenseNumber: {
    type: String,
    required: function() {
      return this.role === 'driver';
    }
  },
  // Student-specific fields
  routeNo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: false
  },
  stopName: {
    type: String,
    required: false
  },
  emergencyContact: {
    type: String,
    required: false,
    match: [/^0\d{10}$/, 'Please enter a valid phone number (e.g., 03201033144)'],
    validate: {
      validator: function(value) {
        // If emergencyContact is provided, validate it
        return !value || /^0\d{10}$/.test(value);
      },
      message: 'Please enter a valid phone number (e.g., 03201033144)'
    }
  },
  address: {
    type: String,
    required: false
  },
  feePaymentType: {
    type: String,
    enum: ['full', 'half', 'custom'],
    default: 'full',
    required: false
  },
  customInstallment: {
    type: Number,
    required: false
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);

