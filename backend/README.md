# MyCampusRide Backend Documentation

This is the backend server for MyCampusRide, built with Node.js, Express.js, and MongoDB.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Environment Variables](#environment-variables)
- [Testing with Postman](#testing-with-postman)
- [Security Features](#security-features)
- [Common Errors](#common-errors)

## Architecture Overview

The backend follows the MVC (Model-View-Controller) pattern:

- **Models**: Define the structure of data in MongoDB (User, Bus, Route, Notification)
- **Controllers**: Handle business logic for each feature
- **Routes**: Define API endpoints and connect them to controllers
- **Middleware**: Handle authentication, authorization, and error handling

### Request Flow

```
Client Request → Routes → Middleware (Auth) → Controller → Model → MongoDB
                    ↓
                Response
```

## Folder Structure

```
backend/
├── controllers/              # Business logic for each feature
│   ├── authController.js    # Login, register, get current user
│   ├── userController.js    # User CRUD + automatic fee notes
│   ├── busController.js     # Bus CRUD + driver/route assignment
│   ├── routeController.js   # Route CRUD + stop management
│   ├── trackingController.js # Real-time location tracking
│   └── notificationController.js # Notification management
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   ├── roleMiddleware.js    # Role-based access control
│   └── errorHandler.js      # Global error handling
├── models/                   # MongoDB schemas
│   ├── User.js              # User model (student/driver/admin)
│   ├── Bus.js               # Bus model
│   ├── Route.js             # Route model with stops
│   └── Notification.js      # Notification model
├── routes/                   # API endpoint definitions
│   ├── auth.js
│   ├── users.js
│   ├── buses.js
│   ├── routes.js
│   ├── tracking.js
│   └── notifications.js
├── .env                      # Environment variables (YOU MUST CREATE THIS)
├── .env.example             # Template for .env
├── server.js                # Main server file
└── package.json             # Dependencies
```

## Database Models

### User Model

Stores all users (admins, drivers, students) with role-based fields.

**Schema:**
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (admin/driver/student),
  phone: String (required),
  status: String (active/pending/suspended),

  // Student-specific fields
  studentId: String (required for students, format: FA23-BCS-123),
  feeStatus: String (paid/partially_paid/pending),
  feeNotes: String (automatic audit log),
  feeUpdatedAt: Date,
  feeUpdatedBy: ObjectId (references User),
  assignedRoute: ObjectId (references Route),
  assignedBus: ObjectId (references Bus),

  // Driver-specific fields
  licenseNumber: String (required for drivers),

  createdAt: Date,
  updatedAt: Date
}
```

**Important Features:**
- Password is automatically hashed before saving using bcrypt
- `toJSON()` method removes password from responses
- `comparePassword()` method verifies login credentials

### Bus Model

Stores bus information and tracking data.

**Schema:**
```javascript
{
  busNumber: String (required, unique),
  model: String,
  year: Number,
  capacity: Number,
  status: String (available/on_trip/maintenance/out_of_service),
  driverId: ObjectId (references User with role=driver),
  routeId: ObjectId (references Route),

  // Real-time tracking fields
  currentLocation: {
    latitude: Number,
    longitude: Number
  },
  lastUpdated: Date,
  isOnTrip: Boolean,
  tripStartTime: Date,

  createdAt: Date,
  updatedAt: Date
}
```

### Route Model

Stores bus routes with stops and timing information.

**Schema:**
```javascript
{
  routeNo: String (unique),
  routeName: String (required, unique),
  description: String,
  stops: [{
    name: String,
    location: {
      latitude: Number,
      longitude: Number
    },
    sequence: Number,
    estimatedTime: String
  }],
  departureTime: String,
  distance: Number (in kilometers),
  estimatedDuration: Number (in minutes),
  color: String (for map display),
  isActive: Boolean,
  assignedBuses: [ObjectId] (references Bus),

  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model

Stores system and admin notifications.

**Schema:**
```javascript
{
  title: String (required),
  message: String (required),
  type: String (info/warning/success/error),
  priority: String (low/medium/high),
  senderId: ObjectId (references User - who sent it),
  receiverId: ObjectId (specific user, optional),
  receiverRole: String (student/driver/admin/all),
  isRead: Boolean,
  relatedEntity: {
    type: String (bus/route/trip),
    id: ObjectId
  },

  createdAt: Date
}
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user (student/driver/admin).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "03001234567",
  "role": "student",
  "studentId": "FA23-BCS-123",
  "adminSecretCode": "only-for-admin-role"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "status": "active"
    }
  }
}
```

**Notes:**
- Admin registration requires `adminSecretCode` from .env
- Driver accounts start with status="pending" (need admin approval)
- JWT token is automatically set in cookie

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ }
  }
}
```

#### GET /api/auth/me
Get current logged-in user information.

**Headers:** Cookie with JWT token (automatic)

**Response:**
```json
{
  "success": true,
  "data": { /* user object with populated assignedBus and assignedRoute */ }
}
```

#### POST /api/auth/logout
Logout current user (clears cookie).

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### User Management Endpoints (Admin Only)

#### GET /api/users
Get all users with filtering and pagination.

**Query Parameters:**
- `role`: Filter by role (student/driver/admin)
- `status`: Filter by status (active/pending/suspended)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Example:** `GET /api/users?role=student&status=active&page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": [ /* array of users */ ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 100
  }
}
```

#### GET /api/users/:id
Get single user by ID.

#### PUT /api/users/:id
Update user information.

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "johnupdated@example.com",
  "phone": "03009999999",
  "status": "active",
  "feeStatus": "paid",
  "assignedRoute": "route-id-here",
  "assignedBus": "bus-id-here"
}
```

