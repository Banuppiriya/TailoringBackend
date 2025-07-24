import express from 'express';
import { 
  createInitialPayment, 
  createFinalPayment, 
  verifyPayment, 
  getOrderPayments,
  checkOrderStatus
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import role from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Only customers can make payments
router.post('/initial', protect, role('customer'), createInitialPayment);
router.post('/final', protect, role('customer'), createFinalPayment);

// Verify payment (any authenticated user involved in payment)
router.post('/verify', protect, verifyPayment);

// Get payment history for an order (customer, tailor, admin allowed)
router.get('/order/:orderId', protect, getOrderPayments);

// Check order status (customer, tailor, admin allowed)
router.get('/status/:orderId', protect, checkOrderStatus);

export default router;
