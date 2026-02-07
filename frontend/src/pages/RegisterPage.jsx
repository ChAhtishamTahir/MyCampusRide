import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  PersonAdd,
  Email,
  Lock,
  Phone,
  Badge,
  DirectionsCar,
  Home,
  PhoneAndroid,
  DirectionsBus,
  AttachMoney,
  EventSeat,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { routesAPI, busesAPI } from '../api/api';
import { validateEmail, validatePassword, validatePhone, validateRequired, validateConfirmPassword } from '../utils/validation';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [localError, setLocalError] = useState(null);
  
  // Get role from URL params, validate it
  const getRoleFromURL = () => {
    const roleParam = searchParams.get('role');
    if (['student', 'driver', 'admin'].includes(roleParam)) {
      return roleParam;
    }
    return 'student';
  };
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: getRoleFromURL(),
    phone: '',
    studentId: '',
    licenseNumber: '',
    routeNo: '',
    stopName: '',
    emergencyContact: '',
    address: '',
    feePaymentType: 'full',
    customInstallment: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    studentId: '',
    licenseNumber: '',
    routeNo: '',
    stopName: '',
    emergencyContact: '',
    address: '',
    customInstallment: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);

  // Load routes on component mount
  useEffect(() => {
    if (formData.role === 'student') {
      loadRoutes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.role]);

  // Load stops when route is selected
  useEffect(() => {
    if (formData.routeNo) {
      loadStops(formData.routeNo);
      loadBusInfo(formData.routeNo);
    } else {
      setStops([]);
      setSelectedBus(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.routeNo]);

  const loadRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const response = await routesAPI.getActiveRoutes();
      setRoutes(response.data.data || []);
    } catch (err) {
      console.error('Failed to load routes:', err);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const loadStops = async (routeId) => {
    try {
      const response = await routesAPI.getRoute(routeId);
      const route = response.data.data;
      setStops(route.stops || []);
    } catch (err) {
      console.error('Failed to load stops:', err);
      setStops([]);
    }
  };

  const loadBusInfo = async (routeId) => {
    try {
      setLoadingBuses(true);
      const response = await busesAPI.getBusesByRoute(routeId);
      const buses = response.data.data || [];
      if (buses.length > 0) {
        // Get the first active bus or any bus
        const bus = buses.find(b => b.isActive !== false) || buses[0];
        setSelectedBus(bus);
      } else {
        setSelectedBus(null);
      }
    } catch (err) {
      console.error('Failed to load bus info:', err);
      setSelectedBus(null);
    } finally {
      setLoadingBuses(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };

    if (name === 'routeNo') {
      newFormData.stopName = '';
    }

    setFormData(newFormData);
    setFieldErrors({
      ...fieldErrors,
      [name]: '',
    });
    if (error) clearError();
    if (localError) setLocalError(null);
  };

  // Calculate fee based on stop and payment type
  const getSelectedStopFee = () => {
    const selectedStop = stops.find(s => s.name === formData.stopName);
    return selectedStop?.fee || 0;
  };

  const calculateFee = () => {
    const baseFee = getSelectedStopFee();
    if (formData.feePaymentType === 'full') return baseFee;
    if (formData.feePaymentType === 'half') return baseFee / 2;
    if (formData.feePaymentType === 'custom') return Number(formData.customInstallment) || 0;
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameValidation = validateRequired(formData.name, 'Name');
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);
    const passwordValidation = validatePassword(formData.password);
    const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword);

    const newFieldErrors = {
      name: nameValidation.error,
      email: emailValidation.error,
      phone: phoneValidation.error,
      password: passwordValidation.error,
      confirmPassword: confirmPasswordValidation.error,
      studentId: '',
      licenseNumber: '',
      routeNo: '',
      stopName: '',
      emergencyContact: '',
      address: '',
      customInstallment: '',
    };

    if (formData.role === 'student') {
      const studentIdValidation = validateRequired(formData.studentId, 'Student ID');
      const routeValidation = validateRequired(formData.routeNo, 'Route');
      const stopValidation = validateRequired(formData.stopName, 'Stop');
      const emergencyContactValidation = validatePhone(formData.emergencyContact);
      const addressValidation = validateRequired(formData.address, 'Address');

      newFieldErrors.studentId = studentIdValidation.error;
      newFieldErrors.routeNo = routeValidation.error;
      newFieldErrors.stopName = stopValidation.error;
      newFieldErrors.emergencyContact = emergencyContactValidation.error;
      newFieldErrors.address = addressValidation.error;

      if (formData.feePaymentType === 'custom') {
        const customInstallmentValidation = validateRequired(formData.customInstallment, 'Custom amount');
        newFieldErrors.customInstallment = customInstallmentValidation.error;
      }
    } else if (formData.role === 'driver') {
      const licenseValidation = validateRequired(formData.licenseNumber, 'License number');
      newFieldErrors.licenseNumber = licenseValidation.error;
    }

    setFieldErrors(newFieldErrors);

    const hasErrors = Object.values(newFieldErrors).some(error => error !== '');
    if (hasErrors) {
      return;
    }

    setIsLoading(true);

    // Prepare data for API
    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
    };

    // Add role-specific fields
    if (formData.role === 'student') {
      submitData.studentId = formData.studentId;
      submitData.routeNo = formData.routeNo;
      submitData.stopName = formData.stopName;
      submitData.emergencyContact = formData.emergencyContact;
      submitData.address = formData.address;
      submitData.feePaymentType = formData.feePaymentType;
      if (formData.feePaymentType === 'custom') {
        submitData.customInstallment = formData.customInstallment;
      }
    } else if (formData.role === 'driver') {
      submitData.licenseNumber = formData.licenseNumber;
    }

    const result = await register(submitData);
    
    if (result.success) {
      // For drivers, they need approval before accessing dashboard
      if (result.user.role === 'driver' && result.user.status === 'pending') {
        // Show success message and redirect to login
        setLocalError(null);
        alert('Registration successful! Your driver account is pending admin approval. You will be able to access your dashboard once approved.');
        navigate('/login');
      } else {
        // For students and admins, redirect to their dashboard
        navigate(`/${result.user.role}-dashboard`);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join MyCampusRide and start managing your campus transport
            </Typography>
          </Box>

          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => { clearError(); setLocalError(null); }}>
              {error || localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonAdd color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!fieldErrors.phone}
                  helperText={fieldErrors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="driver">Driver</MenuItem>
                    <MenuItem value="admin">Administrator</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Role-specific fields */}
              {formData.role === 'student' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Student ID"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      error={!!fieldErrors.studentId}
                      helperText={fieldErrors.studentId}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Badge color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Transport Details */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 1, fontWeight: 600 }}>
                      Transport Details
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!fieldErrors.routeNo}>
                      <InputLabel>Route No</InputLabel>
                      <Select
                        name="routeNo"
                        value={formData.routeNo}
                        onChange={handleChange}
                        label="Route No"
                        disabled={loadingRoutes}
                      >
                        {routes.map((route) => (
                          <MenuItem key={route._id} value={route._id}>
                            {route.routeNo || route.routeName}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.routeNo && (
                        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                          {fieldErrors.routeNo}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!fieldErrors.stopName} disabled={!formData.routeNo || stops.length === 0}>
                      <InputLabel>Stop Name</InputLabel>
                      <Select
                        name="stopName"
                        value={formData.stopName}
                        onChange={handleChange}
                        label="Stop Name"
                      >
                        {stops.map((stop, index) => (
                          <MenuItem key={index} value={stop.name}>
                            {stop.name} - PKR {stop.fee || 0}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldErrors.stopName && (
                        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                          {fieldErrors.stopName}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Personal Details */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 1, fontWeight: 600 }}>
                      Personal Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      error={!!fieldErrors.address}
                      helperText={fieldErrors.address}
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Home color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Emergency Contact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      error={!!fieldErrors.emergencyContact}
                      helperText={fieldErrors.emergencyContact}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneAndroid color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Fee Information */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 1, fontWeight: 600 }}>
                      Fee Payment
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        name="feePaymentType"
                        value={formData.feePaymentType}
                        onChange={handleChange}
                      >
                        <FormControlLabel value="full" control={<Radio />} label="Pay in Full" />
                        <FormControlLabel value="half" control={<Radio />} label="Half Payment" />
                        <FormControlLabel value="custom" control={<Radio />} label="Custom" />
                      </RadioGroup>
                    </FormControl>
                    {formData.feePaymentType === 'custom' && (
                      <TextField
                        fullWidth
                        label="Custom Amount (PKR)"
                        name="customInstallment"
                        value={formData.customInstallment}
                        onChange={handleChange}
                        error={!!fieldErrors.customInstallment}
                        helperText={fieldErrors.customInstallment || "Custom payment plans require admin approval"}
                        sx={{ mt: 2 }}
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Grid>

                  {/* Fee Information Card */}
                  {formData.stopName && (
                    <Grid item xs={12}>
                      <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                            <AttachMoney />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Fee Information
                            </Typography>
                          </Box>
                          <Box display="flex" gap={2} flexWrap="wrap">
                            <Chip 
                              label={`Stop: ${formData.stopName}`}
                              sx={{ bgcolor: 'white', color: 'primary.main' }}
                            />
                            <Chip 
                              label={`Base Fee: PKR ${getSelectedStopFee()}`}
                              sx={{ bgcolor: 'white', color: 'primary.main' }}
                            />
                            <Chip 
                              label={`Payment: ${formData.feePaymentType === 'full' ? 'Full' : formData.feePaymentType === 'half' ? 'Half' : 'Custom'}`}
                              sx={{ bgcolor: 'white', color: 'primary.main' }}
                            />
                            <Chip 
                              label={`Total: PKR ${calculateFee()}`}
                              sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 700 }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* Bus Availability Card */}
                  {selectedBus && (
                    <Grid item xs={12}>
                      <Card sx={{ bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                            <EventSeat color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Bus Availability
                            </Typography>
                          </Box>
                          <Box display="flex" gap={2} flexWrap="wrap">
                            <Chip 
                              label={`Bus: ${selectedBus.busNumber}`}
                              color="primary"
                              icon={<DirectionsBus />}
                            />
                            <Chip 
                              label={`Total Seats: ${selectedBus.capacity || 'N/A'}`}
                              variant="outlined"
                            />
                            <Chip 
                              label={`Available: ${selectedBus.capacity - (selectedBus.currentPassengers || 0)}`}
                              color="success"
                            />
                          </Box>
                          <Alert severity="info" sx={{ mt: 2 }}>
                            Registration availability depends on seat capacity and existing registrations. All fees are paid offline at the admin office.
                          </Alert>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </>
              )}

              {formData.role === 'driver' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="License Number"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    error={!!fieldErrors.licenseNumber}
                    helperText={fieldErrors.licenseNumber}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DirectionsCar color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}

              {/* Password Fields */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Security
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!fieldErrors.confirmPassword}
                  helperText={fieldErrors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    mb: 3,
                    fontSize: '1.1rem',
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      <Typography>Creating your account...</Typography>
                    </Box>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Role Information */}
          <Box
            sx={{
              mt: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Role Information:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              • <strong>Student:</strong> View assigned bus, track location, manage transport card
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              • <strong>Driver:</strong> Manage trips, update locations (requires admin approval)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Admin:</strong> Manage entire transport system, approve drivers
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;




