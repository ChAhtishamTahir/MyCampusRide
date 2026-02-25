import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, Grid, Chip, Divider, List, ListItem,
    ListItemAvatar, ListItemText, Avatar, IconButton, CircularProgress
} from '@mui/material';
import {
    DirectionsBus, Person, Route as RouteIcon, EventSeat,
    Close, Phone, Email
} from '@mui/icons-material';
import { userService } from '../../../services';

const BusProfileDialog = ({ open, onClose, bus }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && bus) {
            loadStudents();
        }
    }, [open, bus]);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const res = await userService.getUsers({ assignedBus: bus._id, limit: 100 });
            setStudents((res.data && res.data.data) || []);
        } catch (error) {
            console.error('Error loading students for bus:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!bus) return null;

    const occupied = students.length;
    const available = bus.capacity; // bus.capacity is usually remaining capacity? Or total?
    // In database, capacity is stored as remaining capacity (see userController logic: increments/decrements capacity).
    // Let's verify Bus model.
    // Bus.js: capacity: { type: Number, required: true }
    // userController.js: 
    //   if (oldBusId) await Bus.findByIdAndUpdate(oldBusId, { $inc: { capacity: 1 } });
    //   if (newBusId) await Bus.findByIdAndUpdate(newBusId, { $inc: { capacity: -1 } });
    // So `capacity` in DB is AVAILABLE SEATS.

    // But `createBus` sets `capacity`. Is it total or available?
    // It seems to be treated as AVAILABLE.
    // But then how do we know TOTAL capacity?
    // We don't store total capacity in the model explicitly if we decrement it.
    // This is a flaw in the current model if we want to show "Occupancy %".
    // We can infer Total = Available + Occupied (if we assume all assignments are tracked).
    // Yes, `occupied` is `students.length`.
    const currentAvailable = bus.capacity;
    const totalCapacity = currentAvailable + occupied;
    const occupancyPct = totalCapacity > 0 ? Math.round((occupied / totalCapacity) * 100) : 0;

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'success';
            case 'on_trip': return 'info';
            case 'maintenance': return 'warning';
            case 'out_of_service': return 'error';
            case 'inactive': return 'default';
            default: return 'default';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <DirectionsBus />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            Bus {bus.busNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {bus.model} • {bus.year}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* Status Chip */}
                <Box mb={3}>
                    <Chip
                        label={bus.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(bus.status)}
                        sx={{ fontWeight: 600 }}
                    />
                </Box>

                <Grid container spacing={3}>
                    {/* Route Details */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            ASSIGNED ROUTE
                        </Typography>
                        {bus.routeId ? (
                            <Box sx={{ p: 2, bgcolor: 'rgba(14, 165, 233, 0.05)', borderRadius: 2, border: '1px solid rgba(14, 165, 233, 0.1)' }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <RouteIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {typeof bus.routeId === 'object' ? bus.routeId.routeName : 'Unknown Route'}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Stops: {typeof bus.routeId === 'object' ? bus.routeId.stops?.length : 0} •
                                    Distance: {typeof bus.routeId === 'object' ? bus.routeId.distance : 'N/A'} km
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No route assigned
                            </Typography>
                        )}
                    </Grid>

                    {/* Driver Details */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            DRIVER
                        </Typography>
                        {bus.driverId ? (
                            <Box sx={{ p: 2, bgcolor: 'rgba(34, 197, 94, 0.05)', borderRadius: 2, border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main', fontSize: '0.875rem' }}>
                                        {typeof bus.driverId === 'object' ? bus.driverId.name?.charAt(0) : 'D'}
                                    </Avatar>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {typeof bus.driverId === 'object' ? bus.driverId.name : 'Unknown Driver'}
                                    </Typography>
                                </Box>
                                <Box display="flex" flexDirection="column" gap={0.5}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {typeof bus.driverId === 'object' ? bus.driverId.email : 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {typeof bus.driverId === 'object' ? bus.driverId.phone : 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No driver assigned
                            </Typography>
                        )}
                    </Grid>

                    {/* Capacity */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            CAPACITY & OCCUPANCY
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" fontWeight={600}>Occupancy</Typography>
                                <Typography variant="body2" fontWeight={600}>{occupancyPct}%</Typography>
                            </Box>
                            <Box sx={{ width: '100%', height: 8, bgcolor: '#e2e8f0', borderRadius: 4, mb: 2, overflow: 'hidden' }}>
                                <Box sx={{
                                    width: `${occupancyPct}%`,
                                    height: '100%',
                                    bgcolor: occupancyPct > 90 ? 'error.main' : occupancyPct > 60 ? 'warning.main' : 'success.main',
                                    transition: 'width 0.5s ease'
                                }} />
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Box textAlign="center">
                                    <Typography variant="h6" fontWeight={700}>{totalCapacity}</Typography>
                                    <Typography variant="caption" color="text.secondary">Total Seats</Typography>
                                </Box>
                                <Box textAlign="center">
                                    <Typography variant="h6" fontWeight={700} color="primary.main">{occupied}</Typography>
                                    <Typography variant="caption" color="text.secondary">Occupied</Typography>
                                </Box>
                                <Box textAlign="center">
                                    <Typography variant="h6" fontWeight={700} color="success.main">{currentAvailable}</Typography>
                                    <Typography variant="caption" color="text.secondary">Available</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Student List */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            PASSENGER LIST ({occupied})
                        </Typography>
                        <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                            {loading ? (
                                <Box display="flex" justifyContent="center" p={2}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : students.length > 0 ? (
                                <List dense>
                                    {students.map((student, index) => (
                                        <React.Fragment key={student._id}>
                                            <ListItem>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                                                        {student.name?.charAt(0)}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={student.name}
                                                    secondary={student.studentId}
                                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                                />
                                                <Chip
                                                    label={student.stopName || 'No Stop'}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                                />
                                            </ListItem>
                                            {index < students.length - 1 && <Divider variant="inset" component="li" />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Box p={2} textAlign="center">
                                    <Typography variant="body2" color="text.secondary">
                                        No passengers assigned
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BusProfileDialog;
