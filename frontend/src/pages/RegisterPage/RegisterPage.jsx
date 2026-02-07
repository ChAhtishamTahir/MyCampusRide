import React, { useState, useMemo } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Link, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem,
  LinearProgress, InputAdornment, IconButton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack,
} from '@mui/icons-material';
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)',
        py: 4,
      }}
    >
      {/* Decorative gradient circles - matching landing page aesthetic */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
        }}
      />

      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Back to home button */}
        <Box sx={{ mb: 2 }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              color: '#0EA5E9',
              '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.08)' },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        {/* Brand logo/name */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            CampusRide
          </Typography>
        </Box>

        {/* Main card with enhanced styling */}
        <Card
          sx={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInUp 0.6s ease-out',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            {/* Icon with gradient background - matching landing page style */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
                }}
              >
                <PersonAddIcon sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Typography
                component="h1"
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#0F172A',
                  mb: 0.5,
                }}
              >
                Create Your Account
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748B',
                  textAlign: 'center',
                }}
              >
                Join CampusRide for seamless campus transportation
              </Typography>
            </Box>

            {/* Error alert with brand styling */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: '12px',
                }}
              >
                {error}
              </Alert>
            )}

            {/* Form with enhanced input styling */}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': {
                      borderColor: '#0EA5E9',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0EA5E9',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0EA5E9',
                  },
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': {
                      borderColor: '#0EA5E9',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0EA5E9',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0EA5E9',
                  },
                }}
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
                        sx={{ color: '#64748B' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': {
                      borderColor: '#0EA5E9',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0EA5E9',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0EA5E9',
                  },
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
                        bgcolor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: passwordStrength.color,
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: passwordStrength.color, fontWeight: 600, minWidth: 60 }}
                    >
                      {passwordStrength.label}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {passwordRequirements.map((req, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {req.met ? (
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                        ) : (
                          <CancelIcon sx={{ fontSize: 16, color: '#CBD5E1' }} />
                        )}
                        <Typography
                          variant="caption"
                          sx={{ color: req.met ? '#10B981' : '#64748B' }}
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
                        sx={{ color: '#64748B' }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': {
                      borderColor: '#0EA5E9',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0EA5E9',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0EA5E9',
                  },
                }}
              />

              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: -1, mb: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 500 }}>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': {
                      borderColor: '#0EA5E9',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0EA5E9',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0EA5E9',
                  },
                }}
              />

              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover fieldset': {
                      borderColor: '#0EA5E9',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0EA5E9',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0EA5E9',
                  },
                }}
              >
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
                  helperText={
                    touched.studentId && fieldErrors.studentId
                      ? fieldErrors.studentId
                      : 'Format: FA/SP + 2 digits - BCS/BBA/BSE - 3 digits'
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#0EA5E9',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0EA5E9',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#0EA5E9',
                    },
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#0EA5E9',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0EA5E9',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#0EA5E9',
                    },
                  }}
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
                  helperText={
                    touched.adminSecretCode && fieldErrors.adminSecretCode
                      ? fieldErrors.adminSecretCode
                      : 'Enter the admin secret code to register'
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#0EA5E9',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0EA5E9',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#0EA5E9',
                    },
                  }}
                />
              )}

              {/* Gradient button matching landing page */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)',
                  boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0284C7 0%, #0F766E 100%)',
                    boxShadow: '0 12px 32px rgba(14, 165, 233, 0.45)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #94A3B8 0%, #94A3B8 100%)',
                    color: 'white',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Link with brand color */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    sx={{
                      color: '#0EA5E9',
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Footer text */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </Container>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default RegisterPage;
