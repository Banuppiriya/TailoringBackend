// roleMiddleware.js
const role = (...allowedRoles) => {
  return (req, res, next) => {
    // Debug logging
    console.log('Role Check - User:', {
      id: req.user?._id,
      role: req.user?.role,
      requiredRoles: allowedRoles
    });

    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`Access denied for user ${req.user._id}. Has role ${req.user.role}, needs one of:`, allowedRoles);
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        currentRole: req.user.role
      });
    }

    next();
  };
};

export default role;
