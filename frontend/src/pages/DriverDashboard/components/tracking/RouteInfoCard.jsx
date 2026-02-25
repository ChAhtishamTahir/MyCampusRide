/**
 * RouteInfoCard - Tracking sub-component
 * Displays route name, departure time, and estimated duration.
 * Receives busInfo with populated routeId.
 */

import React from 'react';
import {
    Card, CardContent, Typography, Box, List, ListItem,
    ListItemAvatar, ListItemText, Avatar, Divider
} from '@mui/material';
import { DirectionsBus, AccessTime, Straighten } from '@mui/icons-material';
import {
    BRAND_COLORS, CARD_STYLES, BORDER_RADIUS, SHADOWS, TYPOGRAPHY
} from '../../../../styles/brandStyles';

const RouteInfoCard = ({ busInfo }) => {
    // Route data comes from populated busInfo.routeId
    const route = typeof busInfo?.routeId === 'object' ? busInfo.routeId : null;

    return (
        <Card sx={{
            ...CARD_STYLES.standard,
            border: `1px solid ${BRAND_COLORS.slate200}`,
            boxShadow: SHADOWS.sm,
        }}>
            <CardContent>
                <Typography variant="subtitle2" sx={{
                    color: BRAND_COLORS.slate500,
                    fontWeight: TYPOGRAPHY.weights.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem',
                    mb: 1.5,
                }}>
                    Route Information
                </Typography>
                <List disablePadding>
                    <ListItem disableGutters>
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: BRAND_COLORS.successGreen }}>
                                <DirectionsBus />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={route?.routeName || 'No route assigned'}
                            secondary="Current Route"
                            primaryTypographyProps={{ fontWeight: TYPOGRAPHY.weights.semibold, color: BRAND_COLORS.slate900 }}
                            secondaryTypographyProps={{ color: BRAND_COLORS.slate500 }}
                        />
                    </ListItem>
                    <Divider sx={{ borderColor: BRAND_COLORS.slate200 }} />
                    <ListItem disableGutters>
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: BRAND_COLORS.warningOrange }}>
                                <AccessTime />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={route?.departureTime || 'N/A'}
                            secondary="Departure Time"
                            primaryTypographyProps={{ fontWeight: TYPOGRAPHY.weights.semibold, color: BRAND_COLORS.slate900 }}
                            secondaryTypographyProps={{ color: BRAND_COLORS.slate500 }}
                        />
                    </ListItem>
                    <Divider sx={{ borderColor: BRAND_COLORS.slate200 }} />
                    <ListItem disableGutters>
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: BRAND_COLORS.errorRed }}>
                                <Straighten />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={route?.distance ? `${route.distance} km` : (route?.estimatedDuration ? `~${route.estimatedDuration} min` : 'N/A')}
                            secondary="Distance / Duration"
                            primaryTypographyProps={{ fontWeight: TYPOGRAPHY.weights.semibold, color: BRAND_COLORS.slate900 }}
                            secondaryTypographyProps={{ color: BRAND_COLORS.slate500 }}
                        />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );
};

export default RouteInfoCard;
