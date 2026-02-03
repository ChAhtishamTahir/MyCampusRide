import React, { useState, useEffect } from 'react';
import {
  Container, Card, CardContent, Typography, Box, List, ListItem,
  ListItemText, Divider, Alert
} from '@mui/material';
import {
  Schedule as ScheduleIcon, AccessTime, Directions, LocationOn
} from '@mui/icons-material';
import { authService, routeService } from '../../../services';

const StudentScheduleView = () => {
  const [user, setUser] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user data
      const userResponse = await authService.getMe();
      const currentUser = userResponse.data.data;
      setUser(currentUser);

      // Load assigned route data
      if (currentUser?.assignedBus && currentUser.assignedBus.routeId) {
        let routeData = currentUser.assignedBus.routeId;
        
        // If routeId is an object, use it directly; otherwise fetch it
        if (typeof routeData === 'object' && routeData._id) {
          setAssignedRoute(routeData);
        } else {
          const routeResponse = await routeService.getRoute(routeData);
          setAssignedRoute(routeResponse.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading schedule...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ p: 4 }}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Bus Schedule</Typography>
              <Typography variant="body2" color="text.secondary">
                Your daily bus schedule and pickup times
              </Typography>
            </Box>
          </Box>

          {!assignedRoute ? (
            <Alert severity="info">
              You don't have a route assigned yet. Please contact the admin to assign a route based on your fee status.
            </Alert>
          ) : (
            <>
              <Box mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {assignedRoute.routeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {assignedRoute.description}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AccessTime color="action" />
                <Typography variant="body2">
                  <strong>Departure Time:</strong> {assignedRoute.departureTime || 'Not set'}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Directions color="action" />
                <Typography variant="body2">
                  <strong>Distance:</strong> {assignedRoute.distance || 0} km
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Pickup Stops
              </Typography>

              {assignedRoute.stops && assignedRoute.stops.length > 0 ? (
                <List>
                  {assignedRoute.stops.map((stop, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <Box display="flex" alignItems="center" mr={2}>
                          <Box 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: '50%', 
                              bgcolor: 'primary.main', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          >
                            {index + 1}
                          </Box>
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {stop.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LocationOn fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {stop.address || 'Address not specified'}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                <AccessTime fontSize="small" color="action" />
                                <Typography variant="body2">
                                  Pickup: {stop.pickupTime || 'Time not set'}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                                Fee: PKR {stop.fee || 0}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < assignedRoute.stops.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No stops defined for this route yet.</Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentScheduleView;