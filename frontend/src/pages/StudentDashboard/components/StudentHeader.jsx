import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Badge, IconButton, Popover, useTheme, useMediaQuery
} from '@mui/material';
import { Refresh, Notifications, Menu as MenuIcon } from '@mui/icons-material';
import NotificationPanel from '../../../components/NotificationPanel';
import { notificationService } from '../../../services';

const menuItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'tracking', label: 'Tracking' },
  { id: 'transport-card', label: 'Transport Card' },
  { id: 'profile', label: 'Profile' },
];

const StudentHeader = ({ activeView, handleDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [refreshing, setRefreshing] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getNotificationStats();
      const stats = response.data;
      setUnreadCount(stats.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notification stats:', error);
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
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1, color: 'text.primary' }}>
            {menuItems.find(item => item.id === activeView)?.label || 'Student Dashboard'}
          </Typography>
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
          {!isMobile && (
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
          )}
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
    </>
  );
};

export default StudentHeader;
