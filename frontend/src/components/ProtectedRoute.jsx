import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Alert } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user, isPendingApproval } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Access denied. You don't have permission to access this page.
        </Alert>
      </Box>
    );
  }

  // Check if user is suspended
  if (user?.status === 'suspended') {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Your account has been suspended. Please contact the administrator.
        </Alert>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;




