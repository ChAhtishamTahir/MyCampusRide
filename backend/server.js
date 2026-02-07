/*
 * MyCampusRide Backend Server
 *
 * This is the main entry point for the backend server.
 * It sets up Express.js, connects to MongoDB, and configures all middleware and routes.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
// This allows us to keep sensitive information (like database URLs and secrets) secure
// Instead of hardcoding values, we read them from the .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Create Express application instance
// Express is a web framework that helps us build APIs easily
const app = express();

// CORS (Cross-Origin Resource Sharing) Configuration
// CORS allows our frontend (running on a different port) to communicate with this backend
// Without CORS, browsers block requests between different origins for security
app.use(cors({
  // Allow requests from the frontend URL
  // In development: http://localhost:3000 (or 5173 for Vite)
  // In production: your deployed frontend URL
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  // Allow cookies to be sent with requests (needed for authentication)
  credentials: true
}));

// Middleware Configuration
// Middleware functions run before our route handlers and help process requests

// express.json() - Parses incoming JSON data from request bodies
// This allows us to access req.body in our route handlers
app.use(express.json());

// express.urlencoded() - Parses URL-encoded data (like form submissions)
// extended: true allows for rich objects and arrays to be encoded
app.use(express.urlencoded({ extended: true }));

// cookieParser() - Parses cookies from incoming requests
// This is used for authentication (storing JWT tokens in cookies)
app.use(cookieParser());

// API Routes Configuration
// Each route file handles a specific domain of our application
// All routes are prefixed with /api/ for better organization

// Authentication routes - handles login, register, logout
app.use('/api/auth', require('./routes/auth'));

// User management routes - CRUD operations for users
app.use('/api/users', require('./routes/users'));

// Bus management routes - CRUD operations for buses
app.use('/api/buses', require('./routes/buses'));

// Route management routes - CRUD operations for bus routes
app.use('/api/routes', require('./routes/routes'));

// Tracking routes - handles real-time bus location tracking
app.use('/api/tracking', require('./routes/tracking'));

// Notification routes - handles sending and receiving notifications
app.use('/api/notifications', require('./routes/notifications'));

// Global Error Handling Middleware
// This catches any errors from route handlers and formats them consistently
// It must be defined AFTER all routes
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Health Check Endpoint
// This is a simple endpoint to verify the server is running
// Useful for monitoring and deployment health checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MyCampusRide Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Database Connection
// Connect to MongoDB using the connection string from environment variables
// This keeps the actual database URL secure and not hardcoded
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mycampusride';
console.log('Connecting to MongoDB...');

mongoose.connect(mongoUri)
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
  // If connection fails, log the error and exit the application
  // This prevents the server from running without a database connection
  console.error('❌ MongoDB connection error:', error.message);
  process.exit(1); // Exit code 1 indicates an error
});

// Server Configuration
// Use PORT from environment variables, or default to 5000 for local development
const PORT = process.env.PORT || 5000;

// Start the Express server
// This makes the server listen for incoming HTTP requests on the specified port
app.listen(PORT, () => {
  console.log(`🚌 MyCampusRide Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