**Important:** This endpoint automatically generates fee notes when:
- `feeStatus` changes → "Fee marked as Paid by Admin John on Feb 5, 2024 10:30 AM"
- `assignedRoute` changes → "Assigned to route 'Route 1' by Admin John on Feb 5, 2024 10:35 AM"
- `assignedBus` changes → "Assigned to bus 'B-101' by Admin John on Feb 5, 2024 10:40 AM"

#### DELETE /api/users/:id
Delete a user (cannot delete admin users).

#### POST /api/users/approve-driver/:id
Approve a pending driver application.

#### POST /api/users/reject-driver/:id
Reject a pending driver application.

### Bus Management Endpoints

#### GET /api/buses
Get all buses with filtering and pagination.

**Query Parameters:**
- `status`: Filter by status
- `page`: Page number
- `limit`: Results per page

#### GET /api/buses/:id
Get single bus by ID.

#### POST /api/buses
Create a new bus (Admin only).

**Request Body:**
```json
{
  "busNumber": "B-101",
  "model": "Toyota Coaster",
  "year": 2023,
  "capacity": 30,
  "status": "available"
}
```

#### PUT /api/buses/:id
Update bus information (Admin only).

#### DELETE /api/buses/:id
Delete a bus (Admin only).

#### POST /api/buses/:id/assign-driver
Assign a driver to a bus.

**Request Body:**
```json
{
  "driverId": "driver-user-id"
}
```

#### POST /api/buses/:id/unassign-driver
Remove driver from a bus.

#### POST /api/buses/:id/assign-route
Assign a route to a bus.

**Request Body:**
```json
{
  "routeId": "route-id"
}
```

#### POST /api/buses/:id/unassign-route
Remove route from a bus.

### Route Management Endpoints

#### GET /api/routes
Get all routes with filtering.

**Query Parameters:**
- `isActive`: Filter by active status (true/false)
- `page`: Page number
- `limit`: Results per page

#### GET /api/routes/:id
Get single route by ID.

#### POST /api/routes
Create a new route (Admin only).

**Request Body:**
```json
{
  "routeNo": "R1",
  "routeName": "Main Campus Route",
  "description": "Covers all major stops",
  "stops": [
    {
      "name": "Main Gate",
      "location": { "latitude": 31.5204, "longitude": 74.3587 },
      "sequence": 1,
      "estimatedTime": "08:00 AM"
    },
    {
      "name": "Library",
      "location": { "latitude": 31.5214, "longitude": 74.3597 },
      "sequence": 2,
      "estimatedTime": "08:10 AM"
    }
  ],
  "departureTime": "08:00 AM",
  "distance": 15,
  "estimatedDuration": 45,
  "color": "#FF5733"
}
```

#### PUT /api/routes/:id
Update route information (Admin only).

#### DELETE /api/routes/:id
Delete a route (Admin only).

