import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DriverSidebar from './components/DriverSidebar';
import DriverHeader from './components/DriverHeader';
import DriverOverviewView from './components/DriverOverviewView';
import DriverTripsView from './components/DriverTripsView';
import DriverTrackingView from './components/DriverTrackingView';
import DriverLiveTrackingView from './components/DriverLiveTrackingView';
import DriverProfileView from './components/DriverProfileView';
import DriverPassengersView from './components/DriverPassengersView';
import DriverNotificationsView from './components/DriverNotificationsView';
import { BACKGROUND_GRADIENTS, SIDEBAR_STYLES, BRAND_COLORS } from '../../styles/brandStyles';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeView, setActiveView] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!user || user.role !== 'driver') {
    navigate('/');
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <DriverOverviewView />;
      case 'passengers':
        return <DriverPassengersView />;
      case 'trips':
        return <DriverTripsView />;
      case 'tracking':
        return <DriverTrackingView />;
      case 'live-tracking':
        return <DriverLiveTrackingView />;
      case 'profile':
        return <DriverProfileView />;
      case 'notifications':
        return <DriverNotificationsView />;
      default:
        return <DriverOverviewView />;
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      background: BACKGROUND_GRADIENTS.page,
      minHeight: '100vh',
    }}>
      <DriverSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        logout={logout}
        navigate={navigate}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          width: { md: `calc(100% - ${SIDEBAR_STYLES.width}px)` },
        }}
      >
        <DriverHeader
          activeView={activeView}
          setActiveView={setActiveView}
          user={user}
          handleDrawerToggle={handleDrawerToggle}
          onRefresh={handleRefresh}
        />
        <React.Fragment key={refreshKey}>
          {renderActiveView()}
        </React.Fragment>
      </Box>
    </Box>
  );
};

export default DriverDashboard;