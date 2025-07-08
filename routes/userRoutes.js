import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';  // <-- fixed import
import role from '../middlewares/roleMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, userController.updateUserProfile);

// @route   GET /api/users/orders
// @desc    Get user order history
// @access  Private
router.get('/orders', protect, userController.getOrderHistory);

// @route   POST /api/users/orders
// @desc    Create a new order
// @access  Private
router.post('/orders', protect, userController.createOrder);

// @route   GET /api/users/tailors
// @desc    Get all tailors
// @access  Private/Admin
router.get('/tailors', protect, role('admin'), userController.getTailors);

export default router;
