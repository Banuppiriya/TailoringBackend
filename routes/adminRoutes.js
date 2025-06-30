import express from 'express';
import * as adminController from '../controllers/adminController.js';  // <== here
import auth from '../middlewares/authMiddleware.js';
import role from '../middlewares/roleMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Protect all admin routes with authentication and admin role check
router.use(auth);
router.use(role('admin'));

// Admin - Service management routes
router.post('/services', upload.single('image'), adminController.createService);
router.put('/services/:id', upload.single('image'), adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

// Admin - Order management routes
router.get('/orders', adminController.getOrders);
router.post('/orders/assign-tailor', adminController.assignTailor);
router.post('/orders/send-payment', adminController.sendPaymentRequest);

export default router;
