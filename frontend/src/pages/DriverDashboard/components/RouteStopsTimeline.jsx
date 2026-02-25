/**
 * RouteStopsTimeline Component
 *
 * Visual MUI Stepper showing all route stops in sequence.
 * Each step shows: stop name, pickup time, fee, address.
 */

import React from 'react';
import {
    Box, Typography, Stepper, Step, StepLabel, StepContent, Chip
} from '@mui/material';
import { AccessTime, AttachMoney, LocationOn } from '@mui/icons-material';
import {
    BRAND_COLORS,
    BORDER_RADIUS,
    TYPOGRAPHY,
} from '../../../styles/brandStyles';

const RouteStopsTimeline = ({ stops = [], routeName = '' }) => {
    if (!stops || stops.length === 0) {
        return (
            <Box textAlign="center" py={3}>
                <Typography variant="body2" sx={{ color: BRAND_COLORS.slate500 }}>
                    No stops available for this route.
                </Typography>
            </Box>
        );
    }

    // Sort stops by sequence
    const sortedStops = [...stops].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

    return (
        <Box>
            {routeName && (
                <Typography variant="subtitle2" sx={{
                    fontWeight: TYPOGRAPHY.weights.bold,
                    color: BRAND_COLORS.slate900,
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem',
                }}>
                    Route Stops
                </Typography>
            )}

            <Stepper
                orientation="vertical"
                activeStep={-1}
                sx={{
                    '& .MuiStepConnector-line': {
                        borderColor: BRAND_COLORS.slate300,
                        borderLeftStyle: 'dashed',
                        minHeight: 24,
                    },
                    '& .MuiStepIcon-root': {
                        color: BRAND_COLORS.slate400,
                        '&.Mui-active, &.Mui-completed': {
                            color: BRAND_COLORS.skyBlue,
                        },
                    },
                }}
            >
                {sortedStops.map((stop, index) => (
                    <Step key={index} active expanded>
                        <StepLabel
                            StepIconProps={{
                                sx: {
                                    color: index === 0
                                        ? BRAND_COLORS.successGreen
                                        : index === sortedStops.length - 1
                                            ? BRAND_COLORS.errorRed
                                            : BRAND_COLORS.skyBlue,
                                    fontSize: 28,
                                },
                            }}
                            sx={{
                                '& .MuiStepLabel-label': {
                                    fontWeight: TYPOGRAPHY.weights.bold,
                                    color: BRAND_COLORS.slate900,
                                    fontSize: '0.95rem',
                                },
                            }}
                        >
                            {stop.name}
                            {index === 0 && (
                                <Chip label="Start" size="small" sx={{
                                    ml: 1, height: 20, fontSize: '0.65rem',
                                    bgcolor: `${BRAND_COLORS.successGreen}18`,
                                    color: BRAND_COLORS.successGreen,
                                    fontWeight: TYPOGRAPHY.weights.bold,
                                }} />
                            )}
                            {index === sortedStops.length - 1 && sortedStops.length > 1 && (
                                <Chip label="End" size="small" sx={{
                                    ml: 1, height: 20, fontSize: '0.65rem',
                                    bgcolor: `${BRAND_COLORS.errorRed}18`,
                                    color: BRAND_COLORS.errorRed,
                                    fontWeight: TYPOGRAPHY.weights.bold,
                                }} />
                            )}
                        </StepLabel>
                        <StepContent>
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1.5,
                                pb: 1,
                            }}>
                                {stop.pickupTime && (
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <AccessTime sx={{ fontSize: 14, color: BRAND_COLORS.skyBlue }} />
                                        <Typography variant="caption" sx={{
                                            color: BRAND_COLORS.slate700,
                                            fontWeight: TYPOGRAPHY.weights.semibold,
                                        }}>
                                            {stop.pickupTime}
                                        </Typography>
                                    </Box>
                                )}
                                {stop.fee !== undefined && (
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <AttachMoney sx={{ fontSize: 14, color: BRAND_COLORS.successGreen }} />
                                        <Typography variant="caption" sx={{
                                            color: BRAND_COLORS.slate700,
                                            fontWeight: TYPOGRAPHY.weights.semibold,
                                        }}>
                                            Rs. {stop.fee}
                                        </Typography>
                                    </Box>
                                )}
                                {stop.address && (
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <LocationOn sx={{ fontSize: 14, color: BRAND_COLORS.slate400 }} />
                                        <Typography variant="caption" sx={{ color: BRAND_COLORS.slate500 }}>
                                            {stop.address}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};

export default RouteStopsTimeline;
