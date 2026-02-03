import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert
} from '@mui/material';
import { DirectionsBus, AccessTime, LocalShipping } from '@mui/icons-material';
import { busService, routeService, trackingService } from '../../../services';

const DriverTripsView = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get driver's assigned trips
      const response = await busService.getDriverBuses();
      const driverBuses = response.data?.data || response.data || [];
      
      // For each bus, get trip details
      const tripDetails = [];
      for (const bus of driverBuses) {
        // Get route information for each bus
        if (bus.routeId) {
          try {
            const routeResponse = await routeService.getRoute(typeof bus.routeId === 'object' ? bus.routeId._id : bus.routeId);
            tripDetails.push({
              ...bus,
              route: routeResponse.data,
              startTime: bus.startTime || 'N/A',
              endTime: bus.endTime || 'N/A'
            });
          } catch (err) {
            tripDetails.push({
              ...bus,
              route: null,
              startTime: bus.startTime || 'N/A',
              endTime: bus.endTime || 'N/A'
            });
          }
        } else {
          tripDetails.push({
            ...bus,
            route: null,
            startTime: bus.startTime || 'N/A',
            endTime: bus.endTime || 'N/A'
          });
        }
      }

      setTrips(tripDetails);
    } catch (err) {
      console.error('Error loading trips:', err);
      setError('Failed to load trip information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="primary" size="small" />;
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'delayed':
        return <Chip label="Delayed" color="warning" size="small" />;
      case 'cancelled':
        return <Chip label="Cancelled" color="error" size="small" />;
      default:
        return <Chip label="Scheduled" color="default" size="small" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                My Trips
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bus Number</TableCell>
                      <TableCell>Route</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Capacity</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trips.map((trip, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <DirectionsBus sx={{ mr: 1, fontSize: 16 }} />
                          {trip.busNumber || trip.number}
                        </TableCell>
                        <TableCell>
                          {trip.route ? `${trip.route.startLocation} → ${trip.route.endLocation}` : 'No Route Assigned'}
                        </TableCell>
                        <TableCell>
                          <AccessTime sx={{ mr: 0.5, fontSize: 14 }} />
                          {trip.startTime}
                        </TableCell>
                        <TableCell>
                          <AccessTime sx={{ mr: 0.5, fontSize: 14 }} />
                          {trip.endTime}
                        </TableCell>
                        <TableCell>
                          {getStatusChip(trip.status || 'scheduled')}
                        </TableCell>
                        <TableCell>
                          {trip.capacity || 0}/{trip.maxCapacity || 0}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => {
                              // Handle trip details action
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {trips.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">No trips assigned yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DriverTripsView;