### Tracking Endpoints

#### POST /api/tracking/start-trip
Start a trip (Driver only).

**Notes:**
- Automatically finds driver's assigned bus
- Sets bus status to "on_trip"
- Sends notification to students on that route

#### POST /api/tracking/stop-trip
Stop current trip (Driver only).

**Notes:**
- Calculates trip duration
- Sets bus status back to "available"
- Sends completion notification to students

#### POST /api/tracking/update-location
Update bus location during trip (Driver only).

**Request Body:**
```json
{
  "latitude": 31.5204,
  "longitude": 74.3587
}
```

#### GET /api/tracking/bus-location/:busId
Get current location of a specific bus (Student).

**Response:**
```json
{
  "success": true,
  "data": {
    "bus": { /* bus object */ },
    "currentLocation": {
      "latitude": 31.5204,
      "longitude": 74.3587
    },
    "lastUpdated": "2024-02-05T10:30:00.000Z",
    "isOnTrip": true
  }
}
```

#### GET /api/tracking/all-buses-location
Get locations of all buses (Admin).

### Notification Endpoints

#### GET /api/notifications
Get notifications for current user.

**Query Parameters:**
- `isRead`: Filter by read status (true/false)
- `type`: Filter by type (info/warning/success/error)
- `priority`: Filter by priority (low/medium/high)
- `page`: Page number
- `limit`: Results per page

**Response includes unread count:**
```json
{
  "success": true,
  "data": [ /* notifications */ ],
  "pagination": { /* pagination info */ },
  "unreadCount": 5
}
```

#### POST /api/notifications
Create and send notification (Admin only).

**Request Body:**
```json
{
  "title": "Bus Delay Notice",
  "message": "Bus B-101 will be delayed by 15 minutes",
  "type": "warning",
  "priority": "high",
  "receiverRole": "student",
  "receiverId": "optional-specific-user-id"
}
```

#### PUT /api/notifications/:id/read
Mark notification as read.

#### PUT /api/notifications/read-all
Mark all notifications as read.

#### DELETE /api/notifications/:id
Delete a notification.

## Authentication Flow

### How Authentication Works

1. **Registration/Login**
   - User sends email + password
   - Backend verifies credentials
   - Backend generates JWT token using `JWT_SECRET`
   - Token is sent in HTTP-only cookie

2. **Authenticated Requests**
   - Client sends request with cookie
   - `authMiddleware` extracts and verifies token
   - If valid, adds `req.user` object
   - Controller can access `req.user` for user info

3. **Authorization**
   - `roleMiddleware` checks if user has required role
   - Example: Only admins can access user management endpoints

### Middleware Chain Example

```javascript
router.put('/users/:id', protect, adminOnly, updateUser);
//                        ↓        ↓          ↓
//                    Verify JWT  Check role  Execute
```

## Environment Variables

**Required variables in backend/.env:**

| Variable | Purpose | Example |
|----------|---------|---------|
| MONGO_URI | MongoDB connection string | `mongodb://localhost:27017/mycampusride` |
| JWT_SECRET | Secret key for signing JWT tokens | `your-super-secret-key-here` |
| ADMIN_SECRET_CODE | Required code for admin registration | `mycampusride-admin-2024` |
| PORT | Port for backend server | `5000` |
| FRONTEND_URL | Frontend URL for CORS | `http://localhost:3000` |
| NODE_ENV | Environment mode | `development` or `production` |

**How to use:**
```javascript
const mongoUri = process.env.MONGO_URI;
```

## Testing with Postman

### Setup

1. Install Postman: https://www.postman.com/downloads/
2. Create new collection "MyCampusRide API"
3. Set base URL variable: `{{BASE_URL}}` = `http://localhost:5000`

### Testing Authentication

**Step 1: Register**
```
POST {{BASE_URL}}/api/auth/register
Body: {
  "name": "Test Student",
  "email": "test@test.com",
  "password": "test123",
  "phone": "03001234567",
  "role": "student",
  "studentId": "FA23-BCS-001"
}
```

**Step 2: Login**
```
POST {{BASE_URL}}/api/auth/login
Body: {
  "email": "test@test.com",
  "password": "test123"
}
```

After login, cookie is automatically saved for subsequent requests!

**Step 3: Get Current User**
```
GET {{BASE_URL}}/api/auth/me
```

