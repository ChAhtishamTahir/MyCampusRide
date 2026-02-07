/**
 * AdminDashboard Component
 *
 * Main container for the Admin Portal with modern brand styling.
 * Features:
 * - Sidebar navigation with gradient active states
 * - Top header with notifications
 * - Dynamic view rendering based on selection
 * - Responsive layout (drawer on mobile)
 * - Brand-consistent background gradient
 *
 * This is the entry point for the admin portal, coordinating all
 * sub-components and managing the overall layout.
 */

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
import { BACKGROUND_GRADIENTS } from './styles/brandStyles';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Toggle mobile drawer open/close
   */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  /**
   * Authorization check - redirect if not admin
   * This runs on every render to ensure security
   */
  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  /**
   * Render the active view based on sidebar selection
   * Each view is a separate component for better code organization
   *
   * @returns {JSX.Element} The currently selected view component
   */
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
    // Main layout container with brand background gradient
    <Box sx={{
      display: 'flex',
      // Subtle gradient background matching landing page aesthetic
      background: BACKGROUND_GRADIENTS.page,
      minHeight: '100vh',
    }}>
      {/* Left Sidebar - Navigation menu with brand styling */}
      <AdminSidebar
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
        // Smooth transitions when views change
        transition: 'all 0.3s ease',
      }}>
        {/* Top Header - Notifications and refresh */}
        <AdminHeader
          activeView={activeView}
          handleDrawerToggle={handleDrawerToggle}
        />

        {/* Dynamic View Content */}
        {renderActiveView()}
      </Box>
    </Box>
  );
};

export default AdminDashboard;