import express from 'express';
import { createCheckoutSession, sendPaymentLink } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import role from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All users can create a checkout session
router.post('/create-checkout-session', protect, createCheckoutSession);

// Admins can send payment links
router.post('/send-payment-link/:orderId', protect, role('admin'), sendPaymentLink);

export default router;
