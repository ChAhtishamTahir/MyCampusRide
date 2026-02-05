import React from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Alert
} from '@mui/material';
import { Assessment } from '@mui/icons-material';

const ReportsView = () => {
  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Reports & Analytics</Typography>
            <Alert severity="info">
              Reports feature coming soon. This will include detailed analytics and insights about the transport system.
            </Alert>
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
};

export default ReportsView;