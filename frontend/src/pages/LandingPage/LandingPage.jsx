import React from 'react';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent
} from '@mui/material';
import {
  DirectionsBus, Person, Security, Login, HowToReg
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
            MyCampusRide
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
            Streamlined Campus Transportation Management
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px', mx: 'auto', color: 'text.secondary' }}>
            Efficiently manage campus bus routes, track vehicles in real-time, and enhance the commuting experience for students and staff.
          </Typography>
          
          <Box display="flex" justifyContent="center" gap={2}>
            <Button 
              variant="contained" 
              size="large" 
              startIcon={<Login />}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<HowToReg />}
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Box mb={8}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 600, mb: 6 }}>
            Key Features
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.light', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <DirectionsBus sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Bus Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track buses in real-time, manage schedules, and monitor vehicle status.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'secondary.light', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <Security sx={{ fontSize: 40, color: 'secondary.main' }} />
                </Box>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Admin Control
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comprehensive admin panel to manage users, buses, routes, and system settings.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'success.light', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  <Person sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    User Experience
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Intuitive dashboards for students and drivers with real-time tracking and notifications.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box textAlign="center" py={6} sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Ready to Transform Campus Transportation?
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Join thousands of students and staff who trust MyCampusRide
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            color="secondary"
            onClick={() => navigate('/register')}
          >
            Get Started Today
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;