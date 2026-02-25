/**
 * DriverNotificationsView Component
 *
 * Unified notifications page for drivers.
 * Top section: Send alerts to students on the driver's bus (presets + custom).
 * Bottom section: View received notifications using NotificationPanel.
 *
 * Uses targetType: 'bus' to scope alerts to only the driver's bus students.
 */

import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Card, CardContent, Typography, Box, Button,
    TextField, Chip, CircularProgress, Alert, Divider
} from '@mui/material';
import {
    Warning, Schedule, AltRoute, ErrorOutline, Send,
    Notifications, Campaign
} from '@mui/icons-material';
import { notificationService, busService } from '../../../services';
import NotificationPanel from '../../../components/NotificationPanel';
import { toast } from 'react-toastify';
import {
    BRAND_COLORS,
    CARD_STYLES,
    BORDER_RADIUS,
    SHADOWS,
    TYPOGRAPHY,
    INPUT_STYLES,
    gradientIconBox,
} from '../../../styles/brandStyles';

const alertPresets = [
    {
        id: 'delayed',
        label: 'Bus Delayed',
        icon: <Schedule sx={{ fontSize: 18 }} />,
        message: 'The bus is running behind schedule. Please wait at your stop, we will arrive shortly.',
        color: BRAND_COLORS.warningOrange,
    },
    {
        id: 'route_changed',
        label: 'Route Changed',
        icon: <AltRoute sx={{ fontSize: 18 }} />,
        message: 'The route has been temporarily changed due to road conditions. Please check for updates.',
        color: BRAND_COLORS.skyBlue,
    },
    {
        id: 'emergency',
        label: 'Emergency',
        icon: <ErrorOutline sx={{ fontSize: 18 }} />,
        message: 'Important: There is an emergency situation. The bus service may be affected. Stay safe and await further instructions.',
        color: BRAND_COLORS.errorRed,
    },
    {
        id: 'custom',
        label: 'Custom Message',
        icon: <Send sx={{ fontSize: 18 }} />,
        message: '',
        color: BRAND_COLORS.slate600,
    },
];

