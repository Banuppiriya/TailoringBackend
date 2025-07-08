import express from 'express';
import {
  createService,
  getServices,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../utils/multerMiddleware.js';  // <-- import multer upload here
import { uploadImage } from '../utils/cloudinary.js';

const router = express.Router();

// Public routes (anyone can view services)
router.get('/', getServices);

// Admin-only routes
router.post(
  '/',
  protect,
  authorize(['admin']),
  upload.single('image'), // 'image' should match the field name in your form/frontend
  createService
);

router.put(
  '/:id',
  protect,
  authorize(['admin']),
  upload.single('image'), // 'image' should match the field name in your form/frontend
  updateService
);

router.delete(
  '/:id',
  protect,
  authorize(['admin']),
  deleteService
);

export default router;
