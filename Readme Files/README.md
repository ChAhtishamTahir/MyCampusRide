# MyCampusRide - University Bus Tracking System

A comprehensive web-based bus tracking and management system designed for universities to manage their campus transportation services efficiently.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [User Roles](#user-roles)
- [Installation Guide](#installation-guide)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Common Issues](#common-issues)
- [FYP Presentation Tips](#fyp-presentation-tips)

## Overview

MyCampusRide is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application that helps universities manage their bus transportation system. It provides real-time bus tracking, route management, fee management, and notification systems for three types of users: Admins, Drivers, and Students.

### Why This Project?

- **Real-time Tracking**: Students can see where their bus is in real-time
- **Efficient Management**: Admins can manage buses, routes, drivers, and students from one dashboard
- **Fee Management**: Track student fee payments with automatic audit logs
- **Notifications**: Send important updates to students and drivers instantly
- **Role-Based Access**: Different dashboards and permissions for each user type

## Features

### For Students
- Real-time bus location tracking on an interactive map
- View assigned bus and route information
- Receive notifications about bus arrivals, delays, and updates
- View personal profile and transport card details

### For Drivers
- Start/stop trip functionality
- Update bus location in real-time
- View assigned route and bus details
- Track trip history and statistics

### For Admins
- Complete dashboard with system overview
- User management (approve drivers, manage students)
- Bus management (add, edit, delete buses)
- Route management (create and manage routes with stops)
- **Automatic Fee Management** with audit trail
- Send notifications to specific users or roles
- View all buses on a map in real-time

## Technology Stack

### Frontend
- **React.js** - JavaScript library for building user interfaces
- **Material-UI (MUI)** - React component library for modern design
- **React Router** - Navigation between pages
- **Axios** - HTTP client for API requests
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime for server-side code
- **Express.js** - Web framework for building REST APIs
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing for security

## Project Structure

```
mycampusride/
├── backend/                  # Backend server code
│   ├── controllers/         # Route handlers (business logic)
│   ├── middleware/          # Authentication & error handling
│   ├── models/             # Database models (User, Bus, Route, Notification)
│   ├── routes/             # API endpoints
│   ├── .env                # Environment variables (MUST CREATE THIS)
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/                # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components (dashboards, login, etc.)
│   │   ├── services/       # API service functions
│   │   ├── context/        # React Context for state management
│   │   └── App.jsx         # Main app component
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## Getting Started

### Prerequisites

Before you begin, make sure you have these installed on your computer:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud database) - [Sign up here](https://www.mongodb.com/cloud/atlas)
3. **Git** (optional, for version control) - [Download here](https://git-scm.com/)
4. **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

### Check Installations

Open your terminal and run these commands to verify:

```bash
node --version    # Should show v16.x.x or higher
npm --version     # Should show 8.x.x or higher
mongod --version  # Should show MongoDB version
```

## Installation Guide

### Step 1: Clone or Download the Project

If you have the project folder, open it in your terminal. Or if using Git:

```bash
git clone <your-repository-url>
cd mycampusride
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This installs all the packages the backend needs (Express, MongoDB, etc.)

### Step 3: Create Backend Environment File

Create a file named `.env` in the `backend` folder with this content:

```env
MONGO_URI=mongodb://localhost:27017/mycampusride
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_SECRET_CODE=mycampusride-admin-2024
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**IMPORTANT**: Change `JWT_SECRET` and `ADMIN_SECRET_CODE` to your own secure values!

### Step 4: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This installs all the packages the frontend needs (React, Material-UI, etc.)

### Step 5: Start MongoDB

Make sure MongoDB is running on your computer:

```bash
# On Windows (in a new terminal):
mongod

# On Mac/Linux (in a new terminal):
sudo mongod
```

Or if using MongoDB Atlas, skip this step (the connection string in .env handles it).

## Running the Application

You need to run both backend and frontend servers:

### Terminal 1: Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
🚌 MyCampusRide Backend running on port 5000
✅ Connected to MongoDB successfully
```

### Terminal 2: Start Frontend Server

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE ready in XXX ms
  ➜  Local: http://localhost:3000/
```

### Access the Application

Open your browser and go to: **http://localhost:3000**

## User Roles

### 1. Admin
- **Purpose**: Manages the entire system
- **Registration**: Requires admin secret code (from backend/.env)
- **Default Credentials** (if seeded):
  - Email: admin@mycampusride.com
  - Password: admin123
- **Capabilities**: Full access to all features

### 2. Driver
- **Purpose**: Operates buses and updates locations
- **Registration**: Requires license number
- **Status**: Account starts as "pending" and needs admin approval
- **Capabilities**: Start/stop trips, update location

### 3. Student
- **Purpose**: Tracks buses and views transport information
- **Registration**: Requires student ID (format: FA23-BCS-123)
- **Capabilities**: View bus location, receive notifications

## Environment Variables

### Backend Environment Variables

Create `backend/.env` with these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | `mongodb://localhost:27017/mycampusride` |
| JWT_SECRET | Secret key for JWT tokens | `your-super-secret-key-here` |
| ADMIN_SECRET_CODE | Code required for admin registration | `mycampusride-admin-2024` |
| PORT | Backend server port | `5000` |
| FRONTEND_URL | Frontend URL for CORS | `http://localhost:3000` |
| NODE_ENV | Environment mode | `development` |

### Frontend Environment Variables (Optional)

Create `frontend/.env` if you need to customize:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Common Issues

### Issue 1: "Cannot connect to MongoDB"

**Solution**:
- Make sure MongoDB is running: `mongod`
- Check if MONGO_URI in backend/.env is correct
- If using MongoDB Atlas, check your internet connection

### Issue 2: "Port 5000 is already in use"

**Solution**:
- Change PORT in backend/.env to 5001 or another port
- Or stop the process using port 5000:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -ti:5000 | xargs kill`

### Issue 3: "Invalid admin secret code"

**Solution**:
- Make sure the code you enter during admin registration matches ADMIN_SECRET_CODE in backend/.env
- Check for typos and extra spaces

### Issue 4: "Student ID format invalid"

**Solution**:
- Student ID must follow format: FA/SP + 2 digits - BCS/BBA/BSE - 3 digits
- Examples: FA23-BCS-123, SP24-BBA-456

### Issue 5: Frontend not loading/blank page

**Solution**:
- Check browser console for errors (F12)
- Make sure backend server is running first
- Clear browser cache and reload

## FYP Presentation Tips

### What to Demonstrate

1. **User Registration & Authentication**
   - Show student registration with student ID validation
   - Show driver registration (pending approval)
   - Show admin registration with secret code

2. **Admin Dashboard**
   - User management (approve drivers)
   - Bus management (add, edit, assign driver/route)
   - Route management (create routes with stops)
   - Fee management with automatic notes generation
   - Send notifications to users

3. **Driver Features**
   - Login as driver (after approval)
   - Start a trip
   - Update bus location
   - Stop trip

4. **Student Features**
   - Login as student
   - View assigned bus and route
   - Track bus in real-time on map
   - Receive and read notifications

5. **Automatic Fee Notes**
   - Update a student's fee status as admin
   - Show how the system automatically logs: "Fee marked as Paid by Admin John on Feb 5, 2024"
   - Demonstrate route and bus assignment logging

### Key Points to Mention

- **Security**: Passwords hashed with bcrypt, JWT authentication, admin secret code protection
- **Real-time Updates**: Location tracking updates in real-time
- **Audit Trail**: Automatic fee notes track all admin actions
- **Role-Based Access**: Different dashboards for different user types
- **Responsive Design**: Works on desktop and mobile devices

### Common Questions & Answers

**Q: Why MERN stack?**
A: MERN is popular, uses JavaScript for both frontend and backend, has great community support, and is suitable for real-time applications.

**Q: How is data stored?**
A: MongoDB stores all data in collections (Users, Buses, Routes, Notifications). Each document has a unique ID.

**Q: How does authentication work?**
A: Users login with email/password. Backend verifies credentials, generates a JWT token, stores it in a cookie. This token is sent with every request to verify the user.

**Q: Can this be deployed?**
A: Yes! Backend can be deployed to Heroku/Railway, frontend to Vercel/Netlify, and database to MongoDB Atlas.

**Q: How does real-time tracking work?**
A: Drivers update their location which saves to the database. Students fetch this location periodically to see updated positions on the map.

## Git Workflow (Optional)

If you want to use version control:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Create a GitHub repository and push
git remote add origin <your-github-url>
git push -u origin main
```

**IMPORTANT**: Never commit your `.env` files! They're already in `.gitignore`.

## Next Steps

1. ✅ Set up the project following this README
2. ✅ Create sample data (users, buses, routes)
3. ✅ Test all features thoroughly
4. ✅ Prepare demo scenarios for presentation
5. ✅ Document any customizations you made
6. 📖 Read backend/README.md for API details
7. 📖 Read frontend/README.md for component details

## Support

If you encounter issues:
1. Check the error message carefully
2. Look in the "Common Issues" section above
3. Check backend and frontend README files
4. Search for the error on Google or Stack Overflow

## License

This project is for educational purposes (Final Year Project).

---

**Made with dedication for university transportation management**

Good luck with your FYP presentation! 🚌🎓
