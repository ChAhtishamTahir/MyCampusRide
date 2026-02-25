import React, { useState, useEffect } from 'react';
import {
    Container, Card, CardContent, Typography, Box, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Avatar,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Select, MenuItem, FormControl, InputLabel, Snackbar, Alert as MuiAlert,
    CircularProgress
} from '@mui/material';
import {
    Warning, Edit, LocationOn, Person, AirportShuttle
} from '@mui/icons-material';
import { userService, busService, routeService } from '../../../services';

const DisplacedStudentsView = () => {
    const [students, setStudents] = useState([]);
    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBus, setSelectedBus] = useState('');
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
    const [reassigning, setReassigning] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch displaced students
            const usersRes = await userService.getUsers({ isDisplaced: true, limit: 100 });
            // Fetch routes and buses for context and assignment
            const [routesRes, busesRes] = await Promise.all([
                routeService.getRoutes({ limit: 100 }),
                busService.getBuses({ limit: 100 })
            ]);

            setStudents((usersRes.data && usersRes.data.data) || []);
            setRoutes((routesRes.data && routesRes.data.data) || []);
            setBuses((busesRes.data && busesRes.data.data) || []);
        } catch (error) {
            console.error('Error loading data:', error);
            showSnack('Error loading displaced students', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnack = (message, severity = 'success') => {
        setSnack({ open: true, message, severity });
    };

    // Helpers
    const getRouteName = (student) => {
        if (!student.assignedRoute) return 'No Route';
        if (typeof student.assignedRoute === 'object') return student.assignedRoute.routeName;
        const route = routes.find(r => r._id === student.assignedRoute);
        return route ? route.routeName : 'Unknown';
    };

    const getRouteId = (student) => {
        if (!student.assignedRoute) return null;
        return typeof student.assignedRoute === 'object' ? student.assignedRoute._id : student.assignedRoute;
    };

    // Filter buses by route
    const getBusesForRoute = (routeId) => {
        if (!routeId) return [];
        return buses.filter(bus => {
            const busRouteId = typeof bus.routeId === 'object' ? bus.routeId._id : bus.routeId;
            // Only show active buses
            return busRouteId === routeId && bus.status === 'available';
        });
    };

    // Dialog Handlers
    const openAssignDialog = (student) => {
        setSelectedStudent(student);
        setSelectedBus(''); // Reset selection
        setOpenDialog(true);
    };

    const closeAssignDialog = () => {
        setOpenDialog(false);
        setSelectedStudent(null);
        setSelectedBus('');
    };

    const handleAssign = async () => {
        if (!selectedBus) return;

        try {
            setReassigning(true);
            await userService.updateUser(selectedStudent._id, {
                assignedBus: selectedBus
            });
            showSnack('Bus assigned successfully. Student removed from displaced list.');
            closeAssignDialog();
            loadData(); // Reload to remove the student from list
        } catch (error) {
            console.error('Error assigning bus:', error);
            const msg = error.response?.data?.message || 'Failed to assign bus';
            showSnack(msg, 'error');
        } finally {
            setReassigning(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="warning" /> Displaced Students
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Students whose bus was deleted or set to inactive. Reassign them to active buses here.
                </Typography>
            </Box>

            <Card>
                <CardContent sx={{ p: 0 }}>
                    {students.length === 0 ? (
                        <Box textAlign="center" py={8}>
                            <AirportShuttle sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No displaced students found</Typography>
                            <Typography variant="body2" color="text.disabled">All students have active bus assignments</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                    <TableRow>
                                        <TableCell>Student</TableCell>
                                        <TableCell>Student ID</TableCell>
                                        <TableCell>Route</TableCell>
                                        <TableCell>Previous Stop</TableCell>
                                        <TableCell>Fee Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((student) => {
                                        const routeId = getRouteId(student);
                                        const availableBuses = getBusesForRoute(routeId);
                                        const hasAvailableBuses = availableBuses.length > 0;

                                        return (
                                            <TableRow key={student._id} hover>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0e0e0', fontSize: '0.875rem' }}>
                                                            {student.name?.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{student.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{student.studentId || 'N/A'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={getRouteName(student)}
                                                        size="small"
                                                        color={student.assignedRoute ? "info" : "default"}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {student.stopName ? (
                                                        <Box display="flex" alignItems="center" gap={0.5}>
                                                            <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                            <Typography variant="body2">{student.stopName}</Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">N/A</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={(student.feeStatus || 'pending').replace('_', ' ').toUpperCase()}
                                                        size="small"
                                                        color={student.feeStatus === 'paid' ? 'success' : 'warning'}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<Edit />}
                                                        onClick={() => openAssignDialog(student)}
                                                        disabled={!hasAvailableBuses}
                                                        color={hasAvailableBuses ? "primary" : "inherit"}
                                                    >
                                                        Reassign
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Reassign Dialog */}
            <Dialog open={openDialog} onClose={closeAssignDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Reassign {selectedStudent?.name}</DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Route</Typography>
                            <Typography variant="body1" fontWeight={600}>
                                {selectedStudent && getRouteName(selectedStudent)}
                            </Typography>
                        </Box>

                        <FormControl fullWidth>
                            <InputLabel>Select New Bus</InputLabel>
                            <Select
                                value={selectedBus}
                                label="Select New Bus"
                                onChange={(e) => setSelectedBus(e.target.value)}
                            >
                                {selectedStudent && getBusesForRoute(getRouteId(selectedStudent)).map(bus => (
                                    <MenuItem
                                        key={bus._id}
                                        value={bus._id}
                                        disabled={bus.capacity <= 0}
                                    >
                                        <Box display="flex" justifyContent="space-between" width="100%">
                                            <Typography variant="body2">{bus.busNumber}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {bus.capacity} seats left
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {selectedStudent && getBusesForRoute(getRouteId(selectedStudent)).length === 0 && (
                            <MuiAlert severity="warning">No active buses available for this route.</MuiAlert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeAssignDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAssign}
                        disabled={!selectedBus || reassigning}
                    >
                        {reassigning ? 'Assigning...' : 'Confirm Assignment'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <MuiAlert severity={snack.severity} onClose={() => setSnack(prev => ({ ...prev, open: false }))}>
                    {snack.message}
                </MuiAlert>
            </Snackbar>
        </Container>
    );
};

export default DisplacedStudentsView;
