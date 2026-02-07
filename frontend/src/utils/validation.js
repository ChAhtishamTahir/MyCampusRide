export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.trim() === '') {
    return {
      valid: false,
      error: 'Email is required'
    };
  }

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Please enter a valid email address'
    };
  }

  return {
    valid: true,
    error: ''
  };
};

export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return {
      valid: false,
      strength: 'weak',
      error: 'Password is required'
    };
  }

  if (password.length < 6) {
    return {
      valid: false,
      strength: 'weak',
      error: 'Password must be at least 6 characters long'
    };
  }

  let strength = 'weak';
  if (password.length >= 12) {
    strength = 'strong';
  } else if (password.length >= 8) {
    strength = 'medium';
  }

  return {
    valid: true,
    strength,
    error: ''
  };
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(03[0-9]{9}|(\+92|0092)?3[0-9]{9})$/;

  if (!phone || phone.trim() === '') {
    return {
      valid: false,
      error: 'Phone number is required'
    };
  }

  const cleanPhone = phone.replace(/[\s-]/g, '');

  if (!phoneRegex.test(cleanPhone)) {
    return {
      valid: false,
      error: 'Please enter a valid phone number (e.g., 03001234567)'
    };
  }

  return {
    valid: true,
    error: ''
  };
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }

  return {
    valid: true,
    error: ''
  };
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return {
      valid: false,
      error: 'Please confirm your password'
    };
  }

  if (password !== confirmPassword) {
    return {
      valid: false,
      error: 'Passwords do not match'
    };
  }

  return {
    valid: true,
    error: ''
  };
};
