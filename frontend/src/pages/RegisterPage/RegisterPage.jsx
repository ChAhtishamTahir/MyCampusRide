import React, { useState } from 'react';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Link, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student',
    studentId: ''  // Add studentId field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateStudentId = (id) => {
    const pattern = /^(FA|SP)[0-9]{2}-(BCS|BBA|BSE)-[0-9]{3}$/;
    return pattern.test(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate Student ID if role is student
    if (formData.role === 'student') {
      if (!formData.studentId) {
        setError('Student ID is required');
        setLoading(false);
        return;
      }
      
      if (!validateStudentId(formData.studentId)) {
        setError('Student ID must follow the format: FA/SP + 2 digits - BCS/BBA/BSE - 3 digits (e.g., FA23-BCS-123)');
        setLoading(false);
        return;
      }
    }

    try {
      // Prepare registration data based on role
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      };

      // Add role-specific fields
      if (formData.role === 'driver') {
        // For drivers, license number is required during registration
        if (!formData.licenseNumber) {
          setError('License number is required for drivers');
          setLoading(false);
          return;
        }
        registrationData.licenseNumber = formData.licenseNumber;
      } else if (formData.role === 'student') {
        // For students, student ID is required during registration
        registrationData.studentId = formData.studentId;
      }

      const result = await register(registrationData);
      
      if (result.success) {
        // For drivers, they need approval before accessing dashboard
        if (result.user.role === 'driver' && result.user.status === 'pending') {
          // Show success message and redirect to login
          alert('Registration successful! Your driver account is pending admin approval. You will be able to access your dashboard once approved.');
          navigate('/login', { replace: true });
        } else {
          // For students and admins, redirect to their dashboard
          if (result.user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (result.user.role === 'student') {
            navigate('/student', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
      bgcolor: 'background.default'
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
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="phone"
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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
                </Select>
              </FormControl>

              {formData.role === 'student' && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="studentId"
                  label="Student ID"
                  name="studentId"
                  value={formData.studentId || ''}
                  onChange={handleChange}
                  placeholder="e.g., FA23-BCS-123"
                  helperText="Format: FA/SP + 2 digits - BCS/BBA/BSE - 3 digits"
                />
              )}

              {formData.role === 'driver' && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="licenseNumber"
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={handleChange}
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