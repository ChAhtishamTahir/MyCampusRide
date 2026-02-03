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
  Avatar,
  ListItemAvatar,
  ListItemSecondaryAction,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Drawer,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  DirectionsBus,
  Route,
  LocationOn,
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
  Receipt,
  History,
  Star,
  Email,
  Phone,
  Badge as BadgeIcon,
  Timeline,
  CalendarToday,
  Settings,
  CreditCard,
  Download,
  QrCode2,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { trackingAPI, busesAPI, routesAPI, notificationsAPI, usersAPI, authAPI } from '../api/api';
import BusMap from '../components/BusMap';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [assignedBus, setAssignedBus] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [tripStatus, setTripStatus] = useState('idle');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Add driver information state
  const [driverInfo, setDriverInfo] = useState(null);
  const [feeDetails, setFeeDetails] = useState({
    monthlyFee: 500,
    paidAmount: 500,
    dueAmount: 0,
    nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentHistory: []
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openPaymentHistoryDialog, setOpenPaymentHistoryDialog] = useState(false);
  const [openTripHistoryDialog, setOpenTripHistoryDialog] = useState(false);
  const [openTransportCardDialog, setOpenTransportCardDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tripHistory, setTripHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    loadStudentData();
    loadNotifications();
  }, []);  // Only run once on mount

  useEffect(() => {
    // Poll for bus location updates every 30 seconds
    if (!assignedBus || !assignedBus.isOnTrip) return;
    
    const locationInterval = setInterval(() => {
      loadBusLocation();
      checkTripStatus();
    }, 30000);

    return () => clearInterval(locationInterval);
  }, [assignedBus?._id, assignedBus?.isOnTrip]);  // Only re-run if bus ID or trip status changes

  useEffect(() => {
    // Check trip status when bus is assigned
    if (assignedBus?._id) {
      checkTripStatus();
    }
  }, [assignedBus?._id]);  // Only re-run if bus ID changes

  useEffect(() => {
    // Update fee details based on user data
    if (user) {
      const monthlyFee = 500;
      const feeStatus = user.feeStatus || 'pending';
      let paidAmount = 0;
      let dueAmount = monthlyFee;
      
      if (feeStatus === 'paid') {
        paidAmount = monthlyFee;
        dueAmount = 0;
      } else if (feeStatus === 'partially_paid') {
        paidAmount = monthlyFee * 0.5;
        dueAmount = monthlyFee * 0.5;
      }
      
      setFeeDetails(prev => ({
        ...prev,
        monthlyFee,
        paidAmount,
        dueAmount,
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, refresh user data to get latest assignedBus and assignedRoute
      const userResponse = await authAPI.getMe();
      const currentUser = userResponse.data.data;
      
      // Load assigned bus and route data from the populated user data
      if (currentUser?.assignedBus) {
        // If assignedBus is already populated as an object, use it directly
        if (typeof currentUser.assignedBus === 'object' && currentUser.assignedBus._id) {
          setAssignedBus(currentUser.assignedBus);
          
          // Load driver information from the populated bus data
          if (currentUser.assignedBus.driverId) {
            // If driverId is already populated, use it
            if (typeof currentUser.assignedBus.driverId === 'object') {
              setDriverInfo(currentUser.assignedBus.driverId);
            } else {
              // Otherwise fetch driver info
              try {
                const driverResponse = await usersAPI.getUser(currentUser.assignedBus.driverId);
                setDriverInfo(driverResponse.data.data);
              } catch (driverErr) {
                console.log('Failed to load driver info:', driverErr);
              }
            }
          }
          
          // Set route from populated bus data
          if (currentUser.assignedBus.routeId) {
            if (typeof currentUser.assignedBus.routeId === 'object') {
              setAssignedRoute(currentUser.assignedBus.routeId);
            } else {
              const routeResponse = await routesAPI.getRoute(currentUser.assignedBus.routeId);
              setAssignedRoute(routeResponse.data.data);
            }
          }
          
          // Load bus location if trip is active
          if (currentUser.assignedBus.isOnTrip) {
            await loadBusLocation();
          }
        } else {
          // assignedBus is just an ID, fetch the full bus data
          const busResponse = await busesAPI.getBus(currentUser.assignedBus);
          setAssignedBus(busResponse.data.data);
          
          // Load driver information
          if (busResponse.data.data.driverId) {
            // If driverId is already populated, use it
            if (typeof busResponse.data.data.driverId === 'object') {
              setDriverInfo(busResponse.data.data.driverId);
            } else {
              try {
                const driverResponse = await usersAPI.getUser(busResponse.data.data.driverId);
                setDriverInfo(driverResponse.data.data);
              } catch (driverErr) {
                console.log('Failed to load driver info:', driverErr);
              }
            }
          }
          
          if (busResponse.data.data.routeId) {
            if (typeof busResponse.data.data.routeId === 'object') {
              setAssignedRoute(busResponse.data.data.routeId);
            } else {
              const routeResponse = await routesAPI.getRoute(busResponse.data.data.routeId);
              setAssignedRoute(routeResponse.data.data);
            }
          }
          
          // Load bus location if trip is active
          if (busResponse.data.data.isOnTrip) {
            await loadBusLocation();
          }
        }
      } else if (currentUser?.assignedRoute) {
        // Only route assigned, no bus
        if (typeof currentUser.assignedRoute === 'object' && currentUser.assignedRoute._id) {
          setAssignedRoute(currentUser.assignedRoute);
        } else {
          const routeResponse = await routesAPI.getRoute(currentUser.assignedRoute);
          setAssignedRoute(routeResponse.data.data);
        }
      }
    } catch (err) {
      setError('Failed to load student data');
      console.error('Student data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTripStatus = async () => {
    try {
      if (assignedBus?._id) {
        const response = await trackingAPI.getBusLocation(assignedBus._id);
        if (response.data.data?.isOnTrip) {
          setTripStatus('active');
          if (response.data.data.location) {
            setBusLocation(response.data.data.location);
          }
        } else {
          setTripStatus('idle');
        }
      }
    } catch (err) {
      console.error('Failed to check trip status:', err);
    }
  };

  const loadBusLocation = async () => {
    try {
      if (!assignedBus?._id) return;
      const response = await trackingAPI.getBusLocation(assignedBus._id);
      if (response.data.data?.location) {
        setBusLocation(response.data.data.location);
      } else if (response.data.data?.currentLocation) {
        setBusLocation(response.data.data.currentLocation);
      }
    } catch (err) {
      console.error('Failed to load bus location:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications({ limit: 10 });
      const notificationsData = response.data.data || [];
      setNotifications(notificationsData);
      
      // Count unread notifications
      const unread = notificationsData.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setSuccessMessage('All notifications marked as read');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStudentData();
    await loadNotifications();
    setRefreshing(false);
    setSuccessMessage('Data refreshed successfully');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDownloadTransportCard = () => {
    // Create a canvas or use html2canvas to generate the card image
    const cardElement = document.getElementById('transport-card');
    if (!cardElement) return;

    // For now, we'll use a simple approach with window.print or html2canvas if available
    // In production, you'd use html2canvas library
    const printWindow = window.open('', '', 'width=800,height=500');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Transport Card - ${user?.name}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .card-container { 
                width: 350px; 
                height: 220px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                padding: 24px;
                color: white;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .card-header { display: flex; justify-content: space-between; align-items: center; }
              .card-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }
              .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
              .student-name { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
              .student-id { font-size: 14px; opacity: 0.9; }
              .bus-info { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
              .route-info { font-size: 12px; opacity: 0.8; }
            </style>
          </head>
          <body>
            <div class="card-container">
              <div class="card-header">
                <div>
                  <div style="font-size: 14px; opacity: 0.9;">CAMPUS TRANSPORT</div>
                  <div style="font-size: 10px; opacity: 0.7;">Student ID Card</div>
                </div>
                <div style="font-size: 32px;">🚌</div>
              </div>
              <div class="card-body">
                <div class="student-name">${user?.name || 'Student Name'}</div>
                <div class="student-id">ID: ${user?.studentId || 'N/A'}</div>
                <div style="margin-top: 16px;">
                  <div class="bus-info">${assignedBus?.busNumber || 'N/A'}</div>
                  <div class="route-info">Route: ${assignedRoute?.routeName || 'Not Assigned'}</div>
                </div>
              </div>
              <div class="card-footer">
                <div style="font-size: 10px; opacity: 0.7;">
                  Valid: ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}
                </div>
                <div style="font-size: 10px; opacity: 0.7;">
                  Status: ${user?.feeStatus === 'paid' ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setSuccessMessage('Notification deleted');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const loadTripHistory = async () => {
    try {
      // Mock trip history data - in real app, this would come from backend
      const mockTripHistory = [
        {
          id: 1,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          route: assignedRoute?.routeName || 'Route A',
          bus: assignedBus?.busNumber || 'BUS-001',
          startTime: '08:00 AM',
          endTime: '08:45 AM',
          duration: '45 min',
          status: 'completed'
        },
        {
          id: 2,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          route: assignedRoute?.routeName || 'Route A',
          bus: assignedBus?.busNumber || 'BUS-001',
          startTime: '08:00 AM',
          endTime: '08:50 AM',
          duration: '50 min',
          status: 'completed'
        },
      ];
      setTripHistory(mockTripHistory);
    } catch (err) {
      console.error('Failed to load trip history:', err);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      // Mock payment history data - in real app, this would come from backend
      const mockPaymentHistory = [
        {
          id: 1,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 500,
          method: 'Online Payment',
          status: 'completed',
          transactionId: 'TXN-2024-001'
        },
        {
          id: 2,
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 500,
          method: 'Cash',
          status: 'completed',
          transactionId: 'TXN-2024-002'
        },
      ];
      setPaymentHistory(mockPaymentHistory);
    } catch (err) {
      console.error('Failed to load payment history:', err);
    }
  };

  const getEstimatedArrival = () => {
    if (!busLocation || !assignedRoute) return 'N/A';
    
    // Simple calculation based on distance (this would be more sophisticated in real implementation)
    const distance = calculateDistance(busLocation, assignedRoute.stops[0]);
    const estimatedMinutes = Math.round(distance * 2); // Assume 2 minutes per km
    return `${estimatedMinutes} minutes`;
  };

  const calculateDistance = (location1, location2) => {
    // Simple distance calculation (in real app, use proper geolocation library)
    const lat1 = location1.latitude;
    const lon1 = location1.longitude;
    const lat2 = location2.latitude;
    const lon2 = location2.longitude;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getNextStop = () => {
    if (!assignedRoute || !assignedRoute.stops) return null;
    // In real implementation, this would be calculated based on current bus position
    return assignedRoute.stops[1] || assignedRoute.stops[0];
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const drawerWidth = 280;

  // Menu items for sidebar
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <DirectionsBus /> },
    { id: 'tracking', label: 'Live Tracking', icon: <Map /> },
    { id: 'schedule', label: 'Schedule', icon: <Schedule /> },
    { id: 'history', label: 'Trip History', icon: <History /> },
    { id: 'payments', label: 'Payment', icon: <Receipt /> },
    { id: 'card', label: 'Transport Card', icon: <CreditCard /> },
    { id: 'notifications', label: 'Notifications', icon: <Notifications /> },
  ];

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
                Student Portal
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
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {user?.name || 'Student'}
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
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          {/* Overview View */}
          {activeView === 'overview' && (
            <Grid container spacing={3}>
              {/* Bus Status Card */}
              <Grid item xs={12}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.3
                  }
                }}>
                  <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                      <Box>
                        <Typography variant="overline" sx={{ opacity: 0.9, fontSize: '0.75rem', letterSpacing: '1.5px' }}>
                          CURRENT STATUS
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, mt: 0.5 }}>
                          Bus Status
                        </Typography>
                        <Chip 
                          label={tripStatus === 'active' ? 'ACTIVE TRIP' : 'STANDBY'} 
                          sx={{ 
                            bgcolor: tripStatus === 'active' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                            color: 'white', 
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 28,
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        />
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                          {assignedBus?.busNumber || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
                          Bus Number
                        </Typography>
                      </Box>
                    </Box>

                    {assignedBus && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            Route
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {assignedRoute?.routeName || 'N/A'}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            Driver
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {driverInfo?.name || 'N/A'}
                          </Typography>
                        </Box>
                        {assignedRoute?.departureTime && (
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                              Departure Time
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {assignedRoute.departureTime}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {tripStatus === 'active' && busLocation && (
                      <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            Estimated Arrival
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {getEstimatedArrival()}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="indeterminate"
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: 'white',
                              borderRadius: 3
                            }
                          }} 
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              {/* Profile Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '1px' }}>
                  PROFILE
                </Typography>
                <Box display="flex" alignItems="center" gap={2.5} sx={{ mt: 2, mb: 3 }}>
                  <Avatar sx={{ 
                    width: 72, 
                    height: 72, 
                    bgcolor: 'primary.main', 
                    fontSize: 28,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {user?.name || 'Student'}
                    </Typography>
                    <Chip
                      icon={<BadgeIcon sx={{ fontSize: 16 }} />}
                      label={user?.studentId || 'N/A'}
                      size="small"
                      sx={{ 
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        fontWeight: 600,
                        height: 24,
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Email sx={{ fontSize: 18, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {user?.email || 'N/A'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Phone sx={{ fontSize: 18, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {user?.phone || 'N/A'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <School sx={{ fontSize: 18, color: 'primary.main' }} />
                    </Box>
                    <Chip
                      label={user?.feeStatus ? user.feeStatus.replace('_', ' ').toUpperCase() : 'PENDING'}
                      size="small"
                      sx={{
                        height: 24,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        bgcolor: user?.feeStatus === 'paid' ? 'rgba(76, 175, 80, 0.1)' :
                                 user?.feeStatus === 'partially_paid' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                        color: user?.feeStatus === 'paid' ? '#4caf50' :
                               user?.feeStatus === 'partially_paid' ? '#ff9800' : '#9e9e9e'
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Virtual Transport Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '1px' }}>
                  TRANSPORT CARD
                </Typography>
                <Box
                  id="transport-card"
                  sx={{
                    mt: 2,
                    mb: 3,
                    p: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 3,
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2, position: 'relative', zIndex: 1 }}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.65rem', letterSpacing: '1px' }}>
                        CAMPUS TRANSPORT
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.6rem', display: 'block', mt: 0.5 }}>
                        Student ID Card
                      </Typography>
                    </Box>
                    <DirectionsBus sx={{ fontSize: 32, opacity: 0.9 }} />
                  </Box>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {user?.name || 'Student Name'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontSize: '0.85rem' }}>
                      ID: {user?.studentId || 'N/A'}
                    </Typography>
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {assignedBus?.busNumber || 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                        Route: {assignedRoute?.routeName || 'Not Assigned'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)', position: 'relative', zIndex: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                      Valid: {new Date().getFullYear()} - {new Date().getFullYear() + 1}
                    </Typography>
                    <Chip 
                      label={user?.feeStatus === 'paid' ? 'ACTIVE' : 'INACTIVE'}
                      size="small"
                      sx={{
                        bgcolor: user?.feeStatus === 'paid' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontSize: '0.65rem',
                        height: 20,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Download />}
                  onClick={() => setOpenTransportCardDialog(true)}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Download Card
                </Button>
              </CardContent>
            </Card>
          </Grid>
            </Grid>
          )}

          {/* Live Tracking View */}
          {activeView === 'tracking' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Live Bus Tracking
                    </Typography>
                    {assignedBus ? (
                      <Box>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            {assignedBus.busNumber} - {assignedBus.model}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Driver: {assignedBus.driverId?.name || 'Not assigned'}
                          </Typography>
                        </Box>

                        {busLocation ? (
                          <Box>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Current Location
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LocationOn color="primary" />
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  Live GPS Tracking Active
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Last updated: {new Date().toLocaleTimeString()}
                              </Typography>
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

                            <Button
                              variant="contained"
                              startIcon={<Map />}
                              onClick={() => setOpenDialog(true)}
                              fullWidth
                              sx={{ 
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                                  transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              View Live Map
                            </Button>
                          </Box>
                        ) : (
                          <Box textAlign="center" sx={{ py: 4 }}>
                            <LocationOn sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                              Location Not Available
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Bus tracking will start when trip begins
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box textAlign="center" sx={{ py: 4 }}>
                        <DirectionsBus sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No Bus Assigned
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Contact admin to assign a bus
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Schedule View */}
          {activeView === 'schedule' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Bus Schedule
                    </Typography>
                    {assignedRoute ? (
                      <Box>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            {assignedRoute.routeName} ({assignedRoute.routeNo})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Departure Time: {assignedRoute.departureTime || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Distance: {assignedRoute.distance || 'N/A'} km
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                          Bus Stops
                        </Typography>
                        {assignedRoute.stops && assignedRoute.stops.length > 0 ? (
                          <List>
                            {assignedRoute.stops.map((stop, index) => (
                              <ListItem key={index} sx={{ py: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Box sx={{ 
                                    width: 24, 
                                    height: 24, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>
                                      {stop.sequence}
                                    </Typography>
                                  </Box>
                                </ListItemIcon>
                                <ListItemText
                                  primary={stop.name}
                                  secondary={`Pickup Time: ${stop.pickupTime || 'N/A'} | Fee: PKR ${stop.fee || 0}`}
                                  primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 600 } }}
                                  secondaryTypographyProps={{ variant: 'caption' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No stops information available
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box textAlign="center" sx={{ py: 2 }}>
                        <Schedule sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No bus assigned. Contact admin for assignment.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Trip History View */}
          {activeView === 'history' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Trip History
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<History />}
                        onClick={() => {
                          loadTripHistory();
                          setOpenTripHistoryDialog(true);
                        }}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        View All
                      </Button>
                    </Box>
                    
                    <Box textAlign="center" sx={{ py: 2 }}>
                      <Timeline sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Track your trip history
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => {
                          loadTripHistory();
                          setOpenTripHistoryDialog(true);
                        }}
                      >
                        View Trip History
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Payments View */}
          {activeView === 'payments' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Fee Information
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Receipt />}
                        onClick={() => {
                          loadPaymentHistory();
                          setOpenPaymentHistoryDialog(true);
                        }}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          color: 'primary.main'
                        }}
                      >
                        History
                      </Button>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                        <Typography variant="body2" color="text.secondary">Monthly Fee</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          PKR {feeDetails.monthlyFee}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                        <Typography variant="body2" color="text.secondary">Paid Amount</Typography>
                        <Typography variant="body1" color="success.main" sx={{ fontWeight: 700 }}>
                          PKR {feeDetails.paidAmount}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                        <Typography variant="body2" color="text.secondary">Due Amount</Typography>
                        <Chip
                          label={`PKR ${feeDetails.dueAmount}`}
                          sx={{
                            bgcolor: feeDetails.dueAmount > 0 ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                            color: feeDetails.dueAmount > 0 ? '#f44336' : '#4caf50',
                            fontWeight: 700,
                            fontSize: '0.875rem'
                          }}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Next Due Date
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {new Date(feeDetails.nextDueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Alert 
                      severity={feeDetails.dueAmount === 0 ? 'success' : 'warning'}
                      sx={{ 
                        mt: 2,
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          fontSize: '1.2rem'
                        }
                      }}
                    >
                      {feeDetails.dueAmount === 0 
                        ? 'All fees are paid. Payment can be made offline at the admin office.' 
                        : `PKR ${feeDetails.dueAmount} due. Please make payment offline at the admin office.`}
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Transport Card View */}
          {activeView === 'card' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Your Transport Card
                    </Typography>
                <Box
                  id="transport-card"
                  sx={{
                    mt: 2,
                    mb: 3,
                    p: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 3,
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2, position: 'relative', zIndex: 1 }}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.65rem', letterSpacing: '1px' }}>
                        CAMPUS TRANSPORT
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.6rem', display: 'block', mt: 0.5 }}>
                        Student ID Card
                      </Typography>
                    </Box>
                    <DirectionsBus sx={{ fontSize: 32, opacity: 0.9 }} />
                  </Box>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {user?.name || 'Student Name'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontSize: '0.85rem' }}>
                      ID: {user?.studentId || 'N/A'}
                    </Typography>
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {assignedBus?.busNumber || 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                        Route: {assignedRoute?.routeName || 'Not Assigned'}
                      </Typography>
                      {driverInfo && (
                        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                          Driver: {driverInfo.name}
                        </Typography>
                      )}
                      {assignedRoute?.departureTime && (
                        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                          Departure: {assignedRoute.departureTime}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)', position: 'relative', zIndex: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                      Valid: {new Date().getFullYear()} - {new Date().getFullYear() + 1}
                    </Typography>
                    <Chip 
                      label={user?.feeStatus === 'paid' ? 'ACTIVE' : 'INACTIVE'}
                      size="small"
                      sx={{
                        bgcolor: user?.feeStatus === 'paid' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontSize: '0.65rem',
                        height: 20,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Download />}
                  onClick={() => setOpenTransportCardDialog(true)}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Download Card
                </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Assigned Bus Details Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Assigned Bus Details
                    </Typography>
                    
                    {assignedBus ? (
                      <Box>
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                              {assignedBus.busNumber}
                            </Typography>
                            <Chip 
                              label={assignedBus.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
                              color={assignedBus.status === 'available' ? 'success' : assignedBus.status === 'on_trip' ? 'primary' : 'default'}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {assignedBus.model} ({assignedBus.year})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Capacity: {assignedBus.capacity} seats
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Driver Information
                          </Typography>
                          {driverInfo ? (
                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                              <Box display="flex" alignItems="center" gap={2} sx={{ mb: 1 }}>
                                <Avatar>{driverInfo.name?.charAt(0) || 'D'}</Avatar>
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {driverInfo.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    License: {driverInfo.licenseNumber || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box display="flex" gap={1} sx={{ mt: 1 }}>
                                <Chip 
                                  icon={<Phone />}
                                  label={driverInfo.phone || 'N/A'}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Driver information not available
                            </Typography>
                          )}
                        </Box>
                        
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Route Information
                          </Typography>
                          {assignedRoute ? (
                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                {assignedRoute.routeName} ({assignedRoute.routeNo})
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Departure: {assignedRoute.departureTime || 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Stops: {assignedRoute.stops?.length || 0}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Route information not available
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Box textAlign="center" sx={{ py: 4 }}>
                        <DirectionsBus sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No Bus Assigned
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Contact admin to assign a bus
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Notifications View */}
          {activeView === 'notifications' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Notifications
                        {unreadCount > 0 && (
                          <Chip 
                            label={unreadCount} 
                            color="error" 
                            size="small" 
                            sx={{ ml: 2 }}
                          />
                        )}
                      </Typography>
                      {unreadCount > 0 && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleMarkAllAsRead}
                          startIcon={<CheckCircle />}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Mark All Read
                        </Button>
                      )}
                    </Box>

                    {notifications.length === 0 ? (
                      <Box textAlign="center" py={6}>
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
                            <ListItem 
                              alignItems="flex-start"
                              sx={{
                                bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                                borderRadius: 2,
                                mb: 1,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: notification.isRead ? 'action.hover' : 'action.selected'
                                }
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                  <Notifications />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                    <Typography 
                                      variant="subtitle1" 
                                      sx={{ 
                                        fontWeight: 600,
                                        color: notification.isRead ? 'text.secondary' : 'text.primary'
                                      }}
                                    >
                                      {notification.title}
                                    </Typography>
                                    <Chip 
                                      label={notification.type} 
                                      size="small" 
                                      color={notification.type === 'emergency' ? 'error' : notification.type === 'warning' ? 'warning' : 'info'}
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        mt: 1,
                                        color: notification.isRead ? 'text.secondary' : 'text.primary'
                                      }}
                                    >
                                      {notification.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                      {new Date(notification.createdAt).toLocaleString()}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Box display="flex" gap={0.5}>
                                  {!notification.isRead && (
                                    <IconButton 
                                      edge="end" 
                                      size="small"
                                      onClick={() => handleMarkAsRead(notification._id)}
                                      color="primary"
                                    >
                                      <CheckCircle fontSize="small" />
                                    </IconButton>
                                  )}
                                  <IconButton 
                                    edge="end" 
                                    size="small"
                                    onClick={() => handleDeleteNotification(notification._id)}
                                    color="error"
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              </ListItemSecondaryAction>
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
      </Box>

      {/* Map Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Live Bus Tracking</Typography>
            <Chip 
              label={tripStatus === 'active' ? 'ACTIVE' : 'INACTIVE'} 
              color={tripStatus === 'active' ? 'success' : 'default'}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {assignedRoute ? (
            <BusMap routeId={assignedRoute._id} height={500} />
          ) : (
            <Box sx={{ height: 400, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box textAlign="center">
                <Map sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No Route Assigned
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please contact admin to assign a route
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Transport Card Download Dialog */}
      <Dialog open={openTransportCardDialog} onClose={() => setOpenTransportCardDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CreditCard />
            <Typography variant="h6">Download Transport Card</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Click the button below to download your transport card as an image or print it.
            </Alert>
            <Box
              id="transport-card-preview"
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                color: 'white',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                mb: 3
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem', letterSpacing: '1px' }}>
                    CAMPUS TRANSPORT
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem', display: 'block', mt: 0.5 }}>
                    Student ID Card
                  </Typography>
                </Box>
                <DirectionsBus sx={{ fontSize: 40, opacity: 0.9 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {user?.name || 'Student Name'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, fontSize: '0.95rem' }}>
                  ID: {user?.studentId || 'N/A'}
                </Typography>
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {assignedBus?.busNumber || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
                    Route: {assignedRoute?.routeName || 'Not Assigned'}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                  Valid: {new Date().getFullYear()} - {new Date().getFullYear() + 1}
                </Typography>
                <Chip 
                  label={user?.feeStatus === 'paid' ? 'ACTIVE' : 'INACTIVE'}
                  size="small"
                  sx={{
                    bgcolor: user?.feeStatus === 'paid' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 24,
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenTransportCardDialog(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />}
            onClick={handleDownloadTransportCard}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            Download / Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={openScheduleDialog} onClose={() => setOpenScheduleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarToday />
            <Typography variant="h6">Bus Schedule</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {assignedRoute ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {assignedRoute.routeName}
              </Typography>
              {assignedRoute.timings && assignedRoute.timings.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Time</strong></TableCell>
                        <TableCell><strong>Description</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignedRoute.timings.map((timing, index) => (
                        <TableRow key={index}>
                          <TableCell>{timing.type || 'Regular'}</TableCell>
                          <TableCell>{timing.time || 'N/A'}</TableCell>
                          <TableCell>{timing.description || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" sx={{ py: 4 }}>
                  <Schedule sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Schedule information not available
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box textAlign="center" sx={{ py: 4 }}>
              <Route sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No route assigned. Please contact admin.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScheduleDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Trip History Dialog */}
      <Dialog open={openTripHistoryDialog} onClose={() => setOpenTripHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Timeline />
            <Typography variant="h6">Trip History</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {tripHistory.length > 0 ? (
            <TableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Route</strong></TableCell>
                    <TableCell><strong>Bus</strong></TableCell>
                    <TableCell><strong>Time</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tripHistory.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>{new Date(trip.date).toLocaleDateString()}</TableCell>
                      <TableCell>{trip.route}</TableCell>
                      <TableCell>{trip.bus}</TableCell>
                      <TableCell>{trip.startTime} - {trip.endTime}</TableCell>
                      <TableCell>{trip.duration}</TableCell>
                      <TableCell>
                        <Chip 
                          label={trip.status} 
                          color={trip.status === 'completed' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" sx={{ py: 4 }}>
              <History sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No trip history available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTripHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={openPaymentHistoryDialog} onClose={() => setOpenPaymentHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Receipt />
            <Typography variant="h6">Payment History</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {paymentHistory.length > 0 ? (
            <TableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Method</strong></TableCell>
                    <TableCell><strong>Transaction ID</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>₹{payment.amount}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.transactionId}</TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.status} 
                          color={payment.status === 'completed' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" sx={{ py: 4 }}>
              <Receipt sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No payment history available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default StudentDashboard;