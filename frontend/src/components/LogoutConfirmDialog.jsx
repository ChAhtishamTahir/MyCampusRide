import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

const LogoutConfirmDialog = ({ open, onClose, onConfirm, loading = false }) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LogoutIcon color="error" />
        Confirm Logout
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Are you sure you want to log out?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              <Typography>Logging out...</Typography>
            </Box>
          ) : (
            'Log Out'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutConfirmDialog;
