import express from 'express';
import { saveContactMessage, getAllContactMessages } from '../controllers/contactController.js';
import { protect } from '../middlewares/authMiddleware.js';
import role from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public route: Save a new contact message
router.post('/', saveContactMessage);

// Admin only: Get all contact messages
router.get('/', protect, role('admin'), getAllContactMessages);

export default router;
