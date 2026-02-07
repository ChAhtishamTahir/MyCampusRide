import React, { useState } from 'react';
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Drawer, Avatar, Typography, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import {
  People, DirectionsBus, Route as RouteIcon, Notifications,
  Security, Logout, Dashboard, Payment, Person
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import LogoutConfirmDialog from '../../../components/LogoutConfirmDialog';

const drawerWidth = 280;

const menuItems = [
  { id: 'overview', label: 'Overview', icon: <Dashboard /> },
  { id: 'users', label: 'Users', icon: <People /> },
  { id: 'buses', label: 'Buses', icon: <DirectionsBus /> },
  { id: 'routes', label: 'Routes', icon: <RouteIcon /> },
  { id: 'fee-management', label: 'Fee Management', icon: <Payment /> },
  { id: 'notifications', label: 'Notifications', icon: <Notifications /> },
  { id: 'profile', label: 'Profile', icon: <Person /> },
];

const AdminSidebar = ({ activeView, setActiveView, user, logout, navigate, mobileOpen, handleDrawerToggle }) => {
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

  const drawerContent = (
    <>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <Security />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              MyCampusRide
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admin Portal
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              onClick={() => handleMenuItemClick(item.id)}
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
            </ListItemButton>
          </ListItem>
        ))}
      </List>

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
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {user?.name || 'Admin'}
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
    </>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'white',
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
              bgcolor: 'white',
              borderRight: '1px solid rgba(0,0,0,0.08)',
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

export default AdminSidebar;
