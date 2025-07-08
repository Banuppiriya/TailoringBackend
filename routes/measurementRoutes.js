import express from 'express';
import {
  getMyMeasurements,
  saveOrUpdateMeasurements,
} from '../controllers/measurementController.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get current user's measurements (Customer only)
router.get('/my', protect, authorize('customer'), getMyMeasurements);

// Create or update measurements for current user (Customer only)
router.post('/my', protect, authorize('customer'), saveOrUpdateMeasurements);

export default router;
