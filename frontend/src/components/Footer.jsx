import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Divider,
  useTheme,
} from '@mui/material';
import {
  DirectionsBus,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DirectionsBus sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                MyCampusRide
              </Typography>
            </Box>
            <Typography variant="body2" color="grey.300" sx={{ mb: 2 }}>
              Digital transport management system for university campuses. 
              Streamline your campus transport with real-time tracking, 
              smart notifications, and comprehensive management tools.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  F
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  T
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  L
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="#"
                color="grey.300"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Dashboard
              </Link>
              <Link
                href="#"
                color="grey.300"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Bus Tracking
              </Link>
              <Link
                href="#"
                color="grey.300"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Routes
              </Link>
              <Link
                href="#"
                color="grey.300"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Notifications
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="#"
                color="grey.300"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Help Center
              </Link>
              <Link
                href="#"
                color="grey.300"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Contact Us
              </Link>
              <Link
                href="#"
                color="grey.300"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                color="grey.300"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Terms of Service
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Contact Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2" color="grey.300">
                  support@mycampusride.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2" color="grey.300">
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2" color="grey.300">
                  123 University Ave, Campus City, CC 12345
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'grey.700' }} />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="grey.400">
            © {new Date().getFullYear()} MyCampusRide. All rights reserved.
          </Typography>
          <Typography variant="body2" color="grey.400">
            Built with ❤️ for better campus transport management
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;




