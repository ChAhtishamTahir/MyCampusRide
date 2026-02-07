/**
 * AdminHeader Component
 *
 * Top header bar for the Admin Portal with brand styling.
 * Features:
 * - Glassmorphism effect with blur backdrop
 * - Notification center with brand-colored badge
 * - Gradient refresh button
 * - Mobile menu toggle
 * - Smooth transitions and hover effects
 *
 * The design matches the landing page with modern effects and brand colors.
 */

import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Badge, IconButton, Popover, useTheme, useMediaQuery
} from '@mui/material';
import { Refresh, Notifications, Menu as MenuIcon } from '@mui/icons-material';
import NotificationPanel from '../../../components/NotificationPanel';
import { notificationService } from '../../../services';
import {
  BRAND_COLORS,
  BUTTON_STYLES,
  glassmorphism,
  BORDER_RADIUS,
  SHADOWS
} from '../styles/brandStyles';

// Menu item labels for displaying current view name
const menuItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'buses', label: 'Buses' },
  { id: 'routes', label: 'Routes' },
  { id: 'fee-management', label: 'Fee Management' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'profile', label: 'Profile' },
];

const AdminHeader = ({ activeView, handleDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [refreshing, setRefreshing] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Handle refresh button click
   * Simulates data refresh with a brief delay
   */
  const handleRefresh = () => {
    setRefreshing(true);
    // In a real application, trigger actual data refresh here
    setTimeout(() => setRefreshing(false), 1000);
  };

  /**
   * Open notification panel popover
   */
  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  /**
   * Close notification panel popover
   */
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  /**
   * Load unread notification count from API
   * Falls back to counting unread notifications if stats endpoint fails
   */
  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getNotificationStats();
      const stats = response.data;
      setUnreadCount(stats.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notification stats:', error);
      // Fallback: Load notifications and count unread
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

  /**
   * Manually refresh unread count
   * Can be called from child components
   */
  const refreshUnreadCount = () => {
    loadUnreadCount();
  };

  // Load unread count on component mount
  useEffect(() => {
    loadUnreadCount();
  }, []);

  return (
    <>
      {/* Top Header Bar with glassmorphism effect */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          // Glassmorphism effect - matches landing page navigation
          ...glassmorphism(10, 0.98),
          borderBottom: `1px solid ${BRAND_COLORS.slate300}`,
          boxShadow: SHADOWS.sm,
        }}
      >
        <Toolbar>
          {/* Mobile Menu Toggle Button */}
          {isMobile && (
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                color: BRAND_COLORS.skyBlue,
                '&:hover': {
                  bgcolor: 'rgba(14, 165, 233, 0.08)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Page Title - Shows current active view */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              flexGrow: 1,
              color: BRAND_COLORS.slate900,
            }}
          >
            {menuItems.find(item => item.id === activeView)?.label || 'Admin Dashboard'}
          </Typography>

          {/* Notification Button with Badge */}
          <IconButton
            size="large"
            aria-label="show notifications"
            onClick={handleNotificationClick}
            sx={{
              mr: 1,
              color: BRAND_COLORS.slate700,
              transition: 'all 0.3s ease',
              '&:hover': {
                color: BRAND_COLORS.skyBlue,
                bgcolor: 'rgba(14, 165, 233, 0.08)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <Badge
              badgeContent={unreadCount}
              sx={{
                '& .MuiBadge-badge': {
                  background: BRAND_COLORS.adminOrange,
                  color: BRAND_COLORS.white,
                  fontWeight: 600,
                },
              }}
            >
              <Notifications />
            </Badge>
          </IconButton>

          {/* Refresh Button (Hidden on mobile) - Gradient styled */}
          {!isMobile && (
            <Button
              variant="contained"
              sx={{
                ...BUTTON_STYLES.primary,
                px: 3,
                py: 1,
                minWidth: 120,
              }}
              startIcon={<Refresh sx={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }} />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Notification Panel Popover */}
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
        sx={{
          mt: 1,
          '& .MuiPopover-paper': {
            borderRadius: BORDER_RADIUS.lg,
            boxShadow: SHADOWS.xl,
            overflow: 'hidden',
          },
        }}
      >
        <div style={{ width: 350 }}>
          <NotificationPanel maxHeight={400} />
        </div>
      </Popover>
    </>
  );
};

export default AdminHeader;
