# MyCampusRide Frontend Documentation

This is the frontend React application for MyCampusRide, built with React.js, Material-UI, and Vite.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Component Hierarchy](#component-hierarchy)
- [Pages and Features](#pages-and-features)
- [State Management](#state-management)
- [API Services](#api-services)
- [Styling Approach](#styling-approach)
- [Adding New Features](#adding-new-features)
- [Common Issues](#common-issues)

## Architecture Overview

The frontend is a Single Page Application (SPA) built with:

- **React 18** - For building user interfaces
- **React Router** - For navigation between pages
- **Material-UI (MUI)** - For pre-built, styled components
- **Axios** - For making HTTP requests to the backend
- **Context API** - For global state management (authentication)
- **Vite** - For fast development and building

### How It Works

```
User clicks → React Router → Page Component → API Service → Backend
     ↓                                              ↓
Updates UI ← State Update ← Response ← HTTP Response
```

## Folder Structure

```
frontend/
├── public/                      # Static files (images, icons)
│   └── vite.svg
├── src/
│   ├── components/             # Reusable components
│   │   ├── BusMap.jsx         # Map for displaying bus locations
│   │   ├── Footer.jsx         # Footer component
│   │   ├── Navbar.jsx         # Navigation bar
│   │   ├── NotificationPanel.jsx  # Notification display
│   │   ├── ProtectedRoute.jsx # Route protection wrapper
│   │   └── SendNotificationModal.jsx  # Modal for sending notifications
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication state management
│   ├── pages/                  # Page components
│   │   ├── AdminDashboard/    # Admin dashboard and sub-components
│   │   ├── DriverDashboard/   # Driver dashboard and sub-components
│   │   ├── StudentDashboard/  # Student dashboard and sub-components
│   │   ├── LandingPage/       # Homepage
│   │   ├── LoginPage/         # Login page
│   │   ├── RegisterPage/      # Registration page
│   │   └── NotFoundPage/      # 404 error page
│   ├── services/              # API service functions
│   │   ├── api.js            # Axios instance configuration
│   │   ├── authService.js    # Authentication APIs
│   │   ├── userService.js    # User management APIs
│   │   ├── busService.js     # Bus management APIs
│   │   ├── routeService.js   # Route management APIs
│   │   ├── trackingService.js # Tracking APIs
│   │   ├── notificationService.js # Notification APIs
│   │   └── index.js          # Service exports
│   ├── utils/
│   │   └── apiUtils.js       # API utility functions
│   ├── App.jsx                # Main app component with routing
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
├── index.html                 # HTML template
├── package.json              # Frontend dependencies
└── vite.config.js            # Vite configuration
```

## Component Hierarchy

### App Structure

```
App.jsx (Router)
├── LandingPage/
├── LoginPage/
├── RegisterPage/
├── AdminDashboard/
│   ├── AdminHeader
│   ├── AdminSidebar
│   └── Views (OverviewView, UsersView, BusesView, etc.)
├── DriverDashboard/
│   ├── DriverHeader
│   ├── DriverSidebar
│   └── Views (OverviewView, TrackingView, ProfileView, etc.)
├── StudentDashboard/
│   ├── StudentHeader
│   ├── StudentSidebar
│   └── Views (OverviewView, TrackingView, ProfileView, etc.)
└── NotFoundPage/
```

### Shared Components

- **ProtectedRoute**: Wraps routes that require authentication
- **BusMap**: Reusable map component for displaying bus locations
- **NotificationPanel**: Displays notifications for users
- **SendNotificationModal**: Admin modal for sending notifications

## Pages and Features

### 1. Landing Page (`LandingPage.jsx`)

**Purpose**: Welcome page with system overview

**Features**:
- Hero section with call-to-action
- Feature highlights
- Links to login and register

**Route**: `/`

### 2. Login Page (`LoginPage.jsx`)

**Purpose**: User authentication

**Features**:
- Email and password input
- Form validation
- Error display
- Redirect to role-specific dashboard after login

**Route**: `/login`

**Key Functions**:
```javascript
const handleLogin = async (email, password) => {
  const result = await login({ email, password });
  if (result.success) {
    // Redirect based on user role
    navigate(`/${user.role}`);
  }
};
```

### 3. Register Page (`RegisterPage.jsx`)

**Purpose**: New user registration

**Features**:
- Role selection (Student, Driver, Admin)
- Role-specific fields:
  - Student: Student ID (format validation: FA23-BCS-123)
  - Driver: License Number
  - Admin: Admin Secret Code
- Password confirmation
- Form validation
- Error handling

**Route**: `/register`

**Validation Example**:
```javascript
const validateStudentId = (id) => {
  const pattern = /^(FA|SP)[0-9]{2}-(BCS|BBA|BSE)-[0-9]{3}$/;
  return pattern.test(id);
};
```

### 4. Admin Dashboard (`AdminDashboard/`)

**Purpose**: Complete system management

**Main Component**: `AdminDashboard.jsx`

**Sub-Components**:
- `AdminHeader.jsx` - Top navigation bar
- `AdminSidebar.jsx` - Left sidebar menu
- `OverviewView.jsx` - Dashboard with statistics
- `UsersView.jsx` - User management (CRUD, approve drivers)
- `BusesView.jsx` - Bus management (CRUD, assign driver/route)
- `RoutesView.jsx` - Route management (CRUD, manage stops)
- `FeeManagementView.jsx` - Student fee management with automatic notes
- `NotificationsView.jsx` - View and send notifications

**Route**: `/admin/*`

**State Management**:
```javascript
const [activeView, setActiveView] = useState('overview');

const renderActiveView = () => {
  switch (activeView) {
    case 'overview': return <OverviewView />;
    case 'users': return <UsersView />;
    // ... other views
  }
};
```

### 5. Driver Dashboard (`DriverDashboard/`)

**Purpose**: Trip management and tracking

**Main Component**: `DriverDashboard.jsx`

**Sub-Components**:
- `DriverHeader.jsx` - Top navigation
- `DriverSidebar.jsx` - Left sidebar
- `DriverOverviewView.jsx` - Dashboard overview
- `DriverTrackingView.jsx` - Start/stop trip, update location
- `DriverTripsView.jsx` - Trip history
- `DriverProfileView.jsx` - Driver profile

**Route**: `/driver/*`

**Key Features**:
- Start Trip button
- Update location (sends coordinates to backend)
- Stop Trip button
- View assigned bus and route

### 6. Student Dashboard (`StudentDashboard/`)

**Purpose**: Track bus and view information

**Main Component**: `StudentDashboard.jsx`

**Sub-Components**:
- `StudentHeader.jsx` - Top navigation
- `StudentSidebar.jsx` - Left sidebar
- `StudentOverviewView.jsx` - Dashboard overview
- `StudentTrackingView.jsx` - Real-time bus tracking map
- `StudentScheduleView.jsx` - Route schedule and stops
- `StudentProfileView.jsx` - Student profile
- `VirtualTransportCard.jsx` - Digital transport ID card

**Route**: `/student/*`

**Key Features**:
- Live bus tracking on map
- Route information with stops
- Virtual transport card
- Notifications about bus status

## State Management

### AuthContext (`context/AuthContext.jsx`)

**Purpose**: Global authentication state management

**Provides**:
- `user` - Current logged-in user object
- `loading` - Loading state during auth operations
- `login()` - Login function
- `register()` - Register function
- `logout()` - Logout function
- `checkAuth()` - Check if user is authenticated

**Usage in Components**:
```javascript
import { useAuth } from '../../context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();

  if (!user) {
    return <div>Please login</div>;
  }

  return <div>Welcome {user.name}</div>;
}
```

**How It Works**:
1. On app load, `checkAuth()` is called
2. Checks if user has valid JWT cookie
3. If valid, fetches user data from `/api/auth/me`
4. Stores user in state
5. All components can access user via `useAuth()`

### Local State

Each component manages its own local state for:
- Form inputs
- Loading states
- Error messages
- Modal open/close states

**Example**:
```javascript
const [formData, setFormData] = useState({
  name: '',
  email: ''
});

const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

## API Services

All API calls are centralized in the `services/` folder.

### API Configuration (`services/api.js`)

Creates an Axios instance with base configuration:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

### Service Files

Each service file exports functions for specific features:

**authService.js**:
```javascript
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
```

**userService.js**:
```javascript
export const getUsers = (params) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
```

**Usage in Components**:
```javascript
import { userService } from '../../services';

const fetchUsers = async () => {
  try {
    const response = await userService.getUsers({ role: 'student' });
    setUsers(response.data.data);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};
```

### Error Handling

All API calls should be wrapped in try-catch:

```javascript
try {
  const response = await api.get('/users');
  setData(response.data.data);
} catch (error) {
  const message = error.response?.data?.message || 'An error occurred';
  setError(message);
}
```

## Styling Approach

### Material-UI (MUI)

The project uses Material-UI for all styling:

**Component Props**:
```javascript
<Button
  variant="contained"
  color="primary"
  sx={{ mt: 2, py: 1.5 }}
  onClick={handleClick}
>
  Click Me
</Button>
```

**sx Prop**: Inline styling with theme values
- `mt` - Margin top (theme spacing units)
- `py` - Padding Y-axis
- `bgcolor` - Background color
- `color` - Text color

**Common Patterns**:

```javascript
// Card with shadow
<Card sx={{ boxShadow: 3, p: 3 }}>

// Flex container
<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

// Grid layout
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>

// Responsive sizing
<Box sx={{
  width: { xs: '100%', md: '50%' },
  fontSize: { xs: '14px', md: '16px' }
}}>
```

### Global Styles (`index.css`)

Minimal global styles:
- CSS reset
- Body styles
- Default font family

Most styling is done with MUI components.

## Adding New Features

### Adding a New Page

**Step 1: Create Page Component**

Create `src/pages/NewPage/NewPage.jsx`:

```javascript
import React from 'react';
import { Container, Typography } from '@mui/material';

const NewPage = () => {
  return (
    <Container>
      <Typography variant="h4">New Page</Typography>
    </Container>
  );
};

export default NewPage;
```

**Step 2: Add Route**

In `src/App.jsx`:

```javascript
import NewPage from './pages/NewPage/NewPage';

// In the Routes section:
<Route path="/new-page" element={<NewPage />} />
```

**Step 3: Add Navigation Link**

In appropriate sidebar or navbar:

```javascript
<Link to="/new-page">New Page</Link>
```

### Adding a New API Service

**Step 1: Create Service Function**

In `src/services/exampleService.js`:

```javascript
import api from './api';

export const getExamples = (params) => api.get('/examples', { params });
export const createExample = (data) => api.post('/examples', data);
```

**Step 2: Export Service**

In `src/services/index.js`:

```javascript
export * as exampleService from './exampleService';
```

**Step 3: Use in Component**

```javascript
import { exampleService } from '../../services';

const fetchExamples = async () => {
  const response = await exampleService.getExamples();
  setExamples(response.data.data);
};
```

### Adding a New Dashboard View

**Step 1: Create View Component**

Create `src/pages/AdminDashboard/components/NewView.jsx`:

```javascript
import React from 'react';
import { Box, Typography } from '@mui/material';

const NewView = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">New View</Typography>
    </Box>
  );
};

export default NewView;
```

**Step 2: Import in Dashboard**

In `AdminDashboard.jsx`:

```javascript
import NewView from './components/NewView';
```

**Step 3: Add to Switch Statement**

```javascript
const renderActiveView = () => {
  switch (activeView) {
    case 'new-view':
      return <NewView />;
    // ... other cases
  }
};
```

**Step 4: Add Sidebar Menu Item**

In `AdminSidebar.jsx`:

```javascript
const menuItems = [
  // ... existing items
  { id: 'new-view', label: 'New View', icon: <Icon /> }
];
```

## Common Issues

### Issue: "Cannot read property of undefined"

**Cause**: Trying to access property of null/undefined object

**Solution**: Use optional chaining
```javascript
// Bad
const name = user.name;

// Good
const name = user?.name;
```

### Issue: "Warning: Each child in a list should have a unique key prop"

**Cause**: Missing `key` prop when mapping arrays

**Solution**:
```javascript
{items.map((item) => (
  <div key={item._id}>{item.name}</div>
))}
```

### Issue: State not updating immediately

**Cause**: State updates are asynchronous

**Solution**: Use effect or callback
```javascript
const [count, setCount] = useState(0);

const increment = () => {
  setCount(prevCount => prevCount + 1);
};
```

### Issue: "CORS error"

**Cause**: Backend CORS not configured or wrong URL

**Solution**:
- Check backend CORS settings
- Ensure `withCredentials: true` in axios config
- Verify API base URL is correct

### Issue: "401 Unauthorized" on protected routes

**Cause**: Not logged in or JWT expired

**Solution**: Login again to get new token

## Development Tips

### React DevTools

Install React DevTools browser extension to:
- Inspect component hierarchy
- View component props and state
- Track component re-renders

### Console Logging

Add logs to debug:
```javascript
console.log('User data:', user);
console.log('API response:', response.data);
```

### Hot Reload

Vite automatically reloads when you save files. If it doesn't:
```bash
# Stop server (Ctrl+C)
# Clear cache
rm -rf node_modules/.vite
# Restart
npm run dev
```

### Building for Production

```bash
npm run build
```

Creates optimized production build in `dist/` folder.

## Performance Best Practices

1. **Use React.memo** for expensive components
2. **Lazy load** pages with `React.lazy()`
3. **Debounce** search inputs
4. **Paginate** large lists
5. **Cache** API responses when appropriate

## Accessibility

- Use semantic HTML elements
- Add `alt` text to images
- Ensure sufficient color contrast
- Make interactive elements keyboard accessible
- Use ARIA labels when needed

## Testing

### Manual Testing Checklist

- [ ] All forms validate correctly
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] Protected routes redirect to login
- [ ] Logout clears user state
- [ ] Responsive on mobile devices

### Browser Testing

Test on:
- Chrome
- Firefox
- Safari
- Edge

## Deployment

### Build the App

```bash
npm run build
```

### Deploy Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **Manual**
   - Upload `dist/` folder to web server
   - Configure server to serve `index.html` for all routes

### Environment Variables for Production

Update API base URL:

Create `.env.production`:
```
VITE_API_BASE_URL=https://your-backend-url.com
```

---

For backend documentation, see `backend/README.md`

For general project information, see root `README.md`