const DriverNotificationsView = () => {
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customMessage, setCustomMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [busInfo, setBusInfo] = useState(null);
    const [loadingBus, setLoadingBus] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        loadBusInfo();
    }, []);

    const loadBusInfo = async () => {
        try {
            setLoadingBus(true);
            const busResponse = await busService.getDriverBuses();
            const buses = busResponse.data?.data || busResponse.data || [];
            if (buses && buses.length > 0) {
                setBusInfo(buses[0]);
            }
        } catch (err) {
            console.error('Error loading bus info:', err);
        } finally {
            setLoadingBus(false);
        }
    };

    const handlePresetClick = (preset) => {
        setSelectedPreset(preset);
        if (preset.id !== 'custom') {
            setCustomMessage(preset.message);
        } else {
            setCustomMessage('');
        }
    };

    const handleSend = async () => {
        if (!customMessage.trim()) {
            toast.error('Please enter a message.');
            return;
        }

        if (!busInfo?._id) {
            toast.error('No bus assigned. Cannot send alerts.');
            return;
        }

        setSending(true);
        try {
            await notificationService.sendNotification({
                title: selectedPreset?.id === 'custom'
                    ? '🚌 Driver Alert'
                    : `🚌 ${selectedPreset?.label || 'Bus Alert'}`,
                message: customMessage,
                type: selectedPreset?.id === 'emergency' ? 'emergency' : 'warning',
                targetType: 'bus',
                busId: busInfo._id,
                priority: selectedPreset?.id === 'emergency' ? 'high' : 'medium',
            });
            toast.success(`Alert sent to students on Bus ${busInfo.busNumber}!`);
            setSelectedPreset(null);
            setCustomMessage('');
            // Refresh notifications list
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error('Failed to send alert:', err);
            const errorMsg = err.response?.data?.message || 'Failed to send alert. Please try again.';
            toast.error(errorMsg);
        } finally {
            setSending(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Grid container spacing={3}>

                {/* Send Alert Section */}
                <Grid item xs={12}>
                    <Card sx={{
                        ...CARD_STYLES.standard,
                        border: `1px solid ${BRAND_COLORS.slate300}`,
                        overflow: 'visible',
                    }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2} mb={3}>
                                <Box sx={gradientIconBox(
                                    `linear-gradient(135deg, ${BRAND_COLORS.warningOrange} 0%, ${BRAND_COLORS.errorRed} 100%)`,
                                    '0 4px 16px rgba(245, 158, 11, 0.3)'
                                )}>
                                    <Campaign sx={{ color: BRAND_COLORS.white }} />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="h6" sx={{ fontWeight: TYPOGRAPHY.weights.bold, color: BRAND_COLORS.slate900 }}>
                                        Send Alert to Students
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
                                        {busInfo
                                            ? `Alert will be sent only to students on Bus ${busInfo.busNumber}`
                                            : 'Loading bus info...'
                                        }
                                    </Typography>
                                </Box>
                            </Box>

                            {loadingBus ? (
                                <Box display="flex" justifyContent="center" py={3}>
                                    <CircularProgress size={32} sx={{ color: BRAND_COLORS.skyBlue }} />
                                </Box>
                            ) : !busInfo ? (
                                <Alert severity="warning" sx={{ borderRadius: BORDER_RADIUS.md }}>
                                    No bus assigned to you. Contact admin to get a bus assigned.
                                </Alert>
                            ) : (
                                <>
                                    {/* Alert Type Selection */}
                                    <Typography variant="subtitle2" sx={{
                                        fontWeight: TYPOGRAPHY.weights.semibold,
                                        color: BRAND_COLORS.slate700,
                                        mb: 1.5,
                                    }}>
                                        Select alert type:
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                                        {alertPresets.map((preset) => (
                                            <Chip
                                                key={preset.id}
                                                icon={preset.icon}
                                                label={preset.label}
                                                onClick={() => handlePresetClick(preset)}
                                                sx={{
                                                    borderRadius: BORDER_RADIUS.sm,
                                                    fontWeight: TYPOGRAPHY.weights.semibold,
                                                    fontSize: '0.85rem',
                                                    py: 2.5,
                                                    px: 0.5,
                                                    transition: 'all 0.2s ease',
                                                    ...(selectedPreset?.id === preset.id
                                                        ? {
                                                            bgcolor: `${preset.color}18`,
                                                            color: preset.color,
                                                            border: `2px solid ${preset.color}`,
                                                            '& .MuiChip-icon': { color: preset.color },
                                                        }
                                                        : {
                                                            bgcolor: BRAND_COLORS.slate100,
                                                            color: BRAND_COLORS.slate700,
                                                            border: `2px solid transparent`,
                                                            '& .MuiChip-icon': { color: BRAND_COLORS.slate500 },
                                                            '&:hover': {
                                                                bgcolor: `${preset.color}08`,
                                                                borderColor: `${preset.color}40`,
                                                            },
                                                        }),
                                                }}
                                            />
                                        ))}
                                    </Box>

                                    {/* Message Input */}
                                    {selectedPreset && (
                                        <Box>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={3}
                                                label="Alert Message"
                                                value={customMessage}
                                                onChange={(e) => setCustomMessage(e.target.value)}
                                                placeholder="Type your alert message..."
                                                sx={INPUT_STYLES.standard}
                                            />
                                            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                                                <Button
                                                    onClick={() => { setSelectedPreset(null); setCustomMessage(''); }}
                                                    sx={{
                                                        color: BRAND_COLORS.slate600,
                                                        fontWeight: TYPOGRAPHY.weights.semibold,
                                                        textTransform: 'none',
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleSend}
                                                    disabled={!customMessage.trim() || sending}
                                                    startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <Send />}
                                                    sx={{
                                                        background: `linear-gradient(135deg, ${BRAND_COLORS.warningOrange} 0%, ${BRAND_COLORS.errorRed} 100%)`,
                                                        color: BRAND_COLORS.white,
                                                        fontWeight: TYPOGRAPHY.weights.bold,
                                                        textTransform: 'none',
                                                        borderRadius: BORDER_RADIUS.md,
                                                        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
                                                        '&:hover': {
                                                            boxShadow: '0 12px 32px rgba(245, 158, 11, 0.45)',
                                                            transform: 'translateY(-2px)',
                                                        },
                                                        transition: 'all 0.3s ease',
                                                        '&:disabled': {
                                                            background: BRAND_COLORS.slate400,
                                                            color: BRAND_COLORS.white,
                                                        },
                                                    }}
                                                >
                                                    {sending ? 'Sending...' : 'Send Alert'}
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Received Notifications Section */}
                <Grid item xs={12}>
                    <Card sx={{
                        ...CARD_STYLES.standard,
                        border: `1px solid ${BRAND_COLORS.slate300}`,
                    }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Box sx={gradientIconBox(
                                    BRAND_COLORS.primaryGradient,
                                    '0 4px 16px rgba(14, 165, 233, 0.3)'
                                )}>
                                    <Notifications sx={{ color: BRAND_COLORS.white }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: TYPOGRAPHY.weights.bold, color: BRAND_COLORS.slate900 }}>
                                        Your Notifications
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
                                        Alerts and updates you have received
                                    </Typography>
                                </Box>
                            </Box>
                            <NotificationPanel key={refreshKey} maxHeight="calc(100vh - 550px)" />
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>
        </Container>
    );
};

export default DriverNotificationsView;
