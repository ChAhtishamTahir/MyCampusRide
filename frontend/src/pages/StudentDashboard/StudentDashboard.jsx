/**
 * StudentDashboard Component - Main Student Portal Container
 *
 * This component manages the entire student portal interface with modern brand styling.
 * Coordinates navigation, data loading, and view rendering for all student features.
 */

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services';
import StudentSidebar from './components/StudentSidebar';
import StudentHeader from './components/StudentHeader';
import StudentOverviewView from './components/StudentOverviewView';
import StudentScheduleView from './components/StudentScheduleView';
import StudentTrackingView from './components/StudentTrackingView';
import StudentProfileView from './components/StudentProfileView';
import VirtualTransportCard from './components/VirtualTransportCard';
import NotificationPanel from '../../components/NotificationPanel';
import { BACKGROUND_GRADIENTS } from './styles/brandStyles';

const StudentDashboard = () => {
  // Authentication and navigation
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State for view management and student data
  const [activeView, setActiveView] = useState('overview');
  const [assignedBus, setAssignedBus] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Toggle mobile drawer open/close state
   * Used for responsive sidebar on smaller screens
   */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    loadStudentData();
  }, [user]);

  const loadStudentData = async () => {
    if (!user) return;

    try {
      const userResponse = await authService.getMe();
      const userData = userResponse.data.data || userResponse.data;

      if (userData?.assignedBus) {
        if (typeof userData.assignedBus === 'object' && userData.assignedBus._id) {
          setAssignedBus(userData.assignedBus);

          if (userData.assignedBus.routeId) {
            if (typeof userData.assignedBus.routeId === 'object') {
              setAssignedRoute(userData.assignedBus.routeId);
            }
          }
        }
      } else {
        setAssignedBus(null);
        setAssignedRoute(null);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  if (!user || user.role !== 'student') {
    navigate('/');
    return null;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <StudentOverviewView />;
      case 'schedule':
        return <StudentScheduleView />;
      case 'tracking':
        return <StudentTrackingView />;
      case 'profile':
        return <StudentProfileView />;
      case 'transport-card':
        return (
          <Box display="flex" justifyContent="center" p={4}>
            <VirtualTransportCard user={user} assignedBus={assignedBus} assignedRoute={assignedRoute} />
          </Box>
        );
      case 'notifications':
        return (
          <Box p={3}>
            <NotificationPanel maxHeight={"calc(100vh - 200px)"} />
          </Box>
        );
      default:
        return <StudentOverviewView />;
    }
  };

  return (
    // Main layout container with brand gradient background
    <Box sx={{
      display: 'flex',
      // Gradient background matching landing page aesthetic
      background: BACKGROUND_GRADIENTS.page,
      minHeight: '100vh',
    }}>
      {/* Left Sidebar - Navigation with brand styling */}
      <StudentSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        logout={logout}
        navigate={navigate}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main Content Area */}
      <Box component="main" sx={{
        flexGrow: 1,
        overflow: 'auto',
        transition: 'all 0.3s ease',
      }}>
        {/* Top Header with user info */}
        <StudentHeader
          activeView={activeView}
          handleDrawerToggle={handleDrawerToggle}
        />

        {/* Dynamic view content */}
        {renderActiveView()}
      </Box>
    </Box>
  );
};

export default StudentDashboard;