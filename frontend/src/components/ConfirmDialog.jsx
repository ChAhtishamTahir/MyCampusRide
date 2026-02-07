import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import { Warning, Delete, Info, Error as ErrorIcon } from '@mui/icons-material';

const ConfirmDialog = ({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
}) => {
  const theme = useTheme();

  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Delete sx={{ fontSize: 40, color: 'error.main' }} />,
          confirmColor: 'error',
        };
      case 'warning':
        return {
          icon: <Warning sx={{ fontSize: 40, color: 'warning.main' }} />,
          confirmColor: 'warning',
        };
      case 'info':
        return {
          icon: <Info sx={{ fontSize: 40, color: 'info.main' }} />,
          confirmColor: 'primary',
        };
      default:
        return {
          icon: <ErrorIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
          confirmColor: 'primary',
        };
    }
  };

  const config = getVariantConfig();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
        <Box sx={{ mb: 2 }}>{config.icon}</Box>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ textAlign: 'center', px: 2 }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={config.confirmColor}
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
