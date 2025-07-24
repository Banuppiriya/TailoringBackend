import express from 'express';
import { getTailors } from '../controllers/userDashboardController.js';
import { getMyOrders } from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to get current user's orders
// GET /api/user/orders
router.get('/orders', protect, getMyOrders);

// Route to get available tailors (or tailors related to the user)
// GET /api/user/tailors
router.get('/tailors', protect, getTailors);

export default router;