### Testing Protected Endpoints

All protected endpoints need the JWT cookie from login.

**Get All Users (Admin only):**
```
GET {{BASE_URL}}/api/users?page=1&limit=10
```

**Create Bus (Admin only):**
```
POST {{BASE_URL}}/api/buses
Body: {
  "busNumber": "B-101",
  "model": "Toyota",
  "capacity": 30
}
```

## Security Features

### 1. Password Security
- Passwords hashed with bcrypt (salt rounds: 12)
- Never stored in plain text
- Password field excluded from API responses

### 2. JWT Authentication
- Tokens stored in HTTP-only cookies (prevents XSS attacks)
- Secure flag enabled in production
- 7-day expiration by default
- SameSite cookie policy

### 3. Admin Secret Code
- Required for admin registration
- Prevents unauthorized admin account creation
- Stored securely in environment variables

### 4. Role-Based Access Control
- Middleware checks user role before allowing access
- Three roles: admin, driver, student
- Different permissions for each role

### 5. Input Validation
- Mongoose schema validation
- Email format validation
- Phone number format validation
- Student ID format validation

### 6. MongoDB Injection Prevention
- Mongoose sanitizes inputs
- Schema validation prevents malicious data

### 7. CORS Protection
- Only specified frontend URL can access API
- Credentials properly configured

## Common Errors

### Error: "Cannot connect to MongoDB"

**Cause**: MongoDB is not running or connection string is wrong

**Solution**:
```bash
# Start MongoDB
mongod

# Check connection string in .env
MONGO_URI=mongodb://localhost:27017/mycampusride
```

### Error: "JWT malformed" or "No token provided"

**Cause**: Not logged in or token expired

**Solution**: Login again to get new token

### Error: "Invalid admin secret code"

**Cause**: Wrong admin code during registration

**Solution**: Check ADMIN_SECRET_CODE in backend/.env

### Error: "User already exists"

**Cause**: Email already registered

**Solution**: Use different email or login with existing account

### Error: "Validation failed"

**Cause**: Required fields missing or invalid format

**Solution**: Check the error message for which field is invalid

### Error: "Access denied"

**Cause**: Trying to access admin-only endpoint without admin role

**Solution**: Login as admin user

## Development Tips

### Adding New Endpoints

1. Create controller function in appropriate controller file
2. Add route in appropriate route file
3. Add middleware if needed (`protect`, `adminOnly`, etc.)
4. Test with Postman

### Debugging

Add console.logs in controllers:
```javascript
console.log('User data:', req.user);
console.log('Request body:', req.body);
```

Enable detailed error logging:
```javascript
console.error('Error:', error.message, error.stack);
```

### Database Operations

**View all data in MongoDB:**
```bash
mongosh
use mycampusride
db.users.find()
db.buses.find()
db.routes.find()
```

**Clear all data:**
```bash
db.users.deleteMany({})
db.buses.deleteMany({})
db.routes.deleteMany({})
db.notifications.deleteMany({})
```

## Code Examples

### Creating a New Controller Function

```javascript
// In controllers/exampleController.js
const Example = require('../models/Example');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get examples
// @route   GET /api/examples
// @access  Private
const getExamples = asyncHandler(async (req, res) => {
  const examples = await Example.find();

  res.json({
    success: true,
    data: examples
  });
});

module.exports = { getExamples };
```

### Adding a New Route

```javascript
// In routes/example.js
const express = require('express');
const router = express.Router();
const { getExamples } = require('../controllers/exampleController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getExamples);

module.exports = router;
```

### Registering Route in server.js

```javascript
app.use('/api/examples', require('./routes/example'));
```

## Performance Tips

1. **Use Indexes**: Add indexes to frequently queried fields
2. **Limit Population**: Only populate fields you need
3. **Pagination**: Always use pagination for large datasets
4. **Caching**: Consider Redis for frequently accessed data
5. **Query Optimization**: Use `.select()` to limit fields returned

## Deployment Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Change ADMIN_SECRET_CODE to secure value
- [ ] Use MongoDB Atlas for database
- [ ] Set NODE_ENV to 'production'
- [ ] Update FRONTEND_URL to production URL
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Test all endpoints in production

---

For frontend documentation, see `frontend/README.md`
