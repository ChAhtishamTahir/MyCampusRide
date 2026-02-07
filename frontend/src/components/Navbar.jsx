import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  Notifications,
  DirectionsBus,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LogoutConfirmDialog from './LogoutConfirmDialog';

const Navbar = () => {
  const { user, logout, isAdmin, isDriver, isStudent } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
    handleMenuClose();
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    toast.success("You have been logged out successfully.");
    navigate('/');
    setShowLogoutDialog(false);
    setIsLoggingOut(false);
  };

  const handleProfile = () => {
    if (isAdmin()) navigate('/admin-dashboard');
    else if (isDriver()) navigate('/driver-dashboard');
    else if (isStudent()) navigate('/student-dashboard');
    handleMenuClose();
  };

  const handleSettings = () => {
    if (isAdmin()) navigate('/admin-dashboard');
    else if (isDriver()) navigate('/driver-dashboard');
    else if (isStudent()) navigate('/student-dashboard');
    handleMenuClose();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'driver':
        return 'warning';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'driver':
        return 'Driver';
      case 'student':
        return 'Student';
      default:
        return 'User';
    }
  };

  const menuId = 'primary-search-account-menu';
  const mobileMenuId = 'primary-search-account-menu-mobile';

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfile}>
        <AccountCircle sx={{ mr: 1 }} />
        Profile
      </MenuItem>
      <MenuItem onClick={handleSettings}>
        <Settings sx={{ mr: 1 }} />
        Settings
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <Logout sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchor}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfile}>
        <AccountCircle sx={{ mr: 1 }} />
        Profile
      </MenuItem>
      <MenuItem onClick={handleSettings}>
        <Settings sx={{ mr: 1 }} />
        Settings
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <Logout sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* Logo and Title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mr: 2,
          }}
          onClick={() => navigate('/')}
        >
          <DirectionsBus sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontWeight: 600,
            }}
          >
            MyCampusRide
          </Typography>
        </Box>

        {/* Navigation Links - Desktop */}
        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            {isAdmin() && (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin-dashboard')}
                  sx={{ fontWeight: 500 }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin-dashboard')}
                  sx={{ fontWeight: 500 }}
                >
                  Users
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin-dashboard')}
                  sx={{ fontWeight: 500 }}
                >
                  Buses
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin-dashboard')}
                  sx={{ fontWeight: 500 }}
                >
                  Routes
                </Button>
              </>
            )}
            
            {isDriver() && (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/driver-dashboard')}
                  sx={{ fontWeight: 500 }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/driver-dashboard')}
                  sx={{ fontWeight: 500 }}
                >
                  My Trips
                </Button>
              </>
            )}
            
            {isStudent() && (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/student-dashboard')}
                  sx={{ fontWeight: 500 }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/student-dashboard')}
                  sx={{ fontWeight: 500 }}
                >
                  Track Bus
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* User Info and Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Notifications */}
          <IconButton
            size="large"
            color="inherit"
            onClick={() => {
              if (isAdmin()) navigate('/admin-dashboard');
              else if (isDriver()) navigate('/driver-dashboard');
              else if (isStudent()) navigate('/student-dashboard');
            }}
          >
            <Notifications />
          </IconButton>

          {/* User Info */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user?.name}
            </Typography>
            <Chip
              label={getRoleText(user?.role)}
              color={getRoleColor(user?.role)}
              size="small"
            />
          </Box>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'secondary.main',
                fontSize: '0.875rem',
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {renderMenu}
      {renderMobileMenu}

      <LogoutConfirmDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={confirmLogout}
        loading={isLoggingOut}
      />
    </AppBar>
  );
};

export default Navbar;




