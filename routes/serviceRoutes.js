import express from 'express';
import {
  createService,
  getServices,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../utils/multerMiddleware.js';

const router = express.Router();

// Public route: anyone can fetch services
router.get('/', getServices);

// Admin-only routes
router.post(
  '/',
  protect,
  authorize('admin'), // you can pass string or array, your middleware handles both
  upload.single('image'), // expects 'image' field from frontend form
  createService
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.single('image'),
  updateService
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteService
);

export default router;
