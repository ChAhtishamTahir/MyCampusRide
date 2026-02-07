/**
 * StudentScheduleView Component
 *
 * Displays the student's bus schedule with:
 * - Route information and departure time
 * - Pickup stops with timings
 * - Stop addresses and fees
 * - Route distance and duration
 *
 * Features brand styling with gradient accents.
 */

import React, { useState, useEffect } from 'react';
import {
  Container, Card, CardContent, Typography, Box, List, ListItem,
  ListItemText, Divider, Alert, CircularProgress
} from '@mui/material';
import {
  Schedule as ScheduleIcon, AccessTime, Directions, LocationOn
} from '@mui/icons-material';
import { authService, routeService } from '../../../services';
import {
  BRAND_COLORS,
  CARD_STYLES,
  BORDER_RADIUS,
  SHADOWS,
} from '../styles/brandStyles';

const StudentScheduleView = () => {
  const [user, setUser] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load schedule data on component mount
  useEffect(() => {
    loadScheduleData();
  }, []);

  /**
   * Load student's schedule data including route and stops
   * Handles both populated and non-populated route data
   */
  const loadScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user data with assigned bus/route
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

  // Show loading spinner with brand color
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} sx={{ color: BRAND_COLORS.skyBlue }} />
      </Container>
    );
  }

  // Show error message if data loading fails
  if (error) {
    return (
      <Container maxWidth="md" sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: BORDER_RADIUS.md }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ p: 4 }}>
      {/* Schedule Card with brand styling */}
      <Card sx={{
        ...CARD_STYLES.standard,
        border: `1px solid ${BRAND_COLORS.slate300}`,
      }}>
        <CardContent>
          {/* Header with gradient icon */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: BORDER_RADIUS.xl,
              background: BRAND_COLORS.primaryGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(14, 165, 233, 0.3)',
            }}>
              <ScheduleIcon sx={{ fontSize: 32, color: BRAND_COLORS.white }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900 }}>
                Bus Schedule
              </Typography>
              <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
                Your daily bus schedule and pickup times
              </Typography>
            </Box>
          </Box>

          {!assignedRoute ? (
            <Alert
              severity="info"
              sx={{
                borderRadius: BORDER_RADIUS.md,
                bgcolor: 'rgba(14, 165, 233, 0.08)',
                border: `1px solid ${BRAND_COLORS.skyBlue}`,
                color: BRAND_COLORS.slate700,
              }}
            >
              You don't have a route assigned yet. Please contact the admin to assign a route based on your fee status.
            </Alert>
          ) : (
            <>
              {/* Route Information */}
              <Box mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900, mb: 1 }}>
                  {assignedRoute.routeName}
                </Typography>
                <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
                  {assignedRoute.description}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AccessTime sx={{ color: BRAND_COLORS.skyBlue }} />
                <Typography variant="body2" sx={{ color: BRAND_COLORS.slate700 }}>
                  <strong>Departure Time:</strong> {assignedRoute.departureTime || 'Not set'}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Directions sx={{ color: BRAND_COLORS.teal }} />
                <Typography variant="body2" sx={{ color: BRAND_COLORS.slate700 }}>
                  <strong>Distance:</strong> {assignedRoute.distance || 0} km
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900, mb: 2 }}>
                Pickup Stops
              </Typography>

              {assignedRoute.stops && assignedRoute.stops.length > 0 ? (
                <List>
                  {assignedRoute.stops.map((stop, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <Box display="flex" alignItems="center" mr={2}>
                          {/* Numbered circle with gradient */}
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: BRAND_COLORS.primaryGradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: BRAND_COLORS.white,
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)',
                            }}
                          >
                            {index + 1}
                          </Box>
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900 }}>
                              {stop.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                <LocationOn fontSize="small" sx={{ color: BRAND_COLORS.slate600 }} />
                                <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
                                  {stop.address || 'Address not specified'}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                <AccessTime fontSize="small" sx={{ color: BRAND_COLORS.skyBlue }} />
                                <Typography variant="body2" sx={{ color: BRAND_COLORS.slate700 }}>
                                  Pickup: {stop.pickupTime || 'Time not set'}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: BRAND_COLORS.skyBlue, fontWeight: 600, mt: 0.5 }}>
                                Fee: PKR {stop.fee || 0}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < assignedRoute.stops.length - 1 && (
                        <Divider sx={{ borderColor: BRAND_COLORS.slate300 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: BORDER_RADIUS.md,
                    bgcolor: 'rgba(14, 165, 233, 0.08)',
                    border: `1px solid ${BRAND_COLORS.skyBlue}`,
                    color: BRAND_COLORS.slate700,
                  }}
                >
                  No stops defined for this route yet.
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentScheduleView;