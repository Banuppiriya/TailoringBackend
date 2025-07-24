import express from 'express';
import { getAllPayments } from '../controllers/adminPaymentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import role from '../middlewares/roleMiddleware.js';

const router = express.Router();

// GET /api/payments/ - Only accessible by admin users
router.get('/', protect, role('admin'), getAllPayments);

export default router;
