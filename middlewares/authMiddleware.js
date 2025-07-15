import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * Middleware to protect routes (requires valid JWT)
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from Authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user without password
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Not authorized: User not found' });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized: Invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized: No token provided' });
  }
});

/**
 * Middleware to authorize specific user roles (e.g., admin, tailor)
 * @param {Array|string} roles - Allowed roles
 */
export const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized: No user in request' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied: Role '${req.user.role}' is not allowed`,
      });
    }

    next();
  };
};
// middleware/authMiddleware.js

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};
