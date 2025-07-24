import express from 'express';
import * as tailorController from '../controllers/tailorController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// --- TAILOR-SPECIFIC ROUTES ---
// Get own profile
router.get('/me', protect, authorize('tailor'), tailorController.getProfile);

// Update own profile with optional profileImage upload
router.put('/me', protect, authorize('tailor'), upload.single('profileImage'), tailorController.updateProfile);

// Get orders assigned to logged-in tailor
router.get('/me/orders', protect, authorize('tailor'), tailorController.getAssignedOrders);

// Get services assigned to logged-in tailor
router.get('/me/services', protect, authorize('tailor'), tailorController.getAssignedServices);

// Update order status for a specific assigned order
router.patch('/me/orders/:orderId', protect, authorize('tailor'), tailorController.updateOrderStatus);

// --- ADMIN-ONLY ROUTES ---
// Get all tailors
router.get('/', protect, authorize('admin'), tailorController.getTailors);

// Get available tailors
router.get('/available', protect, tailorController.getAvailableTailors);

// Toggle tailor availability
router.put('/:id/toggle-availability', protect, authorize('admin'), tailorController.toggleAvailability);

// Get specific tailor by ID
router.get('/:id', protect, authorize('admin'), tailorController.getTailorById);

// Update tailor by ID
router.put('/:id', protect, authorize('admin'), tailorController.updateTailor);

// Delete tailor by ID
router.delete('/:id', protect, authorize('admin'), tailorController.deleteTailor);

export default router;
