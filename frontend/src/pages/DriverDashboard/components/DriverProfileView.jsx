import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, TextField,
  Button, Avatar, Chip, CircularProgress
} from '@mui/material';
import { Person as PersonIcon, Email, Phone, Badge as BadgeIcon, Lock as LockIcon } from '@mui/icons-material';
import { authService } from '../../../services';
import { toast } from 'react-toastify';

const DriverProfileView = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

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
        phone: userData.phone || '',
        licenseNumber: userData.licenseNumber || ''
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

      await authService.updateProfile(formData);

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
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Loading your profile...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar sx={{ width: 96, height: 96, mb: 2, bgcolor: 'primary.main' }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6">{user?.name}</Typography>
            {user?.licenseNumber && (
              <Typography variant="body2" color="text.secondary">
                License: {user.licenseNumber}
              </Typography>
            )}
            <Chip
              label="Driver"
              size="small"
              color="primary"
              sx={{ mt: 1 }}
            />
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
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
              
              <Grid item xs={12}>
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
              
              <Grid item xs={12}>
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
                <TextField
                  fullWidth
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  disabled
                  InputProps={{
                    startAdornment: <BadgeIcon sx={{ mr: 1, color: 'action.disabled' }} />,
                    endAdornment: <LockIcon sx={{ color: 'action.disabled', fontSize: 20 }} />,
                  }}
                  helperText="License number cannot be changed. Contact admin to update."
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'rgba(0, 0, 0, 0.6)',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
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
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DriverProfileView;