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

// ✅ Protected user routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/orders', protect, getOrderHistory);
router.post('/orders', protect, createOrder);


// ✅ Admin: Get all users
router.get('/all', getAllUsers);

// ✅ Public route (can also be protected if needed)
router.get('/tailors', getTailors);

export default router;
