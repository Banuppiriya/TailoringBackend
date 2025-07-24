import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * Protect middleware — Verifies JWT and attaches user to request
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Not authorized: No token provided' });
      }

      // Verify token and decode payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.id) {
        return res.status(401).json({ message: 'Not authorized: Invalid token payload' });
      }

      // Fetch user by ID, exclude password
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Not authorized: User not found' });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized: Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized: No token provided' });
  }
});

/**
 * Role-based access control middleware
 * @param {string|string[]} roles - Required role(s) to access route
 */
export const authorize = (roles = []) => {
  // Normalize single role string into array
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

/**
 * isAdmin middleware — Shortcut to authorize only admin users
 */
export const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admins only.' });
};
