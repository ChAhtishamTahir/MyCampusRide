import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from './components/StudentSidebar';
import StudentHeader from './components/StudentHeader';
import StudentOverviewView from './components/StudentOverviewView';
import StudentScheduleView from './components/StudentScheduleView';
import StudentTrackingView from './components/StudentTrackingView';
import StudentProfileView from './components/StudentProfileView';
import VirtualTransportCard from './components/VirtualTransportCard';
import NotificationPanel from '../../components/NotificationPanel';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const [assignedBus, setAssignedBus] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);

  useEffect(() => {
    loadStudentData();
  }, [user]);

  const loadStudentData = async () => {
    if (!user) return;

    try {
      // Load assigned bus and route data from the populated user data
      if (user?.assignedBus) {
        if (typeof user.assignedBus === 'object' && user.assignedBus._id) {
          setAssignedBus(user.assignedBus);
          
          // Set route from populated bus data
          if (user.assignedBus.routeId) {
            if (typeof user.assignedBus.routeId === 'object') {
              setAssignedRoute(user.assignedBus.routeId);
            }
          }
        }
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
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <StudentSidebar activeView={activeView} setActiveView={setActiveView} user={user} logout={logout} navigate={navigate} />
      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <StudentHeader activeView={activeView} />
        {renderActiveView()}
      </Box>
    </Box>
  );
};

export default StudentDashboard;