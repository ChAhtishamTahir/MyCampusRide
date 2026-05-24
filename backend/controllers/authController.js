/*
 * Authentication Controller
 *
 * This file handles all authentication-related operations:
 * - User registration (with role-specific validation)
 * - User login (with password verification)
 * - Admin secret code validation (for admin registration security)
 * - User logout
 *
 * SECURITY NOTE: Passwords are hashed before storage using bcrypt (in User model)
 */

const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const sendEmail = require('../utils/email');
const { sendTokenResponse, clearTokenCookie } = require('../utils/jwtHelper');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, studentId, licenseNumber, adminSecretCode } = req.body;

  // FILE VALIDATION
  const files = req.files || {};

  // 1. Profile Picture is now OPTIONAL
  // Removed mandatory check

  // 2. Driving License is mandatory for DRIVERS
  if (role === 'driver' && (!files.drivingLicense || files.drivingLicense.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Driving license PDF is required for driver registration'
    });
  }

  // ADMIN SECRET CODE VALIDATION
  // If registering as admin, validate the secret code
  // This prevents unauthorized users from creating admin accounts
  // The secret code is stored in the .env file: ADMIN_SECRET_CODE
  if (role === 'admin') {
    // Check if secret code was provided
    if (!adminSecretCode) {
      return res.status(400).json({
        success: false,
        message: 'Admin secret code is required to register as admin'
      });
    }

    // Get the secret code from environment variables
    const correctSecretCode = process.env.ADMIN_SECRET_CODE;

    // Validate the provided secret code
    if (adminSecretCode !== correctSecretCode) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin secret code. Please contact the system administrator.'
      });
    }
  }

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

  // Password validation
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one uppercase letter'
    });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one number'
    });
  }

  // Prepare user data
  const userData = {
    name,
    email,
    password,
    role,
    phone
  };

  if (files.profilePicture && files.profilePicture.length > 0) {
    userData.profilePicture = 'uploads/profiles/' + files.profilePicture[0].filename;
  }

  // Add role-specific fields
  if (role === 'student') {
    userData.studentId = studentId;
    userData.feeStatus = 'pending';
  } else if (role === 'driver') {
    userData.licenseNumber = licenseNumber;
    userData.drivingLicenseFile = 'uploads/licenses/' + files.drivingLicense[0].filename;
  }

  // Create user
  const user = new User(userData);
  const verifyToken = user.createEmailVerificationToken();
  await user.save();

  // Send verification email
  const verifyURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verifyToken}`;
  const message = `Please verify your email address by clicking the following link:\n\n${verifyURL}\n\nIf you did not request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'MyCampusRide - Verify your email address',
      message
    });
  } catch (err) {
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.error('Email send error:', err);
    return res.status(500).json({
      success: false,
      message: 'There was an error sending the verification email. Please try again later.'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
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

  // Check if user is verified
  if (!user.isVerified) {
    return res.status(401).json({
      success: false,
      message: 'Please verify your email address to log in'
    });
  }

  // Check if user is suspended
  if (user.status === 'suspended') {
    return res.status(401).json({
      success: false,
      message: 'Account is suspended. Please contact administrator.'
    });
  }

  // Send token response
  return sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  register,
  login,
  logout
};
