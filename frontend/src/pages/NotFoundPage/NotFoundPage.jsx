import React from 'react';
import {
  Box, Container, Typography, Button
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'background.default'
    }}>
      <Container maxWidth="sm">
        <Box textAlign="center" py={8}>
          <Box sx={{ 
            width: 120, 
            height: 120, 
            borderRadius: '50%', 
            bgcolor: 'error.light', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mx: 'auto',
            mb: 4
          }}>
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main' }} />
          </Box>
          
          <Typography variant="h1" sx={{ fontSize: 96, fontWeight: 700, color: 'text.secondary', mb: 2 }}>
            404
          </Typography>
          
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: '500px', mx: 'auto' }}>
            Sorry, we couldn't find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
          >
            Go Back Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFoundPage;