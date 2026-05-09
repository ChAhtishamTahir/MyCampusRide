import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Zoom,
  IconButton,
} from '@mui/material';
import { Warning, Delete, Info, Error as ErrorIcon, Close } from '@mui/icons-material';
import { BRAND_COLORS, BORDER_RADIUS, SHADOWS, BUTTON_STYLES } from '../styles/brandStyles';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

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
  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Delete sx={{ fontSize: 44 }} />,
          gradient: `linear-gradient(135deg, ${BRAND_COLORS.errorRed} 0%, #B91C1C 100%)`,
          shadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
          confirmStyle: { ...BUTTON_STYLES.primary, bgcolor: BRAND_COLORS.errorRed, '&:hover': { bgcolor: '#B91C1C' } },
        };
      case 'warning':
        return {
          icon: <Warning sx={{ fontSize: 44 }} />,
          gradient: `linear-gradient(135deg, ${BRAND_COLORS.warningOrange} 0%, #C2410C 100%)`,
          shadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
          confirmStyle: { ...BUTTON_STYLES.primary, bgcolor: BRAND_COLORS.warningOrange, '&:hover': { bgcolor: '#C2410C' } },
        };
      case 'info':
        return {
          icon: <Info sx={{ fontSize: 44 }} />,
          gradient: BRAND_COLORS.primaryGradient,
          shadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
          confirmStyle: BUTTON_STYLES.primary,
        };
      default:
        return {
          icon: <ErrorIcon sx={{ fontSize: 44 }} />,
          gradient: BRAND_COLORS.primaryGradient,
          shadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
          confirmStyle: BUTTON_STYLES.primary,
        };
    }
  };

  const config = getVariantConfig();

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: BORDER_RADIUS.xl,
          overflow: 'hidden',
          boxShadow: SHADOWS.xl,
        },
      }}
    >
      <Box sx={{ position: 'relative', pt: 5, pb: 2, textAlign: 'center' }}>
        {!loading && (
          <IconButton
            onClick={onCancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: BRAND_COLORS.slate400,
            }}
          >
            <Close />
          </IconButton>
        )}

        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: config.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 24px',
            boxShadow: config.shadow,
            transform: 'scale(1)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          {config.icon}
        </Box>

        <DialogTitle sx={{ p: 0, mb: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: BRAND_COLORS.slate900 }}>
            {title}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pb: 0 }}>
          <DialogContentText sx={{ textAlign: 'center', color: BRAND_COLORS.slate600, fontSize: '1.05rem', lineHeight: 1.6 }}>
            {message}
          </DialogContentText>
        </DialogContent>
      </Box>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 5, px: 4 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          disabled={loading}
          sx={{
            borderRadius: BORDER_RADIUS.md,
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            py: 1.2,
            color: BRAND_COLORS.slate600,
            borderColor: BRAND_COLORS.slate300,
            '&:hover': {
              borderColor: BRAND_COLORS.slate400,
              bgcolor: BRAND_COLORS.slate50,
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            ...config.confirmStyle,
            borderRadius: BORDER_RADIUS.md,
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            py: 1.2,
            minWidth: 140,
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
