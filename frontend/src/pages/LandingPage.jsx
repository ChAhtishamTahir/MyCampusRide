import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Link,
} from '@mui/material';
import {
  DirectionsBus,
  Security,
  Speed,
  Notifications,
  School,
  Person,
  LocationOn,
  AccessTime,
  Route,
  CheckCircle,
  TrendingUp,
  People,
  VerifiedUser,
  Wifi,
  Login,
  PersonAdd,
  StarRounded,
  Circle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Real-time Tracking',
      description: 'Track your bus in real-time with live GPS location updates and accurate estimated arrival times.',
      color: '#667eea',
    },
    {
      icon: <AccessTime sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Smart Scheduling',
      description: 'Manage routes with precise pickup times and automated trip management for smooth operations.',
      color: '#f093fb',
    },
    {
      icon: <Notifications sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Instant Notifications',
      description: 'Get notified instantly about delays, route changes, and important announcements.',
      color: '#4facfe',
    },
    {
      icon: <VerifiedUser sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure & Protected',
      description: 'Enterprise-grade security with role-based access control and encrypted communications.',
      color: '#43e97b',
    },
    {
      icon: <Route sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Route Management',
      description: 'Comprehensive route planning with multiple stops, fee management, and bus assignments.',
      color: '#fa709a',
    },
    {
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'User Management',
      description: 'Efficient management of students, drivers, and administrators with approval workflows.',
      color: '#30cfd0',
    },
  ];

  const roles = [
    {
      icon: <School sx={{ fontSize: 32 }} />,
      title: 'Students',
      description: 'View your assigned bus, track real-time location, and manage your transport card.',
      action: 'Register as Student',
      path: '/register?role=student',
      features: [
        'Real-time bus tracking',
        'Virtual transport card',
        'Route information',
        'Notification alerts',
      ],
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: <Person sx={{ fontSize: 32 }} />,
      title: 'Drivers',
      description: 'Manage your trips, update locations, and communicate with students and admins.',
      action: 'Register as Driver',
      path: '/register?role=driver',
      features: [
        'Trip management',
        'GPS location updates',
        'Send notifications',
        'Route details',
      ],
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: <Security sx={{ fontSize: 32 }} />,
      title: 'Administrators',
      description: 'Manage routes, buses, drivers, and oversee the entire transport system.',
      action: 'Register as Admin',
      path: '/register?role=admin',
      features: [
        'Dashboard overview',
        'User management',
        'Route configuration',
        'System analytics',
      ],
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#f5f7fa' }}>
      {/* Navigation Bar */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)', zIndex: 1000 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, md: 2 } }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                <DirectionsBus />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                MyCampusRide
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Sign Up
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: { xs: '100vh', md: '100vh' },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-30%',
            right: '-30%',
            width: '1000px',
            height: '1000px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            animation: 'float2 20s ease-in-out infinite',
            '@keyframes float2': {
              '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
              '50%': { transform: 'translate(60px, 60px) rotate(180deg)' },
            },
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(to top, #f5f7fa 0%, transparent 100%)',
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left Side - Content */}
            <Grid item xs={12} md={7}>
              <Box sx={{ color: 'white', pr: { md: 4 } }}>
                {/* Badge */}
                <Chip
                  label="🚌 MyCampusRide"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    mb: 3,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    py: 1.5,
                    backdropFilter: 'blur(15px)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: 3,
                  }}
                />

                {/* Main Heading */}
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontSize: { xs: '2.2rem', sm: '3rem', md: '3.8rem' },
                    fontWeight: 900,
                    mb: 2.5,
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    color: 'white',
                    textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                  }}
                >
                  Smart Campus Transport
                </Typography>

                {/* Subtitle */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3.5,
                    opacity: 0.95,
                    fontSize: { xs: '0.95rem', md: '1.1rem' },
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                    lineHeight: 1.4,
                  }}
                >
                  Real-time tracking, smart notifications, and seamless management for students, drivers, and administrators
                </Typography>

                {/* Feature Points */}
                <Box sx={{ mb: 4, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ color: 'white', fontSize: 24 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      Live GPS Tracking
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Notifications sx={{ color: 'white', fontSize: 24 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      Instant Alerts
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People sx={{ color: 'white', fontSize: 24 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      Multi-Role System
                    </Typography>
                  </Box>
                </Box>

                {/* CTA Buttons */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="medium"
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontSize: '0.95rem',
                      boxShadow: '0 8px 32px rgba(255,255,255,0.4)',
                      minWidth: 160,
                      '&:hover': {
                        bgcolor: 'grey.50',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(255,255,255,0.5)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => navigate('/login')}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    sx={{
                      borderColor: 'white',
                      borderWidth: 2,
                      color: 'white',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontSize: '0.95rem',
                      backdropFilter: 'blur(10px)',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      minWidth: 160,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => navigate('/register')}
                  >
                    Sign Up Free
                  </Button>
                </Stack>

              </Box>
            </Grid>

            {/* Right Side - Visual */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: '300px', md: '400px' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Main Bus Visual */}
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 2,
                      animation: 'float 6s ease-in-out infinite',
                      '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                        '50%': { transform: 'translateY(-30px) rotate(2deg)' },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 280, md: 340 },
                        height: { xs: 200, md: 240 },
                        bgcolor: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(20px)',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderRadius: 4,
                        boxShadow: '0 0 120px rgba(255,255,255,0.3), inset 0 0 60px rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <DirectionsBus sx={{ fontSize: { xs: 120, md: 160 }, color: 'white' }} />
                    </Box>
                  </Box>
                </Box>

                {/* Floating Icons */}
                <LocationOn
                  sx={{
                    position: 'absolute',
                    top: '10%',
                    right: '5%',
                    fontSize: 42,
                    color: 'rgba(255,255,255,0.6)',
                    animation: 'bounce 3s ease-in-out infinite',
                    '@keyframes bounce': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-20px)' },
                    },
                  }}
                />
                <Notifications
                  sx={{
                    position: 'absolute',
                    top: '30%',
                    left: '5%',
                    fontSize: 36,
                    color: 'rgba(255,255,255,0.5)',
                    animation: 'spin 5s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                <CheckCircle
                  sx={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '10%',
                    fontSize: 40,
                    color: 'rgba(255,255,255,0.7)',
                    animation: 'scale 4s ease-in-out infinite',
                    '@keyframes scale': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
                      '50%': { transform: 'scale(1.2)', opacity: 1 },
                    },
                  }}
                />
                <Route
                  sx={{
                    position: 'absolute',
                    bottom: '35%',
                    left: '8%',
                    fontSize: 32,
                    color: 'rgba(255,255,255,0.6)',
                    animation: 'pulse 3.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
                      '50%': { transform: 'scale(1.3)', opacity: 1 },
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12, px: { xs: 2, md: 4 } }}>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{ mb: 2, fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Powerful Features
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Everything you need to manage campus transport efficiently
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  p: 4,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px -10px ${feature.color}40`,
                    borderColor: feature.color,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 3,
                      bgcolor: `${feature.color}15`,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 700 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Roles Section */}
      <Box sx={{ bgcolor: 'white', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{ mb: 2, fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' } }}
            >
              Designed for Everyone
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto', fontSize: { xs: '1rem', md: '1.15rem' } }}
            >
              Tailored experiences for students, drivers, and administrators
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {roles.map((role, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    p: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                    borderRadius: 4,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  {/* Gradient Header */}
                  <Box
                    sx={{
                      background: role.gradient,
                      p: 4,
                      pb: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 70,
                        height: 70,
                        mb: 2,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        border: '3px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {role.icon}
                    </Avatar>
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      sx={{ 
                        mb: 1, 
                        fontWeight: 700,
                        color: 'white',
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      }}
                    >
                      {role.title}
                    </Typography>
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3, 
                        lineHeight: 1.7,
                        fontSize: '0.95rem',
                      }}
                    >
                      {role.description}
                    </Typography>
                    <Box sx={{ flexGrow: 1, mb: 3 }}>
                      <List dense sx={{ textAlign: 'left' }}>
                        {role.features.map((feature, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{ 
                                variant: 'body2', 
                                fontWeight: 500,
                                fontSize: '0.9rem',
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={() => navigate(role.path)}
                      sx={{
                        mt: 'auto',
                        textTransform: 'none',
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1rem',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                        },
                      }}
                    >
                      {role.action}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#f5f7fa', py: 12 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              p: { xs: 6, md: 10 },
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h2" 
                component="h2" 
                sx={{ mb: 3, fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' } }}
              >
                Ready to Transform Your Campus Transport?
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ mb: 5, opacity: 0.95, maxWidth: 600, mx: 'auto' }}
              >
                Join thousands of students, drivers, and administrators who trust MyCampusRide
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 8,
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 8,
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/register')}
              >
                Get Started Today
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box sx={{ bgcolor: 'white', borderTop: '1px solid rgba(0,0,0,0.08)', py: 4 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                <DirectionsBus />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                MyCampusRide
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              © 2024 MyCampusRide. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;




