import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  Home,
  ErrorOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <ErrorOutline
            sx={{
              fontSize: 120,
              color: 'error.main',
              mb: 3,
            }}
          />
          
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: '4rem',
              fontWeight: 700,
              color: 'error.main',
              mb: 2,
            }}
          >
            404
          </Typography>
          
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 600,
              mb: 2,
            }}
          >
            Page Not Found
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              fontSize: '1.1rem',
            }}
          >
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
            }}
          >
            Go Home
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFoundPage;




