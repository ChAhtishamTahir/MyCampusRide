const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
// dotenv.config();
// dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Configure CORS to allow credentials
app.use(cors({
  // origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/buses', require('./routes/buses'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/notifications', require('./routes/notifications'));

// Error handling middleware
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MyCampusRide Backend is running',
    timestamp: new Date().toISOString()
  });
});


console.log('Mongo URI:', process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mycampusride')
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Seed admin user after successful connection
  require('./utils/seedAdmin');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});





const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚌 MyCampusRide Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
