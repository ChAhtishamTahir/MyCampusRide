import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DriverSidebar from './components/DriverSidebar';
import DriverHeader from './components/DriverHeader';
import DriverOverviewView from './components/DriverOverviewView';
import DriverTripsView from './components/DriverTripsView';
import DriverTrackingView from './components/DriverTrackingView';
import DriverProfileView from './components/DriverProfileView';
import NotificationPanel from '../../components/NotificationPanel';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');

  if (!user || user.role !== 'driver') {
    navigate('/');
    return null;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <DriverOverviewView />;
      case 'trips':
        return <DriverTripsView />;
      case 'tracking':
        return <DriverTrackingView />;
      case 'profile':
        return <DriverProfileView />;
      case 'notifications':
        return (
          <Box p={3}>
            <NotificationPanel maxHeight={"calc(100vh - 200px)"} />
          </Box>
        );
      default:
        return <DriverOverviewView />;
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <DriverSidebar activeView={activeView} setActiveView={setActiveView} user={user} logout={logout} navigate={navigate} />
      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DriverHeader activeView={activeView} user={user} />
        {renderActiveView()}
      </Box>
    </Box>
  );
};

export default DriverDashboard;