import express from 'express';
import {
  getMyMeasurements,
  saveOrUpdateMeasurements,
} from '../controllers/measurementController.js';

import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/measurements/my
// Fetch logged-in customer's measurements
router.get('/my', protect, authorize('customer'), getMyMeasurements);

// POST /api/measurements/my
// Create or update logged-in customer's measurements
router.post('/my', protect, authorize('customer'), saveOrUpdateMeasurements);

export default router;
