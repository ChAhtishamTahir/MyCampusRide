/**
 * LocationCard - Tracking sub-component
 * Displays current latitude, longitude, and address.
 */

import React from 'react';
import {
    Card, CardContent, Typography, Box, List, ListItem,
    ListItemAvatar, ListItemText, Avatar, Divider
} from '@mui/material';
import { LocationOn, Map } from '@mui/icons-material';
import {
    BRAND_COLORS, CARD_STYLES, BORDER_RADIUS, SHADOWS, TYPOGRAPHY
} from '../../../../styles/brandStyles';

const LocationCard = ({ locationData }) => {
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
                    Current Location
                </Typography>
                <List disablePadding>
                    <ListItem disableGutters>
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'rgba(14, 165, 233, 0.1)', color: BRAND_COLORS.skyBlue }}>
                                <LocationOn />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={`Lat: ${locationData?.latitude?.toFixed(6) || 'N/A'}`}
                            secondary="Latitude"
                            primaryTypographyProps={{ fontWeight: TYPOGRAPHY.weights.semibold, color: BRAND_COLORS.slate900 }}
                            secondaryTypographyProps={{ color: BRAND_COLORS.slate500 }}
                        />
                    </ListItem>
                    <Divider sx={{ borderColor: BRAND_COLORS.slate200 }} />
                    <ListItem disableGutters>
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'rgba(14, 165, 233, 0.1)', color: BRAND_COLORS.skyBlue }}>
                                <LocationOn />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={`Lng: ${locationData?.longitude?.toFixed(6) || 'N/A'}`}
                            secondary="Longitude"
                            primaryTypographyProps={{ fontWeight: TYPOGRAPHY.weights.semibold, color: BRAND_COLORS.slate900 }}
                            secondaryTypographyProps={{ color: BRAND_COLORS.slate500 }}
                        />
                    </ListItem>
                    <Divider sx={{ borderColor: BRAND_COLORS.slate200 }} />
                    <ListItem disableGutters>
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'rgba(20, 184, 166, 0.1)', color: BRAND_COLORS.teal }}>
                                <Map />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={locationData?.address || 'Address not available'}
                            secondary="Full Address"
                            primaryTypographyProps={{ fontWeight: TYPOGRAPHY.weights.semibold, color: BRAND_COLORS.slate900 }}
                            secondaryTypographyProps={{ color: BRAND_COLORS.slate500 }}
                        />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );
};

export default LocationCard;
