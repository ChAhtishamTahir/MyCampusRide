/**
 * VirtualTransportCard Component
 *
 * Digital transport card displaying:
 * - Student identification with photo placeholder
 * - Assigned bus and route information
 * - Fee status and payment details
 * - Card validity period
 *
 * Features brand gradient styling with modern card design.
 */

import React from 'react';
import {
  Card, CardContent, Typography, Box, Avatar, Chip, Divider
} from '@mui/material';
import {
  DirectionsBus, Person, School, Receipt,
  CalendarToday, Badge as BadgeIcon
} from '@mui/icons-material';
import {
  BRAND_COLORS,
  BORDER_RADIUS,
  SHADOWS,
} from '../styles/brandStyles';

const VirtualTransportCard = ({ user, assignedBus, assignedRoute }) => {
  /**
   * Calculate monthly fee based on student's assigned stop
   * Returns fee from specific stop or first stop as fallback
   */
  const getMonthlyFee = () => {
    if (assignedRoute?.stops && user?.stopName) {
      const stop = assignedRoute.stops.find(s => s.name === user.stopName);
      if (stop) return stop.fee;
    }
    if (assignedRoute?.stops?.length > 0) {
      return assignedRoute.stops[0].fee;
    }
    return 0;
  };

  // Calculate fee details based on status
  const monthlyFee = getMonthlyFee();
  const feeStatus = user?.feeStatus || 'pending';
  let paidAmount = 0;
  let dueAmount = monthlyFee;

  if (feeStatus === 'paid') {
    paidAmount = monthlyFee;
    dueAmount = 0;
  } else if (feeStatus === 'partially_paid') {
    paidAmount = monthlyFee * 0.5;
    dueAmount = monthlyFee * 0.5;
  }

  const feeInfo = {
    monthlyFee,
    paidAmount,
    dueAmount,
    nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  return (
    // Virtual Transport Card with brand gradient
    <Card sx={{
      maxWidth: 420,
      width: '100%',
      mx: 'auto',
      boxShadow: SHADOWS.lg,
      borderRadius: BORDER_RADIUS['2xl'],
      border: `2px solid ${BRAND_COLORS.slate300}`,
      overflow: 'hidden',
    }}>
      {/* Header with brand gradient */}
      <Box sx={{
        height: 64,
        background: BRAND_COLORS.primaryGradient,
        display: 'flex',
        alignItems: 'center',
        px: 3,
        boxShadow: '0 4px 16px rgba(14, 165, 233, 0.3)',
      }}>
        <School sx={{ color: BRAND_COLORS.white, mr: 1.5, fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: BRAND_COLORS.white, fontWeight: 700, letterSpacing: '-0.5px' }}>
          CampusRide
        </Typography>
      </Box>

      {/* Card Content with brand styling */}
      <CardContent sx={{ p: 3 }}>
        {/* Student Profile Section */}
        <Box display="flex" alignItems="center" gap={2} mb={2.5}>
          {/* Avatar with gradient border */}
          <Box sx={{
            p: 0.4,
            borderRadius: '50%',
            background: BRAND_COLORS.primaryGradient,
            display: 'flex',
          }}>
            <Avatar sx={{
              width: 56,
              height: 56,
              bgcolor: BRAND_COLORS.white,
              color: BRAND_COLORS.skyBlue,
            }}>
              <Person sx={{ fontSize: 28, fontWeight: 700 }} />
            </Avatar>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: BRAND_COLORS.slate900, lineHeight: 1.3 }}>
              {user?.name || 'Student Name'}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <BadgeIcon fontSize="small" sx={{ color: BRAND_COLORS.slate600 }} />
              <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
                {user?.studentId || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: BRAND_COLORS.slate300 }} />

        {/* Bus Information */}
        <Box mb={2}>
          <Typography variant="body2" sx={{ color: BRAND_COLORS.slate700, fontWeight: 700, mb: 0.5 }}>
            Bus Information:
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <DirectionsBus fontSize="small" sx={{ color: BRAND_COLORS.skyBlue }} />
            <Typography variant="body2" sx={{ color: BRAND_COLORS.slate900, fontWeight: 600 }}>
              {assignedBus ? assignedBus.busNumber : 'Not Assigned'}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
            Model: {assignedBus ? assignedBus.model : 'N/A'} ({assignedBus ? assignedBus.year : 'N/A'})
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: BRAND_COLORS.slate300 }} />

        {/* Route Information */}
        <Box mb={2}>
          <Typography variant="body2" sx={{ color: BRAND_COLORS.slate700, fontWeight: 700, mb: 0.5 }}>
            Route Information:
          </Typography>
          <Typography variant="body2" sx={{ color: BRAND_COLORS.slate900, fontWeight: 600 }}>
            {assignedRoute ? assignedRoute.routeName : 'Not Assigned'}
          </Typography>
          {assignedRoute && assignedRoute.routeNo && (
            <Typography variant="body2" sx={{ color: BRAND_COLORS.slate600 }}>
              Route #: {assignedRoute.routeNo}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2, borderColor: BRAND_COLORS.slate300 }} />

        {/* Fee Status */}
        <Box mb={2}>
          <Typography variant="body2" sx={{ color: BRAND_COLORS.slate700, fontWeight: 700, mb: 0.5 }}>
            Fee Status:
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Receipt fontSize="small" sx={{ color: BRAND_COLORS.teal }} />
            <Chip
              label={feeStatus === 'paid' ? 'Paid' : feeStatus === 'partially_paid' ? 'Partially Paid' : 'Pending'}
              size="small"
              sx={{
                bgcolor: feeStatus === 'paid' ? BRAND_COLORS.successGreen :
                         feeStatus === 'partially_paid' ? BRAND_COLORS.warningOrange :
                         BRAND_COLORS.slate400,
                color: BRAND_COLORS.white,
                fontWeight: 600,
                borderRadius: BORDER_RADIUS.sm,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: BRAND_COLORS.slate700 }}>
            Monthly Fee: <strong>PKR {feeInfo.monthlyFee}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: BRAND_COLORS.successGreen, fontWeight: 600 }}>
            Paid: PKR {feeInfo.paidAmount}
          </Typography>
          <Typography variant="body2" sx={{
            color: feeInfo.dueAmount > 0 ? BRAND_COLORS.errorRed : BRAND_COLORS.successGreen,
            fontWeight: 600
          }}>
            Due: PKR {feeInfo.dueAmount}
          </Typography>
        </Box>

        {/* Card Validity Period */}
        <Box textAlign="center" mt={3} p={1.5} sx={{ bgcolor: BRAND_COLORS.slate100, borderRadius: BORDER_RADIUS.md }}>
          <CalendarToday fontSize="small" sx={{ color: BRAND_COLORS.slate600 }} />
          <Typography variant="caption" sx={{ color: BRAND_COLORS.slate700, display: 'block', mt: 0.5 }}>
            Valid: {user ? new Date().toLocaleDateString() : 'N/A'} - {feeInfo.nextDueDate}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VirtualTransportCard;