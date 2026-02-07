import React from 'react';
import {
  Card, CardContent, Typography, Box, Avatar, Chip, Divider
} from '@mui/material';
import { 
  DirectionsBus, Person, School, Receipt, 
  CalendarToday, Badge as BadgeIcon 
} from '@mui/icons-material';

const VirtualTransportCard = ({ user, assignedBus, assignedRoute }) => {
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
    <Card sx={{
      maxWidth: 420,
      width: '100%',
      mx: 'auto',
      boxShadow: 3,
      borderRadius: 3,
      bgcolor: 'background.paper'
    }}>
      <Box sx={{
        height: 64,
        bgcolor: 'primary.main',
        borderTopLeftRadius: 'inherit',
        borderTopRightRadius: 'inherit',
        display: 'flex',
        alignItems: 'center',
        px: 3
      }}>
        <School sx={{ color: 'white', mr: 1 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          MyCampusRide
        </Typography>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
            <Person sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {user?.name || 'Student Name'}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <BadgeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {user?.studentId || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            <strong>Bus Information:</strong>
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <DirectionsBus fontSize="small" color="primary" />
            <Typography variant="body2">
              {assignedBus ? assignedBus.busNumber : 'Not Assigned'}
            </Typography>
          </Box>
          <Typography variant="body2">
            Model: {assignedBus ? assignedBus.model : 'N/A'} ({assignedBus ? assignedBus.year : 'N/A'})
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            <strong>Route Information:</strong>
          </Typography>
          <Typography variant="body2">
            {assignedRoute ? assignedRoute.routeName : 'Not Assigned'}
          </Typography>
          {assignedRoute && assignedRoute.routeNo && (
            <Typography variant="body2">
              Route #: {assignedRoute.routeNo}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            <strong>Fee Status:</strong>
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Receipt fontSize="small" color="action" />
            <Chip 
              label={feeStatus === 'paid' ? 'Paid' : feeStatus === 'partially_paid' ? 'Partially Paid' : 'Pending'} 
              size="small"
              color={
                feeStatus === 'paid' ? 'success' :
                feeStatus === 'partially_paid' ? 'warning' : 'default'
              }
            />
          </Box>
          <Typography variant="body2" mt={1}>
            Monthly Fee: PKR {feeInfo.monthlyFee}
          </Typography>
          <Typography variant="body2">
            Paid: PKR {feeInfo.paidAmount}
          </Typography>
          <Typography variant="body2" color={feeInfo.dueAmount > 0 ? 'error' : 'success'}>
            Due: PKR {feeInfo.dueAmount}
          </Typography>
        </Box>
        
        <Box textAlign="center" mt={3}>
          <CalendarToday fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            Valid: {user ? new Date().toLocaleDateString() : 'N/A'} - {feeInfo.nextDueDate}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VirtualTransportCard;