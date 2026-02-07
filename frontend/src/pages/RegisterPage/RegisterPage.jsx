import React, { useState, useMemo } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Link, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem,
  LinearProgress, InputAdornment, IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student',
    studentId: '',
    licenseNumber: '',
    adminSecretCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) return 'Please enter a valid phone number';
    return '';
  };

  const validateStudentId = (id) => {
    const pattern = /^(FA|SP)[0-9]{2}-(BCS|BBA|BSE)-[0-9]{3}$/;
    return pattern.test(id);
  };

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

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const passwordRequirements = useMemo(() => [
    { met: formData.password.length >= 6, text: 'At least 6 characters' },
    { met: formData.password.length >= 8, text: '8+ characters (recommended)' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(formData.password), text: 'One number' },
  ], [formData.password]);

  const fieldErrors = useMemo(() => {
    const errors = {};
    if (touched.name && !formData.name) errors.name = 'Name is required';
    if (touched.email) errors.email = validateEmail(formData.email);
    if (touched.phone) errors.phone = validatePhone(formData.phone);
    if (touched.password && !formData.password) errors.password = 'Password is required';
    else if (touched.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (touched.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (formData.role === 'student' && touched.studentId) {
      if (!formData.studentId) errors.studentId = 'Student ID is required';
      else if (!validateStudentId(formData.studentId)) {
        errors.studentId = 'Format: FA/SP + 2 digits - BCS/BBA/BSE - 3 digits';
      }
    }
    if (formData.role === 'driver' && touched.licenseNumber && !formData.licenseNumber) {
      errors.licenseNumber = 'License number is required';
    }
    if (formData.role === 'admin' && touched.adminSecretCode && !formData.adminSecretCode) {
      errors.adminSecretCode = 'Admin secret code is required';
    }
    return errors;
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true,
      studentId: formData.role === 'student',
      licenseNumber: formData.role === 'driver',
      adminSecretCode: formData.role === 'admin'
    });

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.role === 'student') {
      if (!formData.studentId) {
        setError('Student ID is required');
        toast.error('Student ID is required');
        setLoading(false);
        return;
      }
      if (!validateStudentId(formData.studentId)) {
        setError('Student ID must follow the format: FA/SP + 2 digits - BCS/BBA/BSE - 3 digits');
        toast.error('Invalid Student ID format');
        setLoading(false);
        return;
      }
    }

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      };

      if (formData.role === 'driver') {
        if (!formData.licenseNumber) {
          setError('License number is required for drivers');
          toast.error('License number is required');
          setLoading(false);
          return;
        }
        registrationData.licenseNumber = formData.licenseNumber;
      } else if (formData.role === 'student') {
        registrationData.studentId = formData.studentId;
      } else if (formData.role === 'admin') {
        if (!formData.adminSecretCode) {
          setError('Admin secret code is required');
          toast.error('Admin secret code is required');
          setLoading(false);
          return;
        }
        registrationData.adminSecretCode = formData.adminSecretCode;
      }

      const result = await register(registrationData);

      if (result.success) {
        if (result.user.role === 'driver' && result.user.status === 'pending') {
          toast.success('Registration successful! Your account is pending approval.', { autoClose: 5000 });
          navigate('/login', { replace: true });
        } else {
          toast.success('Registration successful! Welcome to MyCampusRide.');
          if (result.user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (result.user.role === 'student') {
            navigate('/student', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      } else {
        const errorMsg = result.error || 'Registration failed. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      let errorMsg;
      if (!err.response) {
        errorMsg = 'Unable to connect to server. Please check your internet connection.';
      } else {
        errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      }
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      py: 4
    }}>
      <Container component="main" maxWidth="xs">
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}>
              <Box sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <PersonAddIcon sx={{ fontSize: 30, color: 'white' }} />
              </Box>
              <Typography component="h1" variant="h5">
                Create an account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && !!fieldErrors.name}
                helperText={touched.name && fieldErrors.name}
              />
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && !!fieldErrors.email}
                helperText={touched.email && fieldErrors.email}
              />
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && !!fieldErrors.password}
                helperText={touched.password && fieldErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {formData.password && (
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
                margin="normal"
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: -1, mb: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                  <Typography variant="caption" sx={{ color: '#22c55e' }}>
                    Passwords match
                  </Typography>
                </Box>
              )}

              <TextField
                margin="normal"
                fullWidth
                id="phone"
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phone && !!fieldErrors.phone}
                helperText={touched.phone && fieldErrors.phone}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role-select"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleChange}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="driver">Driver</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>

              {formData.role === 'student' && (
                <TextField
                  margin="normal"
                  fullWidth
                  id="studentId"
                  label="Student ID"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., FA23-BCS-123"
                  error={touched.studentId && !!fieldErrors.studentId}
                  helperText={touched.studentId && fieldErrors.studentId ? fieldErrors.studentId : 'Format: FA/SP + 2 digits - BCS/BBA/BSE - 3 digits'}
                />
              )}

              {formData.role === 'driver' && (
                <TextField
                  margin="normal"
                  fullWidth
                  id="licenseNumber"
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.licenseNumber && !!fieldErrors.licenseNumber}
                  helperText={touched.licenseNumber && fieldErrors.licenseNumber}
                />
              )}

              {formData.role === 'admin' && (
                <TextField
                  margin="normal"
                  fullWidth
                  id="adminSecretCode"
                  label="Admin Secret Code"
                  name="adminSecretCode"
                  type="password"
                  value={formData.adminSecretCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.adminSecretCode && !!fieldErrors.adminSecretCode}
                  helperText={touched.adminSecretCode && fieldErrors.adminSecretCode ? fieldErrors.adminSecretCode : 'Enter the admin secret code to register'}
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link href="/login" variant="body2">
                  {"Already have an account? Sign in"}
                </Link>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage;
