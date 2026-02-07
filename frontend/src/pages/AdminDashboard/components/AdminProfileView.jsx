import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, TextField,
  Button, Avatar, Chip, CircularProgress, Tab, Tabs
} from '@mui/material';
import { Person as PersonIcon, Email, Phone, Lock as LockIcon } from '@mui/icons-material';
import { authService } from '../../../services';
import PasswordChangeForm from '../../../components/PasswordChangeForm';
import { toast } from 'react-toastify';

const AdminProfileView = () => {
  const [user, setUser] = useState(null);
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
      const response = await authService.getMe();
      const userData = response.data.data || response.data;

      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
    } catch (err) {
      console.error('Error loading user data:', err);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      await authService.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });

      toast.success('Your profile has been updated successfully. Changes are now active.');

      loadUserData();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Loading your profile...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Profile</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your account settings
              </Typography>
            </Box>
          </Box>

          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Personal Information" />
            <Tab label="Security" />
          </Tabs>

          {activeTab === 0 && (
            <>
              <Box textAlign="center" mb={4}>
                <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user?.name || 'Admin'}
                </Typography>
                <Chip
                  label="Administrator"
                  size="small"
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box textAlign="right">
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={saving}
                        size="large"
                      >
                        {saving ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                            <Typography>Saving your changes...</Typography>
                          </Box>
                        ) : (
                          'Update Profile'
                        )}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </>
          )}

          {activeTab === 1 && (
            <Box py={3}>
              <PasswordChangeForm />
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminProfileView;
