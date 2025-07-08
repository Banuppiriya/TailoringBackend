// roleMiddleware.js
const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. You must be one of: ${allowedRoles.join(', ')}` });
    }
    next();
  };
};

export default role;
