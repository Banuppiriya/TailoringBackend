import express from 'express';
import * as tailorController from '../controllers/tailorController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// --- TAILOR-SPECIFIC ROUTES ---
router.get('/me', protect, authorize('tailor'), tailorController.getProfile);
router.put('/me', protect, authorize('tailor'), upload.single('profileImage'), tailorController.updateProfile);
router.get('/me/orders', protect, authorize('tailor'), tailorController.getAssignedOrders);
router.patch('/me/orders/:orderId', protect, authorize('tailor'), tailorController.updateOrderStatus);

// --- ADMIN-ONLY ROUTES ---
router.get('/', protect, authorize('admin'), tailorController.getTailors);
router.get('/:id', protect, authorize('admin'), tailorController.getTailorById);
router.put('/:id', protect, authorize('admin'), tailorController.updateTailor);
router.delete('/:id', protect, authorize('admin'), tailorController.deleteTailor);

export default router;
