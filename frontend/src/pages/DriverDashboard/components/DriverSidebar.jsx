/**
 * DriverSidebar Component
 *
 * Brand-styled sidebar navigation for the Driver Portal.
 * Features gradient brand logo, active menu states with smooth transitions,
 * profile section with gradient avatar border, and responsive drawer.
 */

import React, { useState } from 'react';
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Drawer, Avatar, Typography, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import {
  Dashboard, DirectionsBus, LocationOn, Person, Notifications, Logout, People, Map
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import LogoutConfirmDialog from '../../../components/LogoutConfirmDialog';
import {
  BRAND_COLORS,
  SIDEBAR_STYLES,
  BORDER_RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  glassmorphism,
} from '../../../styles/brandStyles';

const drawerWidth = SIDEBAR_STYLES.width;

const menuItems = [
  { id: 'overview', label: 'Overview', icon: <Dashboard /> },
  { id: 'passengers', label: 'Passengers', icon: <People /> },
  { id: 'trips', label: 'My Route', icon: <DirectionsBus /> },
  { id: 'tracking', label: 'Tracking', icon: <LocationOn /> },
  { id: 'live-tracking', label: 'Live Tracking', icon: <Map /> },
  { id: 'notifications', label: 'Notifications', icon: <Notifications /> },
  { id: 'profile', label: 'Profile', icon: <Person /> },
];

const DriverSidebar = ({ activeView, setActiveView, user, logout, navigate, mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    toast.success("You have been logged out successfully.");
    navigate('/');
    setShowLogoutDialog(false);
    setIsLoggingOut(false);
  };

  const handleMenuItemClick = (itemId) => {
    setActiveView(itemId);
    if (isMobile && handleDrawerToggle) {
      handleDrawerToggle();
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const drawerContent = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      ...glassmorphism(10, 0.98),
      borderRight: `1px solid ${BRAND_COLORS.slate300}`,
    }}>
      {/* Brand Logo Section */}
      <Box sx={{
        p: 3,
        borderBottom: `1px solid ${BRAND_COLORS.slate300}`,
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          {/* Gradient icon box */}
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: BORDER_RADIUS.md,
            background: BRAND_COLORS.primaryGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: SHADOWS.buttonDefault,
          }}>
            <DirectionsBus sx={{ color: BRAND_COLORS.white, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ ...SIDEBAR_STYLES.logo }}>
              MyCampusRide
            </Typography>
            <Typography variant="caption" sx={{
              color: BRAND_COLORS.slate600,
              fontWeight: TYPOGRAPHY.weights.medium,
              letterSpacing: TYPOGRAPHY.letterSpacing.wide,
              textTransform: 'uppercase',
              fontSize: '0.65rem',
            }}>
              Driver Portal
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', pb: 2 }}>
        <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuItemClick(item.id)}
                sx={{
                  borderRadius: BORDER_RADIUS.md,
                  py: 1.2,
                  px: 2,
                  ...(isActive ? {
                    background: BRAND_COLORS.primaryGradient,
                    color: BRAND_COLORS.white,
                    boxShadow: SHADOWS.buttonDefault,
                    '&:hover': {
                      background: BRAND_COLORS.primaryGradientHover,
                    },
                  } : {
                    color: BRAND_COLORS.slate700,
                    '&:hover': {
                      bgcolor: 'rgba(14, 165, 233, 0.08)',
                      color: BRAND_COLORS.skyBlue,
                    },
                  }),
                  transition: 'all 0.25s ease',
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 40,
                  color: 'inherit',
                  transition: 'all 0.25s ease',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? TYPOGRAPHY.weights.bold : TYPOGRAPHY.weights.semibold,
                    fontSize: '0.95rem',
                  }}
                />
                {/* Active slide indicator */}
                {isActive && (
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: 24,
                    borderRadius: '0 4px 4px 0',
                    background: BRAND_COLORS.white,
                    opacity: 0.6,
                  }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
        </List>
      </Box>

      {/* User Profile Section */}
      <Box sx={{
        p: 2,
        borderTop: `1px solid ${BRAND_COLORS.slate300}`,
        bgcolor: BRAND_COLORS.slate100,
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          {/* Gradient avatar border */}
          <Box sx={{
            p: 0.35,
            borderRadius: '50%',
            background: BRAND_COLORS.primaryGradient,
            display: 'flex',
          }}>
            <Avatar
              src={user?.profilePicture ? `${API_URL}/${user.profilePicture}` : undefined}
              sx={{
                bgcolor: BRAND_COLORS.white,
                color: BRAND_COLORS.skyBlue,
                fontWeight: TYPOGRAPHY.weights.bold,
                width: 40,
                height: 40,
                border: `2px solid ${BRAND_COLORS.white}`,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'D'}
            </Avatar>
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" sx={{
              fontWeight: TYPOGRAPHY.weights.bold,
              color: BRAND_COLORS.slate900,
            }} noWrap>
              {user?.name || 'Driver'}
            </Typography>
            <Typography variant="caption" sx={{
              color: BRAND_COLORS.slate600,
            }} noWrap>
              {user?.email || 'N/A'}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{
              color: BRAND_COLORS.errorRed,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                transform: 'scale(1.1)',
              },
            }}
          >
            <Logout fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <LogoutConfirmDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={confirmLogout}
        loading={isLoggingOut}
      />
    </>
  );
};

export default DriverSidebar;
