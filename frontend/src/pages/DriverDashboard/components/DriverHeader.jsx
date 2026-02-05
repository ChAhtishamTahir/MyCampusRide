import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Badge, IconButton, Popover
} from '@mui/material';
import { Refresh, Notifications, Send } from '@mui/icons-material';
import NotificationPanel from '../../../components/NotificationPanel';
import SendNotificationModal from '../../../components/SendNotificationModal';
import { notificationService } from '../../../services';

const menuItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'trips', label: 'My Trips' },
  { id: 'tracking', label: 'Tracking' },
  { id: 'profile', label: 'Profile' },
];

const DriverHeader = ({ activeView, user }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [sendNotificationOpen, setSendNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh - in real app, trigger actual data refresh
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleSendNotificationOpen = () => {
    setSendNotificationOpen(true);
  };
  
  const handleSendNotificationClose = () => {
    setSendNotificationOpen(false);
  };
  
  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getNotificationStats();
      // Assuming the API returns a count of unread notifications
      const stats = response.data;
      // Update with actual field name from API response
      setUnreadCount(stats.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notification stats:', error);
      // Fallback to loading recent notifications to count unread
      try {
        const response = await notificationService.getNotifications({ limit: 50 });
        const notifications = response.data.data || [];
        const unread = notifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Error loading notifications fallback:', err);
        setUnreadCount(0);
      }
    }
  };
  
  // Function to manually refresh unread count
  const refreshUnreadCount = () => {
    loadUnreadCount();
  };

  useEffect(() => {
    loadUnreadCount();
  }, []);
  
  return (
    <>
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
            {menuItems.find(item => item.id === activeView)?.label || 'Driver Dashboard'}
          </Typography>
          {(user?.role === 'admin' || user?.role === 'driver') && (
          <Button
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              mr: 1
            }}
            startIcon={<Send />}
            onClick={handleSendNotificationOpen}
          >
            Send Notification
          </Button>
          )}
          
          <SendNotificationModal
            open={sendNotificationOpen}
            onClose={handleSendNotificationClose}
            user={user}
          />
          <IconButton
            size="large"
            aria-label="show notifications"
            color="inherit"
            onClick={handleNotificationClick}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
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
      
      <Popover
        open={Boolean(notificationAnchorEl)}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{ mt: 1 }}
      >
        <div style={{ width: 350 }}>
          <NotificationPanel maxHeight={400} />
        </div>
      </Popover>
      
      <SendNotificationModal
        open={sendNotificationOpen}
        onClose={handleSendNotificationClose}
      />
    </>
  );
};

export default DriverHeader;