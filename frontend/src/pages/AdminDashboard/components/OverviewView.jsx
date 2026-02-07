/**
 * OverviewView Component
 *
 * Main dashboard overview showing key statistics with brand-styled cards.
 * Features:
 * - Stat cards with brand gradients
 * - Real-time data loading from APIs
 * - Animated number displays
 * - Hover effects with brand colors
 * - Responsive grid layout
 *
 * This is the first view admins see when accessing the portal,
 * providing a quick snapshot of the system status.
 */

import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, CircularProgress, Skeleton
} from '@mui/material';
import {
  People, DirectionsBus, Route as RouteIcon, HourglassEmpty
} from '@mui/icons-material';
import { userService, busService, routeService } from '../../../services';
import {
  BRAND_COLORS,
  BACKGROUND_GRADIENTS,
  CARD_STYLES,
  BORDER_RADIUS,
  SHADOWS
} from '../styles/brandStyles';

const OverviewView = () => {
  // State for statistics data
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, pending: 0 },
    buses: { total: 0, active: 0, onTrip: 0 },
    routes: { total: 0, active: 0 }
  });
  const [loading, setLoading] = useState(true);

  /**
   * Load statistics from backend APIs on component mount
   * Fetches user, bus, and route stats in parallel for performance
   */
  useEffect(() => {
    loadStats();
  }, []);

  /**
   * Fetch statistics from all service endpoints
   * Uses Promise.all for parallel execution
   */
  const loadStats = async () => {
    try {
      setLoading(true);

      // Parallel API calls for better performance
      const [
        userStatsResponse,
        busStatsResponse,
        routeStatsResponse
      ] = await Promise.all([
        userService.getUserStats(),
        busService.getBusStats(),
        routeService.getRouteStats()
      ]);

      // Update state with response data, providing default values
      setStats({
        users: (userStatsResponse.data && userStatsResponse.data.data) || { total: 0, active: 0, pending: 0 },
        buses: (busStatsResponse.data && busStatsResponse.data.data) || { total: 0, active: 0, onTrip: 0 },
        routes: (routeStatsResponse.data && routeStatsResponse.data.data) || { total: 0, active: 0 },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Keep default values (0) on error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Stat card configuration with brand gradients
   * Each card has a specific gradient and icon matching the brand
   */
  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      subtitle: `${stats.users.active} active`,
      icon: <People sx={{ fontSize: 40 }} />,
      // Primary brand gradient (Blue to Teal)
      gradient: BRAND_COLORS.primaryGradient,
      color: BRAND_COLORS.white
    },
    {
      title: 'Total Buses',
      value: stats.buses.total,
      subtitle: `${stats.buses.active} active`,
      icon: <DirectionsBus sx={{ fontSize: 40 }} />,
      // Teal variant gradient
      gradient: 'linear-gradient(135deg, #14B8A6 0%, #10B981 100%)',
      color: BRAND_COLORS.white
    },
    {
      title: 'Total Routes',
      value: stats.routes.total,
      subtitle: `${stats.routes.active} active`,
      icon: <RouteIcon sx={{ fontSize: 40 }} />,
      // Sky blue variant gradient
      gradient: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
      color: BRAND_COLORS.white
    },
    {
      title: 'Pending Drivers',
      value: stats.users.pending,
      subtitle: 'Awaiting approval',
      icon: <HourglassEmpty sx={{ fontSize: 40 }} />,
      // Admin orange gradient (for urgent items)
      gradient: BACKGROUND_GRADIENTS.adminGradient,
      color: BRAND_COLORS.white
    }
  ];

  /**
   * Loading skeleton - shows while data is being fetched
   * Provides better UX than blank screen
   */
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card sx={{
                height: 160,
                borderRadius: BORDER_RADIUS.lg,
              }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={30} />
                  <Skeleton variant="text" width="40%" height={50} sx={{ my: 1 }} />
                  <Skeleton variant="text" width="50%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: BRAND_COLORS.slate900,
            mb: 1,
          }}
        >
          Dashboard Overview
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: BRAND_COLORS.slate600,
          }}
        >
          Monitor your campus transportation system at a glance
        </Typography>
      </Box>

      {/* Statistics Cards Grid */}
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{
              background: card.gradient,
              color: card.color,
              height: '100%',
              minHeight: 160,
              borderRadius: BORDER_RADIUS.lg,
              boxShadow: SHADOWS.buttonDefault,
              transition: 'all 0.3s ease',
              // Entrance animation with stagger delay
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`,
              // Hover effect - lift and enhance shadow
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: SHADOWS.buttonHover,
              },
              // Add smooth keyframe animation
              '@keyframes fadeInUp': {
                from: {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  height="100%"
                >
                  {/* Card Header with Icon */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      {/* Title */}
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.9,
                          fontWeight: 600,
                          mb: 1,
                        }}
                      >
                        {card.title}
                      </Typography>
                      {/* Main Value - Large Number */}
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          letterSpacing: '-1px',
                          mb: 0.5,
                        }}
                      >
                        {card.value}
                      </Typography>
                      {/* Subtitle */}
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.9,
                          fontWeight: 500,
                        }}
                      >
                        {card.subtitle}
                      </Typography>
                    </Box>

                    {/* Icon with semi-transparent background */}
                    <Box sx={{
                      width: 64,
                      height: 64,
                      borderRadius: BORDER_RADIUS.lg,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)',
                    }}>
                      {card.icon}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions Section (Optional - can be added later) */}
      {/* <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          // Add quick action buttons here
        </Grid>
      </Box> */}
    </Container>
  );
};

export default OverviewView;
