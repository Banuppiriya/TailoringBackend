import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getOrderHistory,
  createOrder,
  getTailors,
  getAllUsers,
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected user routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/orders', protect, getOrderHistory);
router.post('/orders', protect, createOrder);

// Admin-only: Get all users
router.get('/all', protect, authorize('admin'), getAllUsers);

// Public route for getting tailors
// Consider protecting or authorizing if you want to restrict access
router.get('/tailors', getTailors);

export default router;
