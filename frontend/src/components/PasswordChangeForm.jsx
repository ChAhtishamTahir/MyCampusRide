import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { authService } from '../services/authService';
import { toast } from '../utils/toast';

const PasswordChangeForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: 'grey' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { score: 66, label: 'Medium', color: '#f59e0b' };
    return { score: 100, label: 'Strong', color: '#22c55e' };
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.newPassword),
    [formData.newPassword]
  );

  const passwordRequirements = useMemo(() => [
    { met: formData.newPassword.length >= 6, text: 'At least 6 characters' },
    { met: formData.newPassword.length >= 8, text: '8+ characters (recommended)' },
    { met: /[A-Z]/.test(formData.newPassword), text: 'One uppercase letter' },
    { met: /[0-9]/.test(formData.newPassword), text: 'One number' },
  ], [formData.newPassword]);

  const fieldErrors = useMemo(() => {
    const errors = {};
    if (touched.currentPassword && !formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (touched.newPassword && !formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (touched.newPassword && formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (touched.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true
    });

    if (!formData.currentPassword) {
      toast.error('Current password is required');
      setLoading(false);
      return;
    }

    if (!formData.newPassword) {
      toast.error('New password is required');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.data?.success) {
        toast.success('Password updated successfully');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTouched({});
      } else {
        toast.error(response.data?.message || 'Failed to change password');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 600,
        mx: 'auto',
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Change Password
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        name="currentPassword"
        label="Current Password"
        type={showPasswords.current ? "text" : "password"}
        value={formData.currentPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.currentPassword && !!fieldErrors.currentPassword}
        helperText={touched.currentPassword && fieldErrors.currentPassword}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle current password visibility"
                onClick={() => togglePasswordVisibility('current')}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <TextField
        fullWidth
        margin="normal"
        name="newPassword"
        label="New Password"
        type={showPasswords.new ? "text" : "password"}
        value={formData.newPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.newPassword && !!fieldErrors.newPassword}
        helperText={touched.newPassword && fieldErrors.newPassword}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle new password visibility"
                onClick={() => togglePasswordVisibility('new')}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {formData.newPassword && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={passwordStrength.score}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                bgcolor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  bgcolor: passwordStrength.color,
                  borderRadius: 4
                }
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: passwordStrength.color, fontWeight: 600, minWidth: 50 }}
            >
              {passwordStrength.label}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {passwordRequirements.map((req, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {req.met ? (
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                ) : (
                  <CancelIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{ color: req.met ? '#22c55e' : '#6b7280' }}
                >
                  {req.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <TextField
        fullWidth
        margin="normal"
        name="confirmPassword"
        label="Confirm New Password"
        type={showPasswords.confirm ? "text" : "password"}
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.confirmPassword && !!fieldErrors.confirmPassword}
        helperText={touched.confirmPassword && fieldErrors.confirmPassword}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={() => togglePasswordVisibility('confirm')}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
          <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />
          <Typography variant="caption" sx={{ color: '#22c55e' }}>
            Passwords match
          </Typography>
        </Box>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
        sx={{ mt: 3, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Change Password'}
      </Button>
    </Box>
  );
};

export default PasswordChangeForm;
