const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// Generate JWT Token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'AhtKhz1314MyCampusRideSecretKey2024';
  return jwt.sign({ userId }, secret, {
    expiresIn: '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, studentId, licenseNumber } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Check if student ID already exists for students
  if (role === 'student' && studentId) {
    const existingStudent = await User.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }
  }

  // Check if license number already exists for drivers
  if (role === 'driver' && licenseNumber) {
    const existingDriver = await User.findOne({ licenseNumber });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'License number already exists'
      });
    }
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    ...(role === 'student' && { studentId }),
    ...(role === 'driver' && { licenseNumber })
  });

  // Generate token
  const token = generateToken(user._id);

  // Set token in cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to false in development
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // More permissive for development
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if user is suspended
  if (user.status === 'suspended') {
    return res.status(401).json({
      success: false,
      message: 'Account is suspended. Please contact administrator.'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Set token in cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to false in development
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // More permissive for development
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON()
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'assignedBus',
      populate: [
        { path: 'driverId', select: 'name email phone' },
        { path: 'routeId', select: 'routeName routeNo stops timings departureTime' }
      ]
    })
    .populate('assignedRoute', 'routeName routeNo stops timings departureTime');

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { name, phone },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Get user with password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = asyncHandler(async (req, res) => {
  // Clear the token cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // More permissive for development
  });

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
};

