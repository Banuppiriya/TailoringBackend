import express from 'express';
import * as orderController from '../controllers/orderController.js';
import auth from '../middlewares/authMiddleware.js';
import role from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Auth required for all
router.use(auth);

// Admin only
router.get('/admin', role(['admin']), orderController.getAllOrders);
router.post('/assign-tailor', role(['admin']), orderController.assignTailor);
router.post('/send-payment', role(['admin']), orderController.sendPaymentRequest);

// Customer
router.get('/my-orders', role(['customer']), orderController.getCustomerOrders);

// Tailor
router.get('/tailor-orders', role(['tailor']), orderController.getTailorOrders);
router.put('/tailor-orders/:orderId', role(['tailor']), orderController.updateOrderStatus);

export default router;
