import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, TextField,
  Button, Alert, Snackbar, Alert as MuiAlert, Avatar, Chip
} from '@mui/material';
import { Person as PersonIcon, Email, Phone, Badge as BadgeIcon, Lock as LockIcon } from '@mui/icons-material';
import { authService } from '../../../services';

const DriverProfileView = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

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
      setSnack({
        open: true,
        message: 'Failed to load user data',
        severity: 'error'
      });
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
      
      setSnack({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      
      // Refresh user data
      loadUserData();
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnack({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnack = () => {
    setSnack({ open: false, message: '', severity: 'success' });
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
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
                  {saving ? 'Updating...' : 'Update Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={handleCloseSnack}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default DriverProfileView;