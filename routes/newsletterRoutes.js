import express from 'express';
import { subscribe, getAllSubscribers, unsubscribe } from '../controllers/newsletterController.js';
import { protect } from '../middlewares/authMiddleware.js';
import role from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public: Subscribe to newsletter
router.post('/subscribe', subscribe);

// Public: Unsubscribe from newsletter by email
router.get('/unsubscribe/:email', unsubscribe);

// Admin only: Get all subscribers
router.get('/subscribers', protect, role(['admin']), getAllSubscribers);

export default router;
