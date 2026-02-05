import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  Avatar,
  ListItemAvatar,
  ListItemSecondaryAction,
  Drawer,
  AppBar,
  Toolbar,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  LocationOn,
  DirectionsBus,
  Route,
  Schedule,
  Refresh,
  Notifications,
  CheckCircle,
  Speed,
  AccessTime,
  Directions,
  Map,
  TripOrigin,
  Flag,
  Person,
  School,
  Logout,
  HourglassEmpty,
  Send,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { trackingAPI, busesAPI, routesAPI, notificationsAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tripStatus, setTripStatus] = useState('idle'); // idle, started, completed
  const [currentLocation, setCurrentLocation] = useState(null);
  const [assignedBus, setAssignedBus] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [tripData, setTripData] = useState({
    startTime: null,
    endTime: null,
    currentStop: null,
    nextStop: null,
    progress: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [locationUpdate, setLocationUpdate] = useState('');
  const [activeView, setActiveView] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info',
    receiverRole: 'student',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadDriverData();
    loadNotifications();
    
    // Simulate location updates every 10 seconds when trip is active
    const locationInterval = setInterval(() => {
      if (tripStatus === 'started') {
        updateLocation();
      }
    }, 10000);

    return () => clearInterval(locationInterval);
  }, [tripStatus]);

  const loadDriverData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load assigned bus and route data
      if (user?.assignedBus) {
        const busResponse = await busesAPI.getBus(user.assignedBus);
        setAssignedBus(busResponse.data.data);
        
        if (busResponse.data.data.routeId) {
          const routeResponse = await routesAPI.getRoute(busResponse.data.data.routeId);
          setAssignedRoute(routeResponse.data.data);
        }
      }

      // Load current trip status - don't fail if no trip is active
      try {
        const tripResponse = await trackingAPI.getMyTripStatus();
        if (tripResponse.data.data) {
          setTripStatus('started');
          setTripData(tripResponse.data.data);
        }
      } catch (tripErr) {
        // No active trip, that's fine
        console.log('No active trip found');
      }
    } catch (err) {
      console.error('Driver data error:', err);
      // Don't set error for normal cases
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications({ limit: 10 });
      setNotifications(response.data.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const startTrip = async () => {
    try {
      const response = await trackingAPI.startTrip({
        busId: assignedBus._id,
        routeId: assignedRoute._id,
      });
      
      setTripStatus('started');
      setTripData({
        ...tripData,
        startTime: new Date(),
        currentStop: assignedRoute.stops[0],
        nextStop: assignedRoute.stops[1],
        progress: 0,
      });
      
      // Start location simulation
      updateLocation();
    } catch (err) {
      setError('Failed to start trip');
      console.error('Start trip error:', err);
    }
  };

  const endTrip = async () => {
    try {
      await trackingAPI.endTrip();
      setTripStatus('completed');
      setTripData({
        ...tripData,
        endTime: new Date(),
        progress: 100,
      });
    } catch (err) {
      setError('Failed to end trip');
      console.error('End trip error:', err);
    }
  };

  const updateLocation = async () => {
    try {
      // Simulate GPS coordinates along the route
      const simulatedLocation = simulateLocationAlongRoute();
      setCurrentLocation(simulatedLocation);
      
      await trackingAPI.updateLocation({
        latitude: simulatedLocation.latitude,
        longitude: simulatedLocation.longitude,
        busId: assignedBus._id,
      });
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  };

  const simulateLocationAlongRoute = () => {
    if (!assignedRoute || !assignedRoute.stops) return null;
    
    const progress = tripData.progress / 100;
    const totalStops = assignedRoute.stops.length;
    const currentStopIndex = Math.floor(progress * (totalStops - 1));
    const nextStopIndex = Math.min(currentStopIndex + 1, totalStops - 1);
    
    const currentStop = assignedRoute.stops[currentStopIndex];
    const nextStop = assignedRoute.stops[nextStopIndex];
    
    // Simulate coordinates between current and next stop
    const lat = currentStop.latitude + (nextStop.latitude - currentStop.latitude) * (progress * totalStops - currentStopIndex);
    const lng = currentStop.longitude + (nextStop.longitude - currentStop.longitude) * (progress * totalStops - currentStopIndex);
    
    return { latitude: lat, longitude: lng };
  };

  const getNextStop = () => {
    if (!assignedRoute || !assignedRoute.stops) return null;
    const progress = tripData.progress / 100;
    const totalStops = assignedRoute.stops.length;
    const nextStopIndex = Math.min(Math.floor(progress * totalStops) + 1, totalStops - 1);
    return assignedRoute.stops[nextStopIndex];
  };

  const getEstimatedArrival = () => {
    if (!assignedRoute || tripData.progress === 0) return 'N/A';
    const remainingProgress = (100 - tripData.progress) / 100;
    const estimatedMinutes = Math.round(remainingProgress * 30); // Assume 30 min total trip
    return `${estimatedMinutes} minutes`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSendNotification = async () => {
    try {
      await notificationsAPI.createNotification(notificationForm);
      setSnackbar({ open: true, message: 'Notification sent successfully', severity: 'success' });
      setOpenNotificationDialog(false);
      setNotificationForm({ title: '', message: '', type: 'info', receiverRole: 'student' });
      await loadNotifications();
    } catch (err) {
      console.error('Failed to send notification:', err);
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to send notification', severity: 'error' });
    }
  };

  // Show pending approval screen if driver status is pending - CHECK FIRST before loading
  if (user?.status === 'pending') {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'warning.main' }}>
                <HourglassEmpty sx={{ fontSize: 48 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  Pending Approval
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Your registration has been submitted successfully. We're reviewing your application.
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  You will be notified once an admin approves your account.
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ mt: 2 }}
              >
                Logout
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const drawerWidth = 280;
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <DirectionsBus /> },
    { id: 'route', label: 'Route', icon: <Route /> },
    { id: 'notifications', label: 'Notifications', icon: <Notifications /> },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDriverData();
    await loadNotifications();
    setRefreshing(false);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Left Sidebar Navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'white',
            borderRight: '1px solid rgba(0,0,0,0.08)',
          },
        }}
      >
        {/* Logo/Top section */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <DirectionsBus />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                MyCampusRide
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Driver Portal
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation Menu */}
        <List sx={{ px: 2, pt: 2 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.id}
              button
              onClick={() => setActiveView(item.id)}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                bgcolor: activeView === item.id ? 'primary.main' : 'transparent',
                color: activeView === item.id ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: activeView === item.id ? 'primary.dark' : 'action.hover',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
              />
            </ListItem>
          ))}
        </List>

        {/* User Profile Section */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0,
          p: 2,
          borderTop: '1px solid rgba(0,0,0,0.08)',
          bgcolor: 'grey.50'
        }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0).toUpperCase() || 'D'}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {user?.name || 'Driver'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email || 'N/A'}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={handleLogout}
              sx={{
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'white'
                }
              }}
            >
              <Logout fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Top Bar */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            bgcolor: 'white',
            borderBottom: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1, color: 'text.primary' }}>
              {menuItems.find(item => item.id === activeView)?.label || 'Dashboard'}
            </Typography>
            <Button
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Overview View */}
          {activeView === 'overview' && (
            <>
        {/* Trip Status Card */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  Current Trip Status
                </Typography>
                <Chip 
                  label={tripStatus.toUpperCase()} 
                  color={tripStatus === 'started' ? 'success' : tripStatus === 'completed' ? 'info' : 'default'}
                  sx={{ color: 'white', fontWeight: 600 }}
                />
              </Box>
              <Box textAlign="right">
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {assignedBus?.busNumber || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Bus Number
                </Typography>
              </Box>
            </Box>

            {tripStatus === 'started' && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Trip Progress
                  </Typography>
                  <Typography variant="body1">
                    {tripData.progress}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={tripData.progress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white'
                    }
                  }} 
                />
              </Box>
            )}
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Trip Controls */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Trip Controls
                </Typography>
                
                {tripStatus === 'idle' && (
                  <Box textAlign="center" sx={{ py: 4 }}>
                    <DirectionsBus sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Ready to Start Trip
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {assignedRoute ? `Route: ${assignedRoute.routeName}` : 'No route assigned'}
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrow />}
                      onClick={startTrip}
                      disabled={!assignedRoute}
                      sx={{ px: 4, py: 1.5 }}
                    >
                      Start Trip
                    </Button>
                  </Box>
                )}

                {tripStatus === 'started' && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Trip in Progress
                      </Typography>
                      <Chip label="LIVE" color="success" size="small" />
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Current Stop
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <TripOrigin color="primary" />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {tripData.currentStop?.name || 'Starting Point'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Next Stop
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Flag color="secondary" />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {getNextStop()?.name || 'Final Destination'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Estimated Arrival
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTime color="info" />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {getEstimatedArrival()}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<Stop />}
                      onClick={endTrip}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      End Trip
                    </Button>
                  </Box>
                )}

                {tripStatus === 'completed' && (
                  <Box textAlign="center" sx={{ py: 4 }}>
                    <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Trip Completed Successfully!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Trip ended at {tripData.endTime?.toLocaleTimeString()}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setTripStatus('idle')}
                    >
                      Start New Trip
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Route Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Route Information
                </Typography>
                
                {assignedRoute ? (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {assignedRoute.routeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {assignedRoute.description}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Route Details
                      </Typography>
                      <Box display="flex" gap={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn color="primary" />
                          <Typography variant="body2">
                            {assignedRoute.stops?.length || 0} stops
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Speed color="secondary" />
                          <Typography variant="body2">
                            {assignedRoute.distance} km
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Route Stops
                      </Typography>
                      <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {assignedRoute.stops?.map((stop, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ 
                                bgcolor: tripData.progress > (index / assignedRoute.stops.length) * 100 ? 'success.main' : 'grey.300',
                                width: 24,
                                height: 24
                              }}>
                                {index + 1}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={stop.name}
                              secondary={stop.address}
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                ) : (
                  <Box textAlign="center" sx={{ py: 4 }}>
                    <Route sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No Route Assigned
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Contact admin to assign a route
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Current Location */}
          {currentLocation && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Current Location
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                    <LocationOn color="primary" />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Live GPS Location
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<Map />}
                    onClick={() => setOpenDialog(true)}
                    fullWidth
                  >
                    View on Map
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Notifications */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Notifications
                  </Typography>
                  <Badge badgeContent={notifications.length} color="primary">
                    <Notifications />
                  </Badge>
                </Box>
                
                {notifications.length === 0 ? (
                  <Box textAlign="center" sx={{ py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No new notifications
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {notifications.map((notification, index) => (
                      <React.Fragment key={notification._id}>
                        <ListItem sx={{ py: 1 }}>
                          <ListItemText
                            primary={notification.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {notification.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < notifications.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
            </>
          )}

          {/* Route View */}
          {activeView === 'route' && assignedRoute && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                      {assignedRoute.routeName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {assignedRoute.description}
                    </Typography>
                    <Box display="flex" gap={3} sx={{ mb: 3 }}>
                      <Chip icon={<LocationOn />} label={`${assignedRoute.stops?.length || 0} Stops`} />
                      <Chip icon={<Speed />} label={`${assignedRoute.distance} km`} />
                      <Chip icon={<AccessTime />} label={`${assignedRoute.estimatedDuration} min`} />
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Route Stops with Pickup Times
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Sequence</TableCell>
                            <TableCell>Stop Name</TableCell>
                            <TableCell>Pickup Time</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {assignedRoute.stops?.map((stop, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{stop.name}</TableCell>
                              <TableCell>{stop.pickupTime || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Notifications View */}
          {activeView === 'notifications' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Notifications
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Send />}
                        onClick={() => setOpenNotificationDialog(true)}
                        sx={{ textTransform: 'none' }}
                      >
                        Send Notification
                      </Button>
                    </Box>
                    
                    {notifications.length === 0 ? (
                      <Box textAlign="center" sx={{ py: 6 }}>
                        <Notifications sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No Notifications
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          You're all caught up!
                        </Typography>
                      </Box>
                    ) : (
                      <List>
                        {notifications.map((notification, index) => (
                          <React.Fragment key={notification._id}>
                            <ListItem>
                              <ListItemText
                                primary={
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {notification.title}
                                    </Typography>
                                    <Chip label={notification.type} size="small" color="primary" />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {notification.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(notification.createdAt).toLocaleString()}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < notifications.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Container>

      {/* Location Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Current Location</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 300, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Map integration would go here
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={openNotificationDialog} onClose={() => setOpenNotificationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} sx={{ mt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={notificationForm.title}
              onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
            />
            <TextField
              label="Message"
              fullWidth
              multiline
              rows={3}
              value={notificationForm.message}
              onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={notificationForm.type}
                label="Type"
                onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Receiver Role</InputLabel>
              <Select
                value={notificationForm.receiverRole}
                label="Receiver Role"
                onChange={(e) => setNotificationForm({ ...notificationForm, receiverRole: e.target.value })}
              >
                <MenuItem value="student">Students</MenuItem>
                <MenuItem value="admin">Admins</MenuItem>
                <MenuItem value="driver">Drivers</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNotificationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendNotification}
            disabled={!notificationForm.title || !notificationForm.message}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
};

export default DriverDashboard;