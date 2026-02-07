import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import OverviewView from './components/OverviewView';
import UsersView from './components/UsersView';
import BusesView from './components/BusesView';
import RoutesView from './components/RoutesView';
import FeeManagementView from './components/FeeManagementView';
import NotificationsView from './components/NotificationsView';
import AdminProfileView from './components/AdminProfileView';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView />;
      case 'users':
        return <UsersView />;
      case 'buses':
        return <BusesView />;
      case 'routes':
        return <RoutesView />;
      case 'fee-management':
        return <FeeManagementView />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <AdminProfileView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <AdminSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        logout={logout}
        navigate={navigate}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <AdminHeader activeView={activeView} handleDrawerToggle={handleDrawerToggle} />
        {renderActiveView()}
      </Box>
    </Box>
  );
};

export default AdminDashboard;