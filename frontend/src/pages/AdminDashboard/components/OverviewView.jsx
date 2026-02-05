import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Avatar
} from '@mui/material';
import {
  People, DirectionsBus, Route as RouteIcon, Notifications
} from '@mui/icons-material';
import { userService, busService, routeService } from '../../../services';

const OverviewView = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, pending: 0 },
    buses: { total: 0, active: 0, onTrip: 0 },
    routes: { total: 0, active: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [
        userStatsResponse,
        busStatsResponse,
        routeStatsResponse
      ] = await Promise.all([
        userService.getUserStats(),
        busService.getBusStats(),
        routeService.getRouteStats()
      ]);

      setStats({
        users: (userStatsResponse.data && userStatsResponse.data.data) || { total: 0, active: 0, pending: 0 },
        buses: (busStatsResponse.data && busStatsResponse.data.data) || { total: 0, active: 0, onTrip: 0 },
        routes: (routeStatsResponse.data && routeStatsResponse.data.data) || { total: 0, active: 0 },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      subtitle: `${stats.users.active} active`,
      icon: <People />,
      gradient: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
      color: 'white'
    },
    {
      title: 'Total Buses',
      value: stats.buses.total,
      subtitle: `${stats.buses.active} active`,
      icon: <DirectionsBus />,
      gradient: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
      color: 'white'
    },
    {
      title: 'Total Routes',
      value: stats.routes.total,
      subtitle: `${stats.routes.active} active`,
      icon: <RouteIcon />,
      gradient: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
      color: 'white'
    },
    {
      title: 'Pending Drivers',
      value: stats.users.pending,
      subtitle: 'Awaiting approval',
      icon: <Notifications />,
      gradient: 'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
      color: 'white'
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              background: card.gradient, 
              color: card.color,
              height: '100%',
              minHeight: 120
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2">{card.title}</Typography>
                    <Typography variant="h4">{card.value}</Typography>
                    <Typography variant="body2">{card.subtitle}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default OverviewView;