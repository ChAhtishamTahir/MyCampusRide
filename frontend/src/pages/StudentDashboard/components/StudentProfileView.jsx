import React, { useState, useEffect } from 'react';
import {
  Container, Card, CardContent, Typography, Box, Avatar, Grid,
  TextField, Button, Tab, Tabs, CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon, Email, Phone, Badge as BadgeIcon, CreditCard, Lock as LockIcon
} from '@mui/icons-material';
import { authService } from '../../../services';
import VirtualTransportCard from './VirtualTransportCard';
import { toast } from 'react-toastify';

const StudentProfileView = () => {
  const [user, setUser] = useState(null);
  const [assignedBus, setAssignedBus] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      const userResponse = await authService.getMe();
      const userData = userResponse.data.data || userResponse.data;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        studentId: userData.studentId || ''
      });

      if (userData?.assignedBus) {
        if (typeof userData.assignedBus === 'object' && userData.assignedBus._id) {
          setAssignedBus(userData.assignedBus);

          if (userData.assignedBus.routeId) {
            if (typeof userData.assignedBus.routeId === 'object') {
              setAssignedRoute(userData.assignedBus.routeId);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const updateData = {
        email: formData.email,
        phone: formData.phone
      };

      await authService.updateProfile(updateData);
      toast.success('Your profile has been updated successfully. Changes are now active.');

      setUser(prev => ({ ...prev, ...updateData }));
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="h6">Loading your profile...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ p: 4 }}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Profile</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your personal information
              </Typography>
            </Box>
          </Box>

          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Personal Information" />
            <Tab label="Transport Card" />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box textAlign="center" mb={3}>
                  <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}>
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {user?.name || 'Student'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Student ID
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <BadgeIcon color="action" />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {user?.studentId || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Fee Status
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CreditCard color="action" />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {user?.feeStatus === 'paid' ? 'Paid' : 
                       user?.feeStatus === 'partially_paid' ? 'Partially Paid' : 
                       'Pending'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box display="flex" justifyContent="center" py={3}>
              <VirtualTransportCard user={user} assignedBus={assignedBus} assignedRoute={assignedRoute} />
            </Box>
          )}

          {activeTab === 0 && (
            <>
              <Grid container spacing={3} mt={1}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    disabled
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.disabled' }} />,
                      endAdornment: <LockIcon sx={{ color: 'action.disabled', fontSize: 20 }} />,
                    }}
                    helperText="Name cannot be changed. Contact admin to update."
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'rgba(0, 0, 0, 0.6)',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    type="email"
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    value={formData.studentId}
                    disabled
                    InputProps={{
                      startAdornment: <BadgeIcon sx={{ mr: 1, color: 'action.disabled' }} />,
                      endAdornment: <LockIcon sx={{ color: 'action.disabled', fontSize: 20 }} />,
                    }}
                    helperText="Student ID cannot be changed. Contact admin to update."
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'rgba(0, 0, 0, 0.6)',
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Box mt={3} textAlign="right">
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      <Typography>Saving your changes...</Typography>
                    </Box>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentProfileView;