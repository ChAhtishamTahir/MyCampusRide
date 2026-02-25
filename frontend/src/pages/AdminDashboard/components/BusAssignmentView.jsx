import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Card, CardContent, Typography, Box, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Avatar,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Select, MenuItem, FormControl, InputLabel, Snackbar, Alert as MuiAlert,
    Collapse, List, ListItem, ListItemAvatar, ListItemText, Divider, Paper
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import {
    AirportShuttle, Edit, People, DirectionsBus, ExpandMore, ExpandLess,
    CheckCircle, Cancel, PersonOff, LocationOn, Lock
} from '@mui/icons-material';
import { userService, busService, routeService } from '../../../services';

const BusAssignmentView = () => {
    const [users, setUsers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBus, setSelectedBus] = useState('');
    const [expandedBus, setExpandedBus] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, routesRes, busesRes] = await Promise.all([
                userService.getUsers({ limit: 100 }),
                routeService.getRoutes({ limit: 100 }),
                busService.getBuses({ limit: 100 })
            ]);
            setUsers((usersRes.data && usersRes.data.data) || []);
            setRoutes((routesRes.data && routesRes.data.data) || []);
            setBuses((busesRes.data && busesRes.data.data) || []);
        } catch (error) {
            console.error('Error loading data:', error);
            showSnack('Error loading data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnack = (message, severity = 'success') => {
        setSnack({ open: true, message, severity });
    };

    // ── Helpers ──────────────────────────────────────────────────────────
    const allStudents = users.filter(u => u.role === 'student');

    const getRouteName = (student) => {
        if (!student.assignedRoute) return null;
        if (typeof student.assignedRoute === 'object') return student.assignedRoute.routeName;
        const route = routes.find(r => r._id === student.assignedRoute);
        return route ? route.routeName : 'Unknown';
    };

    const getRouteId = (student) => {
        if (!student.assignedRoute) return null;
        return typeof student.assignedRoute === 'object' ? student.assignedRoute._id : student.assignedRoute;
    };

    const getBusNumber = (student) => {
        if (!student.assignedBus) return null;
        if (typeof student.assignedBus === 'object') return student.assignedBus.busNumber;
        const bus = buses.find(b => b._id === student.assignedBus);
        return bus ? bus.busNumber : 'Unknown';
    };

    const getBusId = (student) => {
        if (!student.assignedBus) return null;
        return typeof student.assignedBus === 'object' ? student.assignedBus._id : student.assignedBus;
    };

    const getBusesForRoute = (routeId) => {
        if (!routeId) return [];
        return buses.filter(bus => {
            const busRouteId = typeof bus.routeId === 'object' ? bus.routeId._id : bus.routeId;
            return busRouteId === routeId;
        });
    };

    // Count students assigned to a specific bus
    const getStudentsOnBus = (busId) => {
        return allStudents.filter(s => {
            const sBusId = getBusId(s);
            return sBusId === busId;
        });
    };

    // Get the bus route name
    const getBusRouteName = (bus) => {
        if (!bus.routeId) return 'N/A';
        if (typeof bus.routeId === 'object') return bus.routeId.routeName;
        const route = routes.find(r => r._id === bus.routeId);
        return route ? route.routeName : 'Unknown';
    };

    // ── Stats ────────────────────────────────────────────────────────────
    const studentsWithBus = allStudents.filter(s => s.assignedBus);
    const studentsWithRoute = allStudents.filter(s => s.assignedRoute);
    const studentsWithoutBus = allStudents.filter(s => !s.assignedBus);

    // ── Dialog ───────────────────────────────────────────────────────────
    const openAssignDialog = (student) => {
        setSelectedStudent(student);
        const currentBusId = student.assignedBus
            ? (typeof student.assignedBus === 'object' ? student.assignedBus._id : student.assignedBus)
            : '';
        setSelectedBus(currentBusId);
        setOpenDialog(true);
    };

    const closeAssignDialog = () => {
        setOpenDialog(false);
        setSelectedStudent(null);
        setSelectedBus('');
    };

    const handleAssign = async () => {
        try {
            await userService.updateUser(selectedStudent._id, {
                assignedBus: selectedBus || null
            });
            showSnack(selectedBus ? 'Bus assigned successfully' : 'Bus unassigned successfully');
            closeAssignDialog();
            loadData();
        } catch (error) {
            console.error('Error assigning bus:', error);
            const msg = error.response?.data?.message || 'Failed to assign bus';
            showSnack(msg, 'error');
        }
    };

    // ── Filtering ────────────────────────────────────────────────────────
    const filteredStudents = allStudents
        .filter(u => !searchQuery || u.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
            || u.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Container maxWidth="xl" sx={{ p: 3 }}>
            {/* ── Summary Stat Cards ──────────────────────────────────────── */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <People sx={{ color: '#fff', fontSize: 32 }} />
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>{allStudents.length}</Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Total Students</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <CheckCircle sx={{ color: '#fff', fontSize: 32 }} />
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>{studentsWithBus.length}</Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Bus Assigned</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <PersonOff sx={{ color: '#fff', fontSize: 32 }} />
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>{studentsWithoutBus.length}</Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Awaiting Assignment</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ── Bus Fleet Overview ──────────────────────────────────────── */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Bus Fleet Capacity</Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Bus</TableCell>
                                    <TableCell>Route</TableCell>
                                    <TableCell align="center">Occupied</TableCell>
                                    <TableCell align="center">Available</TableCell>
                                    <TableCell align="center">Occupancy</TableCell>
                                    <TableCell align="right">Passengers</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {buses.map(bus => {
                                    const studentsOnBus = getStudentsOnBus(bus._id);
                                    const occupied = studentsOnBus.length;
                                    const available = bus.capacity;
                                    const total = occupied + available;
                                    const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
                                    const isExpanded = expandedBus === bus._id;

                                    return (
                                        <React.Fragment key={bus._id}>
                                            <TableRow>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <DirectionsBus fontSize="small" color="primary" />
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{bus.busNumber}</Typography>
                                                        <Typography variant="caption" color="text.secondary">({bus.model})</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={getBusRouteName(bus)} size="small" variant="outlined" color="info" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{occupied}</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: available > 0 ? '#22c55e' : '#ef4444' }}>
                                                        {available}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{
                                                            flex: 1, height: 8, bgcolor: '#e2e8f0', borderRadius: 4,
                                                            overflow: 'hidden', minWidth: 60
                                                        }}>
                                                            <Box sx={{
                                                                height: '100%', borderRadius: 4,
                                                                width: `${pct}%`,
                                                                bgcolor: pct > 80 ? '#ef4444' : pct > 50 ? '#f97316' : '#22c55e',
                                                                transition: 'width 0.5s ease'
                                                            }} />
                                                        </Box>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 35 }}>{pct}%</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title={isExpanded ? 'Hide passengers' : 'Show passengers'}>
                                                        <IconButton size="small" onClick={() => setExpandedBus(isExpanded ? null : bus._id)}>
                                                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expandable passenger list */}
                                            {isExpanded && (
                                                <TableRow>
                                                    <TableCell colSpan={6} sx={{ py: 0, px: 2, bgcolor: '#f8fafc' }}>
                                                        <Collapse in={isExpanded}>
                                                            {studentsOnBus.length > 0 ? (
                                                                <List dense disablePadding>
                                                                    {studentsOnBus.map((s, i) => (
                                                                        <React.Fragment key={s._id}>
                                                                            <ListItem sx={{ py: 0.5 }}>
                                                                                <ListItemAvatar sx={{ minWidth: 36 }}>
                                                                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#0ea5e9' }}>
                                                                                        {s.name?.charAt(0)}
                                                                                    </Avatar>
                                                                                </ListItemAvatar>
                                                                                <ListItemText
                                                                                    primary={s.name}
                                                                                    secondary={s.studentId || s.email}
                                                                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                                                                    secondaryTypographyProps={{ variant: 'caption' }}
                                                                                />
                                                                            </ListItem>
                                                                            {i < studentsOnBus.length - 1 && <Divider component="li" />}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </List>
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary" sx={{ py: 1.5 }}>
                                                                    No passengers assigned to this bus
                                                                </Typography>
                                                            )}
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* ── Student Assignment Table ───────────────────────────────── */}
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Box>
                            <Typography variant="h6">Student Bus Assignment</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Assign buses to students based on their selected route
                            </Typography>
                        </Box>
                        <Box
                            component="input"
                            placeholder="Search by name or ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                px: 2, py: 1, borderRadius: 2,
                                border: '1px solid #ddd', outline: 'none',
                                fontSize: '0.875rem', minWidth: 250,
                                '&:focus': { borderColor: '#0ea5e9' }
                            }}
                        />
                    </Box>

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Student ID</TableCell>
                                    <TableCell>Fee Status</TableCell>
                                    <TableCell>Selected Route & Stop</TableCell>
                                    <TableCell>Assigned Bus</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.map(student => {
                                    const hasRoute = !!student.assignedRoute;
                                    const hasBus = !!student.assignedBus;
                                    const feeStatus = student.feeStatus || 'pending';
                                    const isPaid = feeStatus === 'paid' || feeStatus === 'partially_paid';
                                    const canAssign = hasRoute && isPaid;

                                    return (
                                        <TableRow key={student._id} sx={{
                                            opacity: canAssign ? 1 : 0.6,
                                            filter: !isPaid ? 'grayscale(1)' : 'none',
                                            bgcolor: !isPaid ? 'rgba(239, 68, 68, 0.05)' : 'inherit'
                                        }}>
                                            <TableCell sx={{ py: 1 }}>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: hasBus ? '#22c55e' : '#e0e0e0', fontSize: '0.875rem' }}>
                                                        {student.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{student.name}</Typography>
                                                        {!isPaid && (
                                                            <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                                                                Fee Pending
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{student.studentId || 'N/A'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={feeStatus.replace('_', ' ').toUpperCase()}
                                                    size="small"
                                                    color={feeStatus === 'paid' ? 'success' : feeStatus === 'partially_paid' ? 'warning' : 'error'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {hasRoute ? (
                                                    <Box>
                                                        <Chip label={getRouteName(student)} size="small" color="info" variant="outlined" sx={{ mb: 0.5 }} />
                                                        {student.stopName && (
                                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                                <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {student.stopName}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <Chip label="No Route Selected" size="small" color="warning" variant="outlined" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {hasBus ? (
                                                    <Chip label={getBusNumber(student)} size="small" color="success" />
                                                ) : (
                                                    <Chip label="Not Assigned" size="small" color="default" variant="outlined" />
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title={
                                                    !hasRoute ? 'Student must select a route first' :
                                                        !isPaid ? 'Fee payment required to assign bus' :
                                                            'Assign / Change Bus'
                                                }>
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => openAssignDialog(student)}
                                                            disabled={!canAssign}
                                                            sx={{
                                                                bgcolor: canAssign ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                                                                '&:hover': { bgcolor: canAssign ? 'rgba(14, 165, 233, 0.2)' : 'transparent' }
                                                            }}
                                                        >
                                                            {!isPaid ? <Lock fontSize="small" color="disabled" /> : <Edit fontSize="small" />}
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {filteredStudents.length === 0 && (
                        <Box textAlign="center" py={6}>
                            <AirportShuttle sx={{ fontSize: 64, color: 'grey.400' }} />
                            <Typography color="text.secondary">No students found</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* ── Bus Assignment Dialog ──────────────────────────────────── */}
            <Dialog open={openDialog} onClose={closeAssignDialog} maxWidth="xs" fullWidth>
                <DialogTitle>
                    Assign Bus — {selectedStudent?.name}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="grid" gap={2.5} sx={{ mt: 1 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                Selected Route
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {selectedStudent && getRouteName(selectedStudent)}
                            </Typography>
                            {selectedStudent?.stopName && (
                                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Stop: {selectedStudent.stopName}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <FormControl fullWidth>
                            <InputLabel>Assign Bus</InputLabel>
                            <Select
                                value={selectedBus}
                                label="Assign Bus"
                                onChange={(e) => setSelectedBus(e.target.value)}
                            >
                                <MenuItem value="">No Bus (Unassign)</MenuItem>
                                {selectedStudent && getBusesForRoute(getRouteId(selectedStudent)).map(bus => {
                                    const studentsOnBus = getStudentsOnBus(bus._id);
                                    const occupied = studentsOnBus.length;
                                    const available = bus.capacity;
                                    return (
                                        <MenuItem key={bus._id} value={bus._id} disabled={available <= 0 && getBusId(selectedStudent) !== bus._id}>
                                            {bus.busNumber} — {bus.model} ({occupied} / {occupied + available} seats)
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>

                        {selectedStudent && getBusesForRoute(getRouteId(selectedStudent)).length === 0 && (
                            <MuiAlert severity="warning">
                                No buses available on this route. Please add buses to this route first.
                            </MuiAlert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeAssignDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleAssign}>
                        {selectedBus ? 'Assign Bus' : 'Unassign'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Snackbar ───────────────────────────────────────────────── */}
            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <MuiAlert
                    onClose={() => setSnack(prev => ({ ...prev, open: false }))}
                    severity={snack.severity}
                    sx={{ width: '100%' }}
                >
                    {snack.message}
                </MuiAlert>
            </Snackbar>
        </Container>
    );
};

export default BusAssignmentView;
