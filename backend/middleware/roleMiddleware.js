const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
        });
      }

      // Check if user status allows access
      if (req.user.status === 'pending' && req.user.role === 'driver') {
        return res.status(403).json({
          success: false,
          message: 'Account is pending approval. Please wait for administrator approval.'
        });
      }

      if (req.user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Account is suspended. Please contact administrator.'
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during authorization.'
      });
    }
  };
};

// Specific role middlewares for convenience
const adminOnly = roleMiddleware('admin');
const driverOnly = roleMiddleware('driver');
const studentOnly = roleMiddleware('student');
const adminOrDriver = roleMiddleware('admin', 'driver');
const adminOrStudent = roleMiddleware('admin', 'student');
const driverOrStudent = roleMiddleware('driver', 'student');

module.exports = {
  roleMiddleware,
  adminOnly,
  driverOnly,
  studentOnly,
  adminOrDriver,
  adminOrStudent,
  driverOrStudent
};